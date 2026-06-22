const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs-extra');
const { execSync } = require('child_process');
const cheerio = require('cheerio');
const sharp = require('sharp');
const crypto = require('crypto');

const ROOT_DIR = path.join(__dirname, '..', '..');
const DATA_FILE = path.join(ROOT_DIR, 'data', 'products.json');
const HTML_FILE = path.join(ROOT_DIR, 'products.html');
const GALLERY_DATA_FILE = path.join(ROOT_DIR, 'data', 'gallery.json');
const GALLERY_HTML_FILE = path.join(ROOT_DIR, 'gallery.html');
const GALLERY_ASSETS_DIR = path.join(ROOT_DIR, 'assets', 'gallery');

const PRODUCTS_ASSETS_DIR = path.join(ROOT_DIR, 'assets', 'products');

const CONTENT_DATA_FILE = path.join(ROOT_DIR, 'data', 'content.json');
const SEO_DATA_FILE = path.join(ROOT_DIR, 'data', 'seo.json');
const ALL_HTML_FILES = {
    index: path.join(ROOT_DIR, 'index.html'),
    about: path.join(ROOT_DIR, 'about.html'),
    services: path.join(ROOT_DIR, 'services.html'),
    products: path.join(ROOT_DIR, 'products.html'),
    gallery: path.join(ROOT_DIR, 'gallery.html'),
    contact: path.join(ROOT_DIR, 'contact.html')
};

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: false,
            contextIsolation: true
        }
    });

    mainWindow.loadFile(path.join(__dirname, 'ui', 'index.html'));
}

app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});

// IPC Handlers

// 1. Get Stats
ipcMain.handle('get-stats', async () => {
    let modifiedFiles = [];
    try {
        const status = execSync('git status --porcelain', { cwd: ROOT_DIR }).toString();
        modifiedFiles = status.split('\n').filter(line => line.trim().length > 0).map(line => line.trim().substring(3));
    } catch (e) {
        console.error('Git status error', e);
    }

    let productsCount = 0;
    try {
        if (fs.existsSync(DATA_FILE)) {
            const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
            productsCount = Object.keys(data).length;
        }
    } catch (e) {
        console.error('Error reading products count', e);
    }

    // Try to get last commit date
    let lastPublish = 'Never';
    try {
        lastPublish = execSync('git log -1 --format="%cd" --date=short', { cwd: ROOT_DIR }).toString().trim();
    } catch (e) { }

    return {
        status: modifiedFiles.length > 0 ? 'Pending Changes' : 'Up to Date',
        lastPublish,
        productsCount,
        modifiedFiles
    };
});

// 2. Read Products// --- PRODUCTS API HANDLERS ---
ipcMain.handle('read-products', async () => {
    if (fs.existsSync(DATA_FILE)) {
        return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    }
    return { lastUpdated: '', categories: [] };
});

ipcMain.handle('upload-product-image', async (event, filePath) => {
    try {
        if (!fs.existsSync(PRODUCTS_ASSETS_DIR)) {
            fs.mkdirSync(PRODUCTS_ASSETS_DIR, { recursive: true });
        }
        if (!filePath) throw new Error('Invalid file path.');
        if (!fs.existsSync(filePath)) throw new Error('File not found at: ' + filePath);

        const uniqueId = crypto.randomBytes(4).toString('hex');
        const timestamp = Date.now();
        const safeFilename = `brand_${timestamp}_${uniqueId}.webp`;
        const outputPath = path.join(PRODUCTS_ASSETS_DIR, safeFilename);

        await sharp(filePath)
            .resize(800, 600, { fit: 'cover' })
            .webp({ quality: 85 })
            .toFile(outputPath);

        return { success: true, imagePath: `/assets/products/${safeFilename}` };
    } catch (e) {
        console.error(e);
        return { success: false, error: e.message };
    }
});

ipcMain.handle('save-products', async (event, data) => {
    try {
        fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));

        let htmlContent = fs.readFileSync(HTML_FILE, 'utf8');
        const $ = cheerio.load(htmlContent);

        // Generate dynamic HTML
        let outputHtml = `
            <div class="products-header text-center" style="margin-bottom: 2rem;">
                <p class="text-muted">Last Updated: <strong>${data.lastUpdated}</strong></p>
                <div style="margin: 2rem auto; max-width: 600px;">
                    <input type="text" id="productSearch" class="form-control" placeholder="Search brands or categories..." style="padding: 1rem; font-size: 1.1rem; border-radius: 30px;">
                </div>
            </div>
            
            <div class="category-tabs" style="display: flex; justify-content: center; gap: 1rem; margin-bottom: 3rem; flex-wrap: wrap;">
        `;

        data.categories.forEach((cat, index) => {
            const activeClass = index === 0 ? 'active' : '';
            const btnStyle = `padding: 0.75rem 2rem; border-radius: 30px; font-weight: bold; border: 2px solid var(--color-primary); cursor: pointer; transition: 0.3s;`;
            outputHtml += `<button class="cat-tab-btn ${activeClass}" data-target="cat-${cat.id}" style="${btnStyle}">${cat.name.toUpperCase()}</button>`;
        });

        outputHtml += `</div><div class="categories-content">`;

        data.categories.forEach((cat, index) => {
            const display = index === 0 ? 'grid' : 'none';
            outputHtml += `<div id="cat-${cat.id}" class="cat-pane" style="display: ${display}; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem;">`;

            cat.brands.forEach(brand => {
                const rateText = brand.showRate ? `₹${brand.rate} <span style="font-size:1rem; color:var(--color-text-main);">/ ${brand.unit}</span>` : 'Contact For Latest Price';
                const rateStyle = brand.showRate ? 'font-size: 1.5rem; font-weight: bold; color: var(--color-accent);' : 'font-size: 1.2rem; font-weight: bold; color: var(--color-primary);';
                
                const inquiryMsg = encodeURIComponent(`Hello Rampushpa Agro,\n\nI am interested in:\nProduct: ${cat.name}\nBrand: ${brand.name}\n\nPlease share details and current pricing.`);
                const whatsappLink = `https://wa.me/919422931794?text=${inquiryMsg}`;

                const imgHtml = brand.image 
                    ? `<img src="${brand.image}" alt="${brand.name}" style="width: 100%; height: 200px; object-fit: cover;" loading="lazy">`
                    : `<div style="width: 100%; height: 200px; background: #e2e8f0; display:flex; align-items:center; justify-content:center; color:#64748b;">No Image</div>`;

                outputHtml += `
                    <div class="brand-card fade-in-up search-item" data-name="${brand.name.toLowerCase()}" data-category="${cat.name.toLowerCase()}" style="background: white; border-radius: var(--border-radius-md); overflow: hidden; box-shadow: var(--shadow-md); border: 1px solid var(--color-border); display:flex; flex-direction:column;">
                        ${imgHtml}
                        <div class="brand-info" style="padding: 1.5rem; flex-grow: 1; display:flex; flex-direction:column;">
                            <h3 style="color: var(--color-primary); margin-bottom: 0.5rem;">${brand.name}</h3>
                            <p class="text-muted" style="margin-bottom: 1rem; flex-grow: 1;">${brand.description}</p>
                            
                            <div style="background: #f8f9fa; padding: 1rem; border-radius: 8px; margin-bottom: 1.5rem; text-align:center;">
                                <div style="${rateStyle} margin-bottom: 0.5rem;">${rateText}</div>
                                <div style="display: inline-block; padding: 0.25rem 0.75rem; border-radius: 20px; font-size: 0.85rem; font-weight: bold; background: ${brand.available ? '#dcfce7' : '#fee2e2'}; color: ${brand.available ? '#166534' : '#991b1b'};">
                                    ${brand.available ? 'In Stock' : 'Out of Stock'}
                                </div>
                            </div>
                            
                            <a href="${whatsappLink}" target="_blank" class="btn btn-primary" style="width: 100%; text-align:center;">Get Quote</a>
                        </div>
                    </div>
                `;
            });

            outputHtml += `</div>`;
        });

        outputHtml += `</div>
        <script>
            // Tab Logic
            document.querySelectorAll('.cat-tab-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    document.querySelectorAll('.cat-tab-btn').forEach(b => {
                        b.classList.remove('active');
                        b.style.background = 'transparent';
                        b.style.color = 'var(--color-primary)';
                    });
                    document.querySelectorAll('.cat-pane').forEach(p => p.style.display = 'none');
                    
                    btn.classList.add('active');
                    btn.style.background = 'var(--color-primary)';
                    btn.style.color = 'white';
                    
                    const target = btn.getAttribute('data-target');
                    document.getElementById(target).style.display = 'grid';
                });
            });
            // Init styles
            if(document.querySelector('.cat-tab-btn.active')) {
                document.querySelector('.cat-tab-btn.active').style.background = 'var(--color-primary)';
                document.querySelector('.cat-tab-btn.active').style.color = 'white';
            }

            // Search Logic
            document.getElementById('productSearch').addEventListener('input', (e) => {
                const term = e.target.value.toLowerCase();
                document.querySelectorAll('.search-item').forEach(item => {
                    const name = item.getAttribute('data-name');
                    const cat = item.getAttribute('data-category');
                    if(name.includes(term) || cat.includes(term)) {
                        item.style.display = 'flex';
                    } else {
                        item.style.display = 'none';
                    }
                });
            });
        </script>
        `;

        $('#dynamic-products-container').html(outputHtml);
        fs.writeFileSync(HTML_FILE, $.html());

        return { success: true };
    } catch (e) {
        console.error(e);
        return { success: false, error: e.message };
    }
});

// 4. Preview
ipcMain.handle('preview-website', (event, page) => {
    let previewWindow = new BrowserWindow({
        width: 1024,
        height: 768,
        webPreferences: { nodeIntegration: false }
    });
    const targetFile = page === 'gallery' ? GALLERY_HTML_FILE : HTML_FILE;
    previewWindow.loadFile(targetFile);
});

// --- GALLERY API HANDLERS ---
function generateGalleryHtml(galleryData) {
    if (!fs.existsSync(GALLERY_HTML_FILE)) return;
    let htmlContent = fs.readFileSync(GALLERY_HTML_FILE, 'utf8');
    const $ = cheerio.load(htmlContent);

    let galleryHtml = '';
    
    galleryData.categories.forEach(category => {
        if (!category.images || category.images.length === 0) return; // Skip empty categories

        galleryHtml += `
            <div class="gallery-category fade-in-up" style="margin-bottom: 3rem;">
                <h3>${category.name}</h3>
                <p>${category.description}</p>
                <div class="gallery-grid">
        `;
        
        category.images.forEach(img => {
            galleryHtml += `
                    <div class="gallery-item" style="border-radius: var(--border-radius-md); overflow: hidden; box-shadow: var(--shadow-sm);">
                        <img src="/assets/gallery/${img.file}" alt="${category.name} Image" style="width: 100%; height: 100%; object-fit: cover; aspect-ratio: 4/3;" loading="lazy">
                    </div>
            `;
        });
        
        galleryHtml += `
                </div>
            </div>
        `;
    });

    const containerId = '#dynamic-gallery-container';
    if ($(containerId).length > 0) {
        $(containerId).html(galleryHtml);
    } else {
        const oldCategory = $('.gallery-category').first();
        if (oldCategory.length > 0) {
            oldCategory.before(`<div id="dynamic-gallery-container">${galleryHtml}</div>`);
            $('.gallery-category:not(:first)').remove(); // remove old ones
            oldCategory.remove();
        }
    }

    fs.writeFileSync(GALLERY_HTML_FILE, $.html());
}

ipcMain.handle('read-gallery', async () => {
    if (fs.existsSync(GALLERY_DATA_FILE)) {
        return JSON.parse(fs.readFileSync(GALLERY_DATA_FILE, 'utf8'));
    }
    return { categories: [] };
});

ipcMain.handle('upload-image', async (event, categoryId, filePath) => {
    try {
        if (!fs.existsSync(GALLERY_ASSETS_DIR)) fs.mkdirSync(GALLERY_ASSETS_DIR, { recursive: true });
        
        const galleryData = JSON.parse(fs.readFileSync(GALLERY_DATA_FILE, 'utf8'));
        const category = galleryData.categories.find(c => c.id === categoryId);
        if (!category) throw new Error('Category not found');

        const uniqueId = crypto.randomBytes(4).toString('hex');
        const timestamp = Date.now();
        const safeFilename = `gallery_${timestamp}_${uniqueId}.webp`;
        if (!filePath) throw new Error('Invalid file path. Please ensure you are dragging a valid file.');
        if (!fs.existsSync(filePath)) throw new Error('File not found at: ' + filePath);

        await sharp(filePath)
            .resize(1920, null, { withoutEnlargement: true })
            .webp({ quality: 85 })
            .toFile(outputPath);

        const stats = fs.statSync(outputPath);
        const newImage = {
            id: uniqueId,
            file: safeFilename,
            size: stats.size,
            added: new Date().toISOString()
        };

        if (!category.images) category.images = [];
        category.images.push(newImage);

        fs.writeFileSync(GALLERY_DATA_FILE, JSON.stringify(galleryData, null, 2));
        generateGalleryHtml(galleryData);

        return { success: true, image: newImage };
    } catch (e) {
        console.error(e);
        return { success: false, error: e.message };
    }
});

function backupGalleryState() {
    const backupDir = path.join(ROOT_DIR, 'backups');
    if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir);
    const date = new Date();
    const timestamp = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}-${String(date.getHours()).padStart(2, '0')}-${String(date.getMinutes()).padStart(2, '0')}`;
    const currentBackup = path.join(backupDir, timestamp);
    if (!fs.existsSync(currentBackup)) fs.mkdirSync(currentBackup);
    
    fs.copyFileSync(GALLERY_DATA_FILE, path.join(currentBackup, 'gallery.json'));
    fs.copyFileSync(GALLERY_HTML_FILE, path.join(currentBackup, 'gallery.html'));
}

ipcMain.handle('delete-image', async (event, categoryId, imageId) => {
    try {
        backupGalleryState();
        const galleryData = JSON.parse(fs.readFileSync(GALLERY_DATA_FILE, 'utf8'));
        const category = galleryData.categories.find(c => c.id === categoryId);
        if (!category || !category.images) throw new Error('Category not found');

        const imageIndex = category.images.findIndex(img => img.id === imageId);
        if (imageIndex === -1) throw new Error('Image not found');

        const image = category.images[imageIndex];
        const filePath = path.join(GALLERY_ASSETS_DIR, image.file);
        
        category.images.splice(imageIndex, 1);
        
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        fs.writeFileSync(GALLERY_DATA_FILE, JSON.stringify(galleryData, null, 2));
        generateGalleryHtml(galleryData);

        return { success: true };
    } catch (e) {
        console.error(e);
        return { success: false, error: e.message };
    }
});

ipcMain.handle('replace-image', async (event, categoryId, imageId, newFilePath) => {
    try {
        backupGalleryState();
        const galleryData = JSON.parse(fs.readFileSync(GALLERY_DATA_FILE, 'utf8'));
        const category = galleryData.categories.find(c => c.id === categoryId);
        if (!category || !category.images) throw new Error('Category not found');

        const imageIndex = category.images.findIndex(img => img.id === imageId);
        if (imageIndex === -1) throw new Error('Image not found');

        const image = category.images[imageIndex];
        const oldFilePath = path.join(GALLERY_ASSETS_DIR, image.file);
        
        // Remove old
        if (fs.existsSync(oldFilePath)) fs.unlinkSync(oldFilePath);

        // Process new
        const uniqueId = crypto.randomBytes(4).toString('hex');
        const timestamp = Date.now();
        const safeFilename = `gallery_${timestamp}_${uniqueId}.webp`;
        const outputPath = path.join(GALLERY_ASSETS_DIR, safeFilename);

        await sharp(newFilePath)
            .resize(1920, null, { withoutEnlargement: true })
            .webp({ quality: 85 })
            .toFile(outputPath);

        const stats = fs.statSync(outputPath);
        
        // Update data
        category.images[imageIndex] = {
            id: uniqueId,
            file: safeFilename,
            size: stats.size,
            added: new Date().toISOString()
        };

        fs.writeFileSync(GALLERY_DATA_FILE, JSON.stringify(galleryData, null, 2));
        generateGalleryHtml(galleryData);

        return { success: true };
    } catch (e) {
        console.error(e);
        return { success: false, error: e.message };
    }
});

ipcMain.handle('reorder-images', async (event, categoryId, newOrderIds) => {
    try {
        const galleryData = JSON.parse(fs.readFileSync(GALLERY_DATA_FILE, 'utf8'));
        const category = galleryData.categories.find(c => c.id === categoryId);
        if (!category || !category.images) throw new Error('Category not found');

        // Reorder array based on IDs
        const newImages = [];
        newOrderIds.forEach(id => {
            const img = category.images.find(i => i.id === id);
            if (img) newImages.push(img);
        });
        
        category.images = newImages;

        fs.writeFileSync(GALLERY_DATA_FILE, JSON.stringify(galleryData, null, 2));
        generateGalleryHtml(galleryData);

        return { success: true };
    } catch (e) {
        console.error(e);
        return { success: false, error: e.message };
    }
});

// --- CMS & SEO API HANDLERS ---
ipcMain.handle('read-content', async () => {
    if (fs.existsSync(CONTENT_DATA_FILE)) return JSON.parse(fs.readFileSync(CONTENT_DATA_FILE, 'utf8'));
    return {};
});

ipcMain.handle('read-seo', async () => {
    if (fs.existsSync(SEO_DATA_FILE)) return JSON.parse(fs.readFileSync(SEO_DATA_FILE, 'utf8'));
    return {};
});

ipcMain.handle('save-content', async (event, contentData) => {
    try {
        fs.writeFileSync(CONTENT_DATA_FILE, JSON.stringify(contentData, null, 2));

        for (const [pageKey, filePath] of Object.entries(ALL_HTML_FILES)) {
            if (!fs.existsSync(filePath)) continue;
            let htmlContent = fs.readFileSync(filePath, 'utf8');
            const $ = cheerio.load(htmlContent);

            // 1. Direct ID Injection
            for (const [moduleName, fields] of Object.entries(contentData)) {
                for (const [fieldKey, value] of Object.entries(fields)) {
                    const prefix = moduleName === 'homepage' ? 'home' : moduleName;
                    const elId = `#cms-${prefix}-${fieldKey}`;
                    if ($(elId).length > 0) {
                        if ($(elId).is('a')) $(elId).text(value).attr('href', $(elId).attr('href')); // keep href if exists
                        else $(elId).text(value);
                    }
                }
            }

            // 2. Global Contact Replacement
            const c = contentData.contact;
            if (c) {
                // Footer Updates
                $('.footer-contact a[href^="mailto:"]').text(c.email).attr('href', 'mailto:' + c.email);
                const phoneP = $('.footer-contact p').filter(function() { return $(this).text().includes('Phone:'); });
                if (phoneP.length > 0) {
                    phoneP.html(`Phone: <a href="tel:${c.primaryMobile.replace(/\\s+/g, '')}">${c.primaryMobile}</a> , <a href="tel:${c.secondaryMobile.replace(/\\s+/g, '')}">${c.secondaryMobile}</a>`);
                }
            }

            fs.writeFileSync(filePath, $.html());
        }
        return { success: true };
    } catch (e) {
        console.error(e);
        return { success: false, error: e.message };
    }
});

ipcMain.handle('save-seo', async (event, seoData) => {
    try {
        fs.writeFileSync(SEO_DATA_FILE, JSON.stringify(seoData, null, 2));
        
        for (const [pageKey, filePath] of Object.entries(ALL_HTML_FILES)) {
            if (!fs.existsSync(filePath)) continue;
            const data = seoData[pageKey];
            if (!data) continue;

            let htmlContent = fs.readFileSync(filePath, 'utf8');
            const $ = cheerio.load(htmlContent);

            if (data.title) $('title').text(data.title);
            if (data.description) $('meta[name="description"]').attr('content', data.description);
            if (data.keywords) $('meta[name="keywords"]').attr('content', data.keywords);
            if (data.ogTitle) $('meta[property="og:title"]').attr('content', data.ogTitle);
            if (data.ogDescription) $('meta[property="og:description"]').attr('content', data.ogDescription);
            if (data.canonicalUrl) $('link[rel="canonical"]').attr('href', data.canonicalUrl);

            fs.writeFileSync(filePath, $.html());
        }
        return { success: true };
    } catch (e) {
        console.error(e);
        return { success: false, error: e.message };
    }
});

// 5. Publish Website
ipcMain.handle('publish-website', async () => {
    try {
        // Step 1: Backup
        const backupDir = path.join(ROOT_DIR, 'backups');
        if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir);

        const date = new Date();
        const timestamp = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}-${String(date.getHours()).padStart(2, '0')}-${String(date.getMinutes()).padStart(2, '0')}`;
        const currentBackup = path.join(backupDir, timestamp);
        fs.mkdirSync(currentBackup);

        // Copy modified files to backup
        fs.copyFileSync(DATA_FILE, path.join(currentBackup, 'products.json'));
        fs.copyFileSync(HTML_FILE, path.join(currentBackup, 'products.html'));
        if (fs.existsSync(GALLERY_DATA_FILE)) fs.copyFileSync(GALLERY_DATA_FILE, path.join(currentBackup, 'gallery.json'));
        if (fs.existsSync(GALLERY_HTML_FILE)) fs.copyFileSync(GALLERY_HTML_FILE, path.join(currentBackup, 'gallery.html'));
        if (fs.existsSync(CONTENT_DATA_FILE)) fs.copyFileSync(CONTENT_DATA_FILE, path.join(currentBackup, 'content.json'));
        if (fs.existsSync(SEO_DATA_FILE)) fs.copyFileSync(SEO_DATA_FILE, path.join(currentBackup, 'seo.json'));

        // Step 2: Git operations
        execSync('git add .', { cwd: ROOT_DIR });
        execSync(`git commit -m "Manager Update - ${timestamp}"`, { cwd: ROOT_DIR });
        execSync('git push origin main', { cwd: ROOT_DIR });

        return { success: true };
    } catch (e) {
        console.error(e);
        return { success: false, error: e.message };
    }
});

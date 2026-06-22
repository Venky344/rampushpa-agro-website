const logBox = document.getElementById('log-box');
function log(msg) {
    const time = new Date().toLocaleTimeString();
    logBox.textContent += `\n[${time}] ${msg}`;
    logBox.scrollTop = logBox.scrollHeight;
}

// --- TAB LOGIC ---
const tabBtns = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        tabBtns.forEach(b => b.classList.remove('active'));
        tabContents.forEach(c => c.classList.remove('active'));
        
        btn.classList.add('active');
        document.getElementById(btn.dataset.target).classList.add('active');

        // Toggle Stats
        if (btn.dataset.target === 'products-tab') {
            document.getElementById('main-stats').style.display = 'grid';
            document.getElementById('gallery-stats').style.display = 'none';
        } else {
            document.getElementById('main-stats').style.display = 'none';
            document.getElementById('gallery-stats').style.display = 'grid';
        }
    });
});


// --- SHARED DATA ---
let currentData = {};
let galleryData = { categories: [] };
let contentData = {};
let seoData = {};
const defaultProducts = ['wheat', 'jowar', 'bajra', 'chana'];

async function loadData() {
    log('Loading dashboard data...');
    try {
        currentData = await window.api.readProducts();
        galleryData = await window.api.readGallery();
        contentData = await window.api.readContent();
        seoData = await window.api.readSeo();
        const stats = await window.api.getStats();

        // Update Stats
        document.getElementById('stat-products').textContent = stats.productsCount;
        document.getElementById('stat-modified').textContent = stats.modifiedFiles.length;
        document.getElementById('stat-last-publish').textContent = stats.lastPublish;
        
        let totalImages = 0;
        let totalSize = 0;
        galleryData.categories.forEach(c => {
            if (c.images) {
                totalImages += c.images.length;
                totalSize += c.images.reduce((acc, img) => acc + (img.size || 0), 0);
            }
        });
        document.getElementById('stat-images').textContent = totalImages;
        document.getElementById('stat-storage').textContent = (totalSize / (1024 * 1024)).toFixed(2) + ' MB';

        const statusBadge = document.getElementById('status-badge');
        statusBadge.textContent = stats.status;
        if(stats.status === 'Pending Changes') {
            statusBadge.style.background = '#fef08a';
            statusBadge.style.color = '#854d0e';
        } else {
            statusBadge.style.background = '#dcfce7';
            statusBadge.style.color = '#166534';
        }

        renderCategories();
        renderGallery();
        populateCmsForm();
        populateSeoForm('index'); // load index by default
        log('Data loaded successfully.');
    } catch (e) {
        log('Error loading data: ' + e.message);
    }
}


// --- PRODUCTS LOGIC ---
let activeCategoryId = null;

function renderCategories() {
    const list = document.getElementById('categories-list');
    list.innerHTML = '';
    
    if (!currentData.categories) currentData.categories = [];
    
    currentData.categories.forEach(cat => {
        const li = document.createElement('li');
        li.style = `padding: 0.75rem; border: 1px solid var(--border-color); border-radius: 4px; margin-bottom: 0.5rem; display: flex; justify-content: space-between; align-items: center; cursor: pointer; background: ${activeCategoryId === cat.id ? 'var(--color-primary)' : 'white'}; color: ${activeCategoryId === cat.id ? 'white' : 'var(--text-main)'};`;
        
        const nameSpan = document.createElement('span');
        nameSpan.textContent = cat.name;
        nameSpan.style.flexGrow = 1;
        nameSpan.onclick = () => {
            activeCategoryId = cat.id;
            renderCategories();
            renderBrands();
        };

        const delBtn = document.createElement('button');
        delBtn.innerHTML = '🗑️';
        delBtn.style = 'background:none; border:none; cursor:pointer; color:inherit; margin-left: 0.5rem;';
        delBtn.onclick = (e) => {
            e.stopPropagation();
            if(confirm(`Delete category ${cat.name}?`)) {
                currentData.categories = currentData.categories.filter(c => c.id !== cat.id);
                if(activeCategoryId === cat.id) activeCategoryId = null;
                renderCategories();
                renderBrands();
            }
        };

        li.appendChild(nameSpan);
        li.appendChild(delBtn);
        list.appendChild(li);
    });

    if(!activeCategoryId && currentData.categories.length > 0) {
        activeCategoryId = currentData.categories[0].id;
        renderCategories(); // re-render to set active style
        renderBrands();
    }
}

function renderBrands() {
    const grid = document.getElementById('brands-grid');
    const title = document.getElementById('brands-panel-title');
    const addBtn = document.getElementById('add-brand-btn');
    grid.innerHTML = '';

    if (!activeCategoryId) {
        title.textContent = 'Select a Category';
        addBtn.style.display = 'none';
        return;
    }

    const cat = currentData.categories.find(c => c.id === activeCategoryId);
    if (!cat) return;

    title.textContent = `${cat.name} Brands`;
    addBtn.style.display = 'inline-block';

    if (!cat.brands) cat.brands = [];

    cat.brands.forEach(brand => {
        const imgStyle = brand.image ? `background-image: url('${brand.image}'); background-size: cover; background-position: center;` : 'background: #f1f5f9; display:flex; align-items:center; justify-content:center;';
        const imgContent = brand.image ? '' : '<span style="color:#64748b; font-size:0.8rem;">No Image</span>';
        
        const html = `
            <div style="border: 1px solid var(--border-color); border-radius: 8px; overflow: hidden; display: flex; flex-direction: column;">
                <div style="height: 120px; ${imgStyle}">${imgContent}</div>
                <div style="padding: 1rem; flex-grow: 1;">
                    <h4 style="margin-bottom: 0.5rem;">${brand.name}</h4>
                    <div style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 0.5rem;">₹${brand.rate} / ${brand.unit}</div>
                    <div style="font-size: 0.75rem; padding: 0.2rem 0.5rem; display:inline-block; border-radius: 10px; background: ${brand.available ? '#dcfce7' : '#fee2e2'}; color: ${brand.available ? '#166534' : '#991b1b'};">${brand.available ? 'In Stock' : 'Out of Stock'}</div>
                </div>
                <div style="display:flex; border-top: 1px solid var(--border-color);">
                    <button class="edit-brand-btn" data-id="${brand.id}" style="flex:1; padding: 0.5rem; background:none; border:none; cursor:pointer; border-right: 1px solid var(--border-color); font-size: 0.9rem;">✏️ Edit</button>
                    <button class="del-brand-btn" data-id="${brand.id}" style="flex:1; padding: 0.5rem; background:none; border:none; cursor:pointer; font-size: 0.9rem; color: #dc2626;">🗑️ Delete</button>
                </div>
            </div>
        `;
        grid.insertAdjacentHTML('beforeend', html);
    });

    grid.querySelectorAll('.edit-brand-btn').forEach(btn => {
        btn.onclick = () => openBrandModal(btn.getAttribute('data-id'));
    });
    grid.querySelectorAll('.del-brand-btn').forEach(btn => {
        btn.onclick = () => {
            if(confirm('Delete this brand?')) {
                cat.brands = cat.brands.filter(b => b.id !== btn.getAttribute('data-id'));
                renderBrands();
            }
        };
    });
}

document.getElementById('add-category-btn').addEventListener('click', (e) => {
    e.preventDefault();
    const name = prompt('Enter Category Name:');
    if(name && name.trim()) {
        const id = 'cat-' + Date.now();
        if(!currentData.categories) currentData.categories = [];
        currentData.categories.push({ id, name: name.trim(), brands: [] });
        activeCategoryId = id;
        renderCategories();
        renderBrands();
    }
});

// Brand Modal Logic
const modal = document.getElementById('brand-modal');

document.getElementById('add-brand-btn').addEventListener('click', (e) => {
    e.preventDefault();
    openBrandModal(null);
});

document.getElementById('close-brand-modal').addEventListener('click', (e) => {
    e.preventDefault();
    modal.style.display = 'none';
});

function openBrandModal(brandId) {
    const form = document.getElementById('brand-form');
    form.reset();
    document.getElementById('brand-image-preview').style.backgroundImage = '';
    document.getElementById('brand-image-preview').innerHTML = '<span style="color:#64748b;">No Image Selected</span>';
    document.getElementById('brand-image-path').value = '';

    if (brandId) {
        document.getElementById('brand-modal-title').textContent = 'Edit Brand';
        const cat = currentData.categories.find(c => c.id === activeCategoryId);
        const brand = cat.brands.find(b => b.id === brandId);
        
        document.getElementById('brand-id').value = brand.id;
        document.getElementById('brand-name').value = brand.name;
        document.getElementById('brand-description').value = brand.description;
        document.getElementById('brand-rate').value = brand.rate;
        document.getElementById('brand-unit').value = brand.unit;
        document.getElementById('brand-show-rate').checked = brand.showRate;
        document.getElementById('brand-available').checked = brand.available;
        
        if (brand.image) {
            document.getElementById('brand-image-path').value = brand.image;
            document.getElementById('brand-image-preview').innerHTML = '';
            document.getElementById('brand-image-preview').style.backgroundImage = `url('${brand.image}')`;
            document.getElementById('brand-image-preview').style.backgroundSize = 'cover';
            document.getElementById('brand-image-preview').style.backgroundPosition = 'center';
        }
    } else {
        document.getElementById('brand-modal-title').textContent = 'Add Brand';
        document.getElementById('brand-id').value = '';
        document.getElementById('brand-show-rate').checked = true;
        document.getElementById('brand-available').checked = true;
    }
    
    modal.style.display = 'flex';
}

document.getElementById('brand-image-upload').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if(!file) return;
    
    const originalBtnText = document.getElementById('brand-modal-title').textContent;
    document.getElementById('brand-modal-title').textContent = 'Uploading...';
    
    try {
        const res = await window.api.uploadProductImage(file.path);
        if (res.success) {
            document.getElementById('brand-image-path').value = res.imagePath;
            document.getElementById('brand-image-preview').innerHTML = '';
            document.getElementById('brand-image-preview').style.backgroundImage = `url('${res.imagePath}')`;
            document.getElementById('brand-image-preview').style.backgroundSize = 'cover';
            document.getElementById('brand-image-preview').style.backgroundPosition = 'center';
        } else alert('Upload failed: ' + res.error);
    } catch(e) { alert('Error: ' + e.message); }
    
    document.getElementById('brand-modal-title').textContent = originalBtnText;
});

document.getElementById('brand-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const cat = currentData.categories.find(c => c.id === activeCategoryId);
    if (!cat) return;

    const brandId = document.getElementById('brand-id').value || 'brand-' + Date.now();
    const brandData = {
        id: brandId,
        name: document.getElementById('brand-name').value,
        description: document.getElementById('brand-description').value,
        rate: parseInt(document.getElementById('brand-rate').value) || 0,
        unit: document.getElementById('brand-unit').value,
        showRate: document.getElementById('brand-show-rate').checked,
        available: document.getElementById('brand-available').checked,
        image: document.getElementById('brand-image-path').value
    };

    const existingIndex = cat.brands.findIndex(b => b.id === brandId);
    if (existingIndex >= 0) {
        cat.brands[existingIndex] = brandData;
    } else {
        cat.brands.push(brandData);
    }

    modal.style.display = 'none';
    renderBrands();
});

document.getElementById('save-products-btn').addEventListener('click', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('save-products-btn');
    btn.textContent = 'Saving...'; btn.disabled = true;

    // Update last update date
    const d = new Date();
    currentData.lastUpdated = `${d.getDate()}-${d.toLocaleString('default', { month: 'short' })}-${d.getFullYear()}`;

    try {
        const res = await window.api.saveProducts(currentData);
        if (res.success) {
            log('Products saved and products.html generated successfully.');
            await loadData();
        } else log('Error saving: ' + res.error);
    } catch (e) { log('Error: ' + e.message); }
    btn.textContent = '💾 Save & Generate HTML'; btn.disabled = false;
});

document.getElementById('preview-products-btn').addEventListener('click', (e) => {
    e.preventDefault();
    window.api.previewWebsite('products');
    log('Opened products preview.');
});


// --- GALLERY LOGIC ---
const uploadZone = document.getElementById('upload-zone');
const fileInput = document.getElementById('file-input');
const browseBtn = document.getElementById('browse-btn');
const categorySelect = document.getElementById('upload-category');

// Drag and Drop
uploadZone.addEventListener('dragover', e => { e.preventDefault(); uploadZone.classList.add('dragover'); });
uploadZone.addEventListener('dragleave', () => uploadZone.classList.remove('dragover'));
uploadZone.addEventListener('drop', async e => {
    e.preventDefault();
    uploadZone.classList.remove('dragover');
    handleFiles(e.dataTransfer.files);
});

browseBtn.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', e => handleFiles(e.target.files));

async function handleFiles(files) {
    const categoryId = categorySelect.value;
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!file.type.startsWith('image/')) continue;
        
        log(`Uploading ${file.name}...`);
        const res = await window.api.uploadImage(categoryId, file.path);
        if (res.success) {
            log(`Success: ${file.name} uploaded and optimized.`);
        } else {
            log(`Failed to upload ${file.name}: ` + res.error);
        }
    }
    await loadData();
}

document.getElementById('preview-gallery-btn').addEventListener('click', (e) => {
    e.preventDefault();
    window.api.previewWebsite('gallery');
    log('Opened gallery preview.');
});

// Create hidden input for replacing
const replaceInput = document.createElement('input');
replaceInput.type = 'file';
replaceInput.accept = 'image/jpeg, image/png, image/webp';
let currentReplaceCategoryId = null;
let currentReplaceImageId = null;

replaceInput.addEventListener('change', async (e) => {
    if (e.target.files.length > 0 && currentReplaceCategoryId && currentReplaceImageId) {
        log(`Replacing image ${currentReplaceImageId}...`);
        const res = await window.api.replaceImage(currentReplaceCategoryId, currentReplaceImageId, e.target.files[0].path);
        if (res.success) {
            log(`Image replaced successfully.`);
            await loadData();
        } else {
            log(`Replace failed: ` + res.error);
        }
    }
    replaceInput.value = '';
});

function renderGallery() {
    const container = document.getElementById('gallery-container');
    container.innerHTML = '';

    galleryData.categories.forEach(category => {
        if (!category.images || category.images.length === 0) return;

        const catBlock = document.createElement('div');
        catBlock.className = 'gallery-category-block';
        catBlock.innerHTML = `<h3>${category.name}</h3>`;

        const grid = document.createElement('div');
        grid.className = 'gallery-grid';
        grid.id = `grid-${category.id}`;

        category.images.forEach(img => {
            const card = document.createElement('div');
            card.className = 'gallery-card';
            card.dataset.id = img.id;
            
            const sizeKB = (img.size / 1024).toFixed(1);

            card.innerHTML = `
                <div class="gallery-img-wrapper">
                    <img src="../../../assets/gallery/${img.file}" alt="${img.file}">
                </div>
                <div class="gallery-info">
                    <div class="file-name" title="${img.file}">${img.file}</div>
                    <div class="file-size">${sizeKB} KB</div>
                    <div class="gallery-actions">
                        <button class="btn btn-outline replace-btn" data-cat="${category.id}" data-id="${img.id}">Replace</button>
                        <button class="btn btn-danger delete-btn" data-cat="${category.id}" data-id="${img.id}">Delete</button>
                    </div>
                </div>
            `;
            grid.appendChild(card);
        });

        catBlock.appendChild(grid);
        container.appendChild(catBlock);

        // Make grid sortable
        Sortable.create(grid, {
            animation: 150,
            onEnd: async function () {
                const newOrder = Array.from(grid.children).map(c => c.dataset.id);
                log(`Reordering ${category.name}...`);
                await window.api.reorderImages(category.id, newOrder);
                log('Reorder saved.');
                await loadData();
            }
        });
    });

    // Attach Action Events
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            if (confirm('Are you sure you want to delete this image? It will be backed up before deletion.')) {
                const catId = e.target.dataset.cat;
                const imgId = e.target.dataset.id;
                log(`Deleting image...`);
                await window.api.deleteImage(catId, imgId);
                log('Deleted successfully.');
                await loadData();
            }
        });
    });

    document.querySelectorAll('.replace-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            currentReplaceCategoryId = e.target.dataset.cat;
            currentReplaceImageId = e.target.dataset.id;
            replaceInput.click();
        });
    });
}


// --- PUBLISH LOGIC ---
document.getElementById('publish-btn').addEventListener('click', async () => {
    const btn = document.getElementById('publish-btn');
    const ogText = btn.textContent;
    btn.textContent = 'Publishing (Please wait)...'; btn.disabled = true;
    log('Starting publish process...');

    try {
        const res = await window.api.publishWebsite();
        if (res.success) {
            log('🎉 Website published successfully!');
            await loadData();
        } else log('❌ Publish failed: ' + res.error);
    } catch (e) { log('❌ Error: ' + e.message); }

    btn.textContent = ogText; btn.disabled = false;
});

// Init
loadData();

// --- CMS LOGIC ---
function populateCmsForm() {
    if (!contentData.homepage) return;

    // Homepage
    document.getElementById('cms-home-heroTitle').value = contentData.homepage.heroTitle || '';
    document.getElementById('cms-home-heroDescription').value = contentData.homepage.heroDescription || '';
    document.getElementById('cms-home-yearsExperience').value = contentData.homepage.yearsExperience || '';
    document.getElementById('cms-home-productCategories').value = contentData.homepage.productCategories || '';
    document.getElementById('cms-home-qualityAssurance').value = contentData.homepage.qualityAssurance || '';
    document.getElementById('cms-home-processingUnits').value = contentData.homepage.processingUnits || '';

    // About
    if (contentData.about) {
        document.getElementById('cms-about-companyStory').value = contentData.about.companyStory || '';
        document.getElementById('cms-about-overview').value = contentData.about.overview || '';
        document.getElementById('cms-about-mission').value = contentData.about.mission || '';
        document.getElementById('cms-about-vision').value = contentData.about.vision || '';
        document.getElementById('cms-about-keyStrengths').value = contentData.about.keyStrengths || '';
    }

    // Contact
    if (contentData.contact) {
        document.getElementById('cms-contact-primaryMobile').value = contentData.contact.primaryMobile || '';
        document.getElementById('cms-contact-secondaryMobile').value = contentData.contact.secondaryMobile || '';
        document.getElementById('cms-contact-email').value = contentData.contact.email || '';
        document.getElementById('cms-contact-address').value = contentData.contact.address || '';
    }
}

document.getElementById('save-cms-btn').addEventListener('click', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('save-cms-btn');
    btn.textContent = 'Saving...'; btn.disabled = true;

    const newContent = { ...contentData };
    
    newContent.homepage = {
        heroTitle: document.getElementById('cms-home-heroTitle').value,
        heroDescription: document.getElementById('cms-home-heroDescription').value,
        yearsExperience: document.getElementById('cms-home-yearsExperience').value,
        productCategories: document.getElementById('cms-home-productCategories').value,
        qualityAssurance: document.getElementById('cms-home-qualityAssurance').value,
        processingUnits: document.getElementById('cms-home-processingUnits').value,
    };

    newContent.about = {
        companyStory: document.getElementById('cms-about-companyStory').value,
        overview: document.getElementById('cms-about-overview').value,
        mission: document.getElementById('cms-about-mission').value,
        vision: document.getElementById('cms-about-vision').value,
        keyStrengths: document.getElementById('cms-about-keyStrengths').value,
    };

    newContent.contact = {
        primaryMobile: document.getElementById('cms-contact-primaryMobile').value,
        secondaryMobile: document.getElementById('cms-contact-secondaryMobile').value,
        email: document.getElementById('cms-contact-email').value,
        address: document.getElementById('cms-contact-address').value,
        pinCode: "431122"
    };

    try {
        const res = await window.api.saveContent(newContent);
        if (res.success) {
            log('CMS Content saved and HTML generated successfully.');
            contentData = newContent;
            await loadData();
        } else log('Error saving CMS: ' + res.error);
    } catch (e) { log('Error: ' + e.message); }

    btn.textContent = '💾 Save Content'; btn.disabled = false;
});

document.getElementById('preview-cms-btn').addEventListener('click', (e) => {
    e.preventDefault();
    window.api.previewWebsite('index');
    log('Opened homepage preview.');
});

// --- SEO LOGIC ---
const seoPageSelect = document.getElementById('seo-page-select');

function populateSeoForm(pageKey) {
    const data = seoData[pageKey] || {};
    document.getElementById('seo-title').value = data.title || '';
    document.getElementById('seo-description').value = data.description || '';
    document.getElementById('seo-keywords').value = data.keywords || '';
    document.getElementById('seo-ogTitle').value = data.ogTitle || '';
    document.getElementById('seo-ogDescription').value = data.ogDescription || '';
    document.getElementById('seo-canonicalUrl').value = data.canonicalUrl || '';
}

seoPageSelect.addEventListener('change', (e) => {
    populateSeoForm(e.target.value);
});

document.getElementById('save-seo-btn').addEventListener('click', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('save-seo-btn');
    btn.textContent = 'Saving...'; btn.disabled = true;

    const pageKey = seoPageSelect.value;
    seoData[pageKey] = {
        title: document.getElementById('seo-title').value,
        description: document.getElementById('seo-description').value,
        keywords: document.getElementById('seo-keywords').value,
        ogTitle: document.getElementById('seo-ogTitle').value,
        ogDescription: document.getElementById('seo-ogDescription').value,
        canonicalUrl: document.getElementById('seo-canonicalUrl').value,
    };

    try {
        const res = await window.api.saveSeo(seoData);
        if (res.success) {
            log(`SEO metadata for ${pageKey} saved successfully.`);
            await loadData();
        } else log('Error saving SEO: ' + res.error);
    } catch (e) { log('Error: ' + e.message); }

    btn.textContent = '💾 Save SEO Meta'; btn.disabled = false;
});

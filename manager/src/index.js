const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs-extra');
const { execSync } = require('child_process');
const cheerio = require('cheerio');

const ROOT_DIR = path.join(__dirname, '..', '..');
const DATA_FILE = path.join(ROOT_DIR, 'data', 'products.json');
const HTML_FILE = path.join(ROOT_DIR, 'products.html');

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

// 2. Read Products
ipcMain.handle('read-products', async () => {
    if (fs.existsSync(DATA_FILE)) {
        return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    }
    return {};
});

// 3. Save Products & Generate HTML
ipcMain.handle('save-products', async (event, productsData) => {
    try {
        // Save JSON
        fs.writeFileSync(DATA_FILE, JSON.stringify(productsData, null, 2));

        // Generate HTML
        if (fs.existsSync(HTML_FILE)) {
            let htmlContent = fs.readFileSync(HTML_FILE, 'utf8');
            const $ = cheerio.load(htmlContent);

            // Create the new daily rates section HTML
            let ratesHtml = '<div class="daily-rates-container" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem; margin-top: 2rem;">\n';
            for (const [key, prod] of Object.entries(productsData)) {
                ratesHtml += `
                    <div class="rate-card" style="background: white; border: 1px solid var(--color-border); padding: 1.5rem; border-radius: var(--border-radius-md); box-shadow: var(--shadow-sm); text-align: center;">
                        <h3 style="color: var(--color-primary); margin-bottom: 0.5rem;">${prod.name}</h3>
                        <p class="text-muted" style="margin-bottom: 1rem; font-size: 0.9rem;">${prod.description}</p>
                        <div style="font-size: 1.5rem; font-weight: bold; color: var(--color-accent); margin-bottom: 0.5rem;">₹${prod.rate} <span style="font-size:1rem; color:var(--color-text-main);">/ Quintal</span></div>
                        <div style="display: inline-block; padding: 0.25rem 0.75rem; border-radius: 20px; font-size: 0.85rem; font-weight: bold; background: ${prod.available ? '#dcfce7' : '#fee2e2'}; color: ${prod.available ? '#166534' : '#991b1b'};">
                            ${prod.available ? 'In Stock' : 'Out of Stock'}
                        </div>
                    </div>\n`;
            }
            ratesHtml += '</div>';

            // Find or inject the daily rates section in products.html
            const containerId = '#daily-rates-section';
            if ($(containerId).length > 0) {
                $(containerId).html(ratesHtml);
            } else {
                // If the section doesn't exist, we inject it right before the products-grid
                const target = $('.products-grid').first().parent();
                target.prepend(`
                    <div class="fade-in-up" style="margin-bottom: 4rem;">
                        <h2 class="text-center" style="margin-bottom: 1rem;">Daily Rates & Availability</h2>
                        <div id="daily-rates-section">${ratesHtml}</div>
                    </div>
                `);
            }

            fs.writeFileSync(HTML_FILE, $.html());
        }

        return { success: true };
    } catch (e) {
        console.error(e);
        return { success: false, error: e.message };
    }
});

// 4. Preview
ipcMain.handle('preview-website', () => {
    let previewWindow = new BrowserWindow({
        width: 1024,
        height: 768,
        webPreferences: {
            nodeIntegration: false
        }
    });
    previewWindow.loadFile(HTML_FILE);
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

        // Copy modified files to backup (we just copy the ones we know we modify)
        fs.copyFileSync(DATA_FILE, path.join(currentBackup, 'products.json'));
        fs.copyFileSync(HTML_FILE, path.join(currentBackup, 'products.html'));

        // Step 2: Git operations
        execSync('git add .', { cwd: ROOT_DIR });
        execSync(`git commit -m "Rates Update - ${timestamp}"`, { cwd: ROOT_DIR });
        execSync('git push origin main', { cwd: ROOT_DIR });

        return { success: true };
    } catch (e) {
        console.error(e);
        return { success: false, error: e.message };
    }
});

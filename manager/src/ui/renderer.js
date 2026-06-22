const logBox = document.getElementById('log-box');
function log(msg) {
    const time = new Date().toLocaleTimeString();
    logBox.textContent += `\n[${time}] ${msg}`;
    logBox.scrollTop = logBox.scrollHeight;
}

const defaultProducts = ['wheat', 'jowar', 'bajra', 'chana'];
let currentData = {};

async function loadData() {
    log('Loading dashboard data...');
    try {
        currentData = await window.api.readProducts();
        const stats = await window.api.getStats();

        // Update Stats
        document.getElementById('stat-products').textContent = stats.productsCount;
        document.getElementById('stat-modified').textContent = stats.modifiedFiles.length;
        document.getElementById('stat-last-publish').textContent = stats.lastPublish;
        
        const statusBadge = document.getElementById('status-badge');
        statusBadge.textContent = stats.status;
        if(stats.status === 'Pending Changes') {
            statusBadge.style.background = '#fef08a';
            statusBadge.style.color = '#854d0e';
        } else {
            statusBadge.style.background = '#dcfce7';
            statusBadge.style.color = '#166534';
        }

        renderForm();
        log('Data loaded successfully.');
    } catch (e) {
        log('Error loading data: ' + e.message);
    }
}

function renderForm() {
    const container = document.getElementById('products-container');
    container.innerHTML = '';

    defaultProducts.forEach(key => {
        // Fallback if missing
        const prod = currentData[key] || {
            name: key.charAt(0).toUpperCase() + key.slice(1),
            description: '',
            rate: 0,
            available: true
        };
        // Save back default if missing
        currentData[key] = prod;

        const html = `
            <div class="product-group" data-key="${key}">
                <h3>
                    ${prod.name}
                    <label class="switch">
                        <input type="checkbox" class="inp-available" ${prod.available ? 'checked' : ''}>
                        <span class="slider"></span>
                    </label>
                </h3>
                <div class="form-grid">
                    <div class="form-group">
                        <label>Product Name</label>
                        <input type="text" class="inp-name" value="${prod.name}">
                    </div>
                    <div class="form-group">
                        <label>Current Rate (₹ per Quintal)</label>
                        <input type="number" class="inp-rate" value="${prod.rate}">
                    </div>
                    <div class="form-group full">
                        <label>Short Description</label>
                        <input type="text" class="inp-desc" value="${prod.description}">
                    </div>
                </div>
            </div>
        `;
        container.insertAdjacentHTML('beforeend', html);
    });
}

function getFormData() {
    const newData = {};
    document.querySelectorAll('.product-group').forEach(group => {
        const key = group.getAttribute('data-key');
        newData[key] = {
            name: group.querySelector('.inp-name').value,
            description: group.querySelector('.inp-desc').value,
            rate: parseInt(group.querySelector('.inp-rate').value) || 0,
            available: group.querySelector('.inp-available').checked
        };
    });
    return newData;
}

document.getElementById('save-btn').addEventListener('click', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('save-btn');
    btn.textContent = 'Saving...';
    btn.disabled = true;

    try {
        const data = getFormData();
        const res = await window.api.saveProducts(data);
        if (res.success) {
            log('Products saved and products.html generated successfully.');
            await loadData(); // refresh stats
        } else {
            log('Error saving: ' + res.error);
        }
    } catch (e) {
        log('Error: ' + e.message);
    }

    btn.textContent = '💾 Save & Generate HTML';
    btn.disabled = false;
});

document.getElementById('preview-btn').addEventListener('click', () => {
    window.api.previewWebsite();
    log('Opened preview window.');
});

document.getElementById('publish-btn').addEventListener('click', async () => {
    const btn = document.getElementById('publish-btn');
    const ogText = btn.textContent;
    btn.textContent = 'Publishing (Please wait)...';
    btn.disabled = true;
    log('Starting publish process...');
    log('Creating local backup...');
    log('Running git add, commit, and push...');

    try {
        const res = await window.api.publishWebsite();
        if (res.success) {
            log('🎉 Website published successfully!');
            await loadData(); // refresh stats
        } else {
            log('❌ Publish failed: ' + res.error);
        }
    } catch (e) {
        log('❌ Error: ' + e.message);
    }

    btn.textContent = ogText;
    btn.disabled = false;
});

// Init
loadData();

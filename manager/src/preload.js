const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
    getStats: () => ipcRenderer.invoke('get-stats'),
    readProducts: () => ipcRenderer.invoke('read-products'),
    saveProducts: (data) => ipcRenderer.invoke('save-products', data),
    uploadProductImage: (filePath) => ipcRenderer.invoke('upload-product-image', filePath),
    previewWebsite: (page) => ipcRenderer.invoke('preview-website', page),
    publishWebsite: () => ipcRenderer.invoke('publish-website'),
    
    // Gallery API
    readGallery: () => ipcRenderer.invoke('read-gallery'),
    uploadImage: (categoryId, filePath) => ipcRenderer.invoke('upload-image', categoryId, filePath),
    deleteImage: (categoryId, imageId) => ipcRenderer.invoke('delete-image', categoryId, imageId),
    replaceImage: (categoryId, imageId, newFilePath) => ipcRenderer.invoke('replace-image', categoryId, imageId, newFilePath),
    reorderImages: (categoryId, newOrderArr) => ipcRenderer.invoke('reorder-images', categoryId, newOrderArr),

    // CMS & SEO API
    readContent: () => ipcRenderer.invoke('read-content'),
    saveContent: (data) => ipcRenderer.invoke('save-content', data),
    readSeo: () => ipcRenderer.invoke('read-seo'),
    saveSeo: (data) => ipcRenderer.invoke('save-seo', data)
});

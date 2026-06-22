const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
    getStats: () => ipcRenderer.invoke('get-stats'),
    readProducts: () => ipcRenderer.invoke('read-products'),
    saveProducts: (data) => ipcRenderer.invoke('save-products', data),
    previewWebsite: () => ipcRenderer.invoke('preview-website'),
    publishWebsite: () => ipcRenderer.invoke('publish-website')
});

const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('versions', {
    node: () => process.versions.node,
    chrome: () => process.versions.chrome,
    electron: () => process.versions.electron,
    ping: () => ipcRenderer.invoke('ping')
    // we can also expose variables, not just functions
})

document.addEventListener('DOMContentLoaded',  () => {

    const renderMain =  require('./renderMain.js');

    renderMain.init();
})

console.log('preload.js');
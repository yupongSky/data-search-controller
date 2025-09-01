// src-electron/preload.js
const { contextBridge, ipcRenderer } = require('electron')

console.log('preload.js loaded successfully')

// 向渲染进程暴露API
contextBridge.exposeInMainWorld('electronAPI', {
  // 导入图片
  importImages: (files) => ipcRenderer.send('import-images', { files }),
  // 获取已导入图片
  getImportedImages: () => ipcRenderer.send('get-imported-images'),
  // 获取图片Data URL
  getImageDataUrl: (fileName) => {
    return new Promise((resolve) => {
      ipcRenderer.send('get-image-data-url', fileName);
      ipcRenderer.once('image-data-url-result', (event, dataUrl) => {
        resolve(dataUrl);
      });
    });
  },
  // 打开文件选择器
  openFileSelector: () => {
    return new Promise((resolve) => {
      ipcRenderer.send('open-file-selector');
      ipcRenderer.once('file-select-result', (event, files) => {
        resolve(files);
      });

    })
  },

  // 监听文件选择结果
  onFileSelectResult: (callback) => {
    ipcRenderer.on('file-select-result', (event, files) => callback(files));
    return () => ipcRenderer.off('file-select-result', callback);
  },
  // 移除文件选择结果监听
  removeFileSelectResult: (callback) => ipcRenderer.off('file-select-result', callback),
  // 监听进度更新
  onImportProgress: (callback) => {
    ipcRenderer.on('import-progress', (event, progress) => callback(progress));
    return () => ipcRenderer.off('import-progress', callback);
  },
  // 监听状态更新
  onImportStatus: (callback) => {
    ipcRenderer.on('import-status', (event, status) => callback(status));
    return () => ipcRenderer.off('import-status', callback);
  },
  // 监听导入完成
  onImportComplete: (callback) => {
    ipcRenderer.on('import-complete', (event, images) => callback(images));
    return () => ipcRenderer.off('import-complete', callback);
  },
  // 监听已导入图片响应
  onImportedImages: (callback) => {
    ipcRenderer.on('imported-images', (event, images) => callback(images));
    return () => ipcRenderer.off('imported-images', callback);
  },
  // 移除进度更新监听
  removeImportProgress: (callback) => ipcRenderer.off('import-progress', callback),
  // 移除状态更新监听
  removeImportStatus: (callback) => ipcRenderer.off('import-status', callback),
  // 移除导入完成监听
  removeImportComplete: (callback) => ipcRenderer.off('import-complete', callback),
  // 移除已导入图片响应监听
  removeImportedImages: (callback) => ipcRenderer.off('imported-images', callback)
})
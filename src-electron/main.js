// src-electron/main.js
const { app, BrowserWindow, ipcMain } = require('electron')
const EventEmitter = require('events')
// 增加监听器限制
EventEmitter.defaultMaxListeners = 100
const { join, resolve } = require('path')
const fs = require('fs')
const { promisify } = require('util')
const copyFile = promisify(fs.copyFile)

// 屏蔽安全警告
// Electron Security Warning (Insecure Content-Security-Policy)
process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true'

// 设置图片存储目录
const IMAGES_DIR = resolve(__dirname, '../import-imgs')

// 确保存储目录存在
if (!fs.existsSync(IMAGES_DIR)) {
    fs.mkdirSync(IMAGES_DIR, { recursive: true })
}

// 创建浏览器窗口时，调用这个函数。
const createWindow = () => {
    // 确定preload路径
    const preloadPath = process.env.VITE_DEV_SERVER_URL
        ? join(__dirname, 'preload.js')
        : join(__dirname, '../dist-electron/preload.js');

    console.log('Preload path:', preloadPath);
    console.log('Does preload file exist?', fs.existsSync(preloadPath));

    const win = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            preload: preloadPath,
            nodeIntegration: false,
            contextIsolation: true,
        }
    })
    win.webContents.openDevTools()
    // development模式
    if (process.env.VITE_DEV_SERVER_URL) {
        win.loadURL(process.env.VITE_DEV_SERVER_URL)
        // win.loadFile(join(__dirname, '../dist/index.html'))
    } else {
        win.loadFile(join(__dirname, '../dist/index.html'))
    }

    // 监听打开文件选择器事件
    ipcMain.on('open-file-selector', (event) => {
        const { dialog } = require('electron')
        dialog.showOpenDialog({
            properties: ['openFile', 'multiSelections'],
            filters: [{
                name: 'Image Files',
                extensions: ['jpg', 'jpeg', 'png',]
            }]
        }).then(result => {
            if (!result.canceled && result.filePaths.length > 0) {
                // 构建文件信息数组
                const files = result.filePaths.map(filePath => {
                    const path = require('path')
                    const fs = require('fs');
                    const data = fs.readFileSync(filePath);
                    const base64 = data.toString('base64');
                    const ext = path.extname(filePath).toLowerCase().substring(1);
                    const dataUrl = `data:image/${ext};base64,${base64}`;
                    return {
                        name: path.basename(filePath),
                        path: filePath,
                        dataUrl: dataUrl,
                    }
                })
                event.reply('file-select-result', files)
            } else {
                event.reply('file-select-result', [])
            }
        }).catch(err => {
            console.error('打开文件选择器失败:', err)
            event.reply('file-select-result', [])
        })


    })

    // 监听获取图片Data URL事件
    ipcMain.on('get-image-data-url', (event, fileName) => {
        try {
            const path = require('path');
            const fs = require('fs');
            const imagePath = path.join(IMAGES_DIR, fileName);

            if (fs.existsSync(imagePath)) {
                const data = fs.readFileSync(imagePath);
                const base64 = data.toString('base64');
                const ext = path.extname(imagePath).toLowerCase().substring(1);
                const dataUrl = `data:image/${ext};base64,${base64}`;
                event.reply('image-data-url-result', dataUrl);
            } else {
                event.reply('image-data-url-result', '');
            }
        } catch (error) {
            console.error('获取图片Data URL失败:', error);
            event.reply('image-data-url-result', '');
        }
    });

    // 监听导入图片事件
    ipcMain.on('import-images', async (event, { files }) => {
        try {
            event.reply('import-status', '开始导入...')
            const totalFiles = files.length
            let importedCount = 0

            for (const file of files) {
                // 检查文件类型是否为图片
                const fileExtension = file.name.split('.').pop().toLowerCase();
                const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'];
                if (!imageExtensions.includes(fileExtension)) {
                    event.reply('import-status', `跳过非图片文件: ${file.name}`)
                    continue
                }

                // 生成目标路径
                const targetPath = join(IMAGES_DIR, file.name)

                // 复制文件
                await copyFile(file.path, targetPath)
                importedCount++

                // 更新进度
                const progress = Math.round((importedCount / totalFiles) * 100)
                event.reply('import-progress', progress)
                event.reply('import-status', `已导入: ${file.name}`)
            }

            // 导入完成，读取已导入的图片
            const images = fs.readdirSync(IMAGES_DIR)
                .filter(file => /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(file))
                .map(file => ({
                    name: file,
                    url: `file://${join(IMAGES_DIR, file)}`
                }))

            event.reply('import-complete', images)
            event.reply('import-status', `导入完成，共导入 ${importedCount} 张图片`)
        } catch (error) {
            console.error('导入图片失败:', error)
            event.reply('import-status', `导入失败: ${error.message}`)
        }
    })

    // 监听获取已导入图片事件
    ipcMain.on('get-imported-images', (event) => {
        try {
            // 读取已导入的图片
            const images = fs.readdirSync(IMAGES_DIR)
                .filter(file => /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(file))
                .map(file => ({
                    name: file,
                    url: `file://${join(IMAGES_DIR, file)}`
                }))

            event.reply('imported-images', images)
        } catch (error) {
            console.error('获取已导入图片失败:', error)
            event.reply('imported-images', [])
        }
    })
}

// Electron 会在初始化后并准备
app.whenReady().then(() => {
    createWindow()
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
})


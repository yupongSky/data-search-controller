import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import electron from 'vite-plugin-electron'
import { copyFileSync, mkdirSync, existsSync } from 'fs'
import { join } from 'path'
// https://vite.dev/config/
export default defineConfig({
  base: './',
  build: {
    outDir: 'dist',
    // 在构建完成后复制preload.js到dist-electron目录
    rollupOptions: {
      output: {
        manualChunks: undefined
      }
    }
  },
  plugins: [
    vue(),
    electron([{
      // 主进程入口文件
      entry: './src-electron/main.js'
    }, {
      entry: './src-electron/preload.js',
      onstart({ reload }) {
        // Notify the Renderer process to reload the page when the Preload scripts build is complete, 
        // instead of restarting the entire Electron App.
        reload()
      },
    },]),
    // {
    //   name: 'copy-preload',
    //   enforce: 'post',
    //   buildEnd() {
    //     const srcPreload = join(__dirname, 'src-electron', 'preload.js')
    //     const distElectron = join(__dirname, 'dist-electron')
    //     const destPreload = join(distElectron, 'preload.js')

    //     // 确保dist-electron目录存在
    //     if (!existsSync(distElectron)) {
    //       mkdirSync(distElectron, { recursive: true })
    //     }

    //     // 复制preload.js文件
    //     copyFileSync(srcPreload, destPreload)
    //     console.log('preload.js copied to dist-electron')
    //   }
    // }
  ],
  /*开发服务器选项*/
  server: {
    // 端口
    port: 3000,
  }

})

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import electron from 'vite-plugin-electron'
// https://vite.dev/config/
export default defineConfig({
  base: './',
  build: {
    outDir: 'dist',
  },
  plugins: [
    vue(),
    electron({
      // 主进程入口文件
      entry: './src-electron/main.js'
    })
  ],
  /*开发服务器选项*/
  server: {
    // 端口
    port: 3000,
  }

})

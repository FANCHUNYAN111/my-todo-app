import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
// 添加下面这行
import path from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@use "@/styles/variables.scss" as *;`
      }
    }
  },
  // target: 'https://my-todo-app-production-4c38.up.railway.app',

  //  target: 'http://localhost:3000',
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true
      }
    }
  }
})
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: { port: 5188, open: false },
  build: {
    chunkSizeWarningLimit: 1600,
    rollupOptions: {
      output: {
        // 拆包：大依赖单独分块，利于浏览器长缓存
        manualChunks: {
          echarts: ['echarts'],
          vue: ['vue'],
        },
      },
    },
  },
})

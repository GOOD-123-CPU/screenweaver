/**
 * 库模式构建配置：把 src/engine + src/themes 作为可复用 npm 包产物。
 * 使用：vite build 会产出应用构建；`vite build --config vite.lib.config.ts`
 * 产出引擎库构建（ESM + CJS + d.ts）。
 */
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath } from 'node:url'

export default defineConfig({
  plugins: [vue()],
  build: {
    outDir: 'dist-lib',
    emptyOutDir: true,
    lib: {
      entry: fileURLToPath(new URL('./src/engine/lib-entry.ts', import.meta.url)),
      name: 'ScreenWeaverEngine',
      formats: ['es', 'cjs'],
      fileName: (format) => `engine.${format}.js`,
    },
    rollupOptions: {
      // Vue 由使用方提供，不打包进库
      external: ['vue'],
      output: {
        globals: { vue: 'Vue' },
      },
    },
  },
})

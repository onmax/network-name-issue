import wasm from 'vite-plugin-wasm'
import { defineConfig } from 'vite'
import topLevelAwait from 'vite-plugin-top-level-await'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [wasm(), topLevelAwait(), vue()],
  worker: {
    plugins: () => [wasm(), topLevelAwait()]
  },
  optimizeDeps: {
    exclude: ['@nimiq/core'],
  },
})

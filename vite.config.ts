import topLevelAwait from 'vite-plugin-top-level-await'
import wasm from 'vite-plugin-wasm'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    wasm(),
    topLevelAwait(),
  ],
  worker: {
    plugins: () => [
      wasm(),
      topLevelAwait(),
    ]
  },

  optimizeDeps: {
    exclude: ['@nimiq/core'],
  },
})

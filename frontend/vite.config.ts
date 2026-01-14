import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    // Run the frontend dev server on a different port than the API
    // to avoid collisions and proxy loops.
    port: 5173,
    strictPort: true,
    proxy: {
      '/api': {
        // Backend API runs on port 3001 (see api/src/server.ts)
        target: 'http://localhost:3001',
        changeOrigin: true
      }
    }
  }
})

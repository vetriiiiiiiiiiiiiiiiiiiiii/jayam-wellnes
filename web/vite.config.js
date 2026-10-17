import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    proxy: {
      // MinIO image proxy only — the trailing slash keeps /products/* page routes in the SPA
      '/product/': 'http://localhost:5005'
    }
  }
})

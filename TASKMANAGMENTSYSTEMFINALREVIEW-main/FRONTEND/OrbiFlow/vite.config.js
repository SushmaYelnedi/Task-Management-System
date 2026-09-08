import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true,
    proxy: {
      '/auth': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
      '/admin': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
      '/employee': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
      '/manager': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      }
    }
  },
  env: {
  }
})

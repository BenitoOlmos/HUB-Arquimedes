import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 20015,
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:20001',
        changeOrigin: true
      },
      '/socket.io': {
        target: 'http://localhost:20001',
        ws: true,
        changeOrigin: true
      }
    }
  }
})

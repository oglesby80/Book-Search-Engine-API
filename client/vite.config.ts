import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000, // The port for the Vite development server
    open: true, // Automatically open the browser
    proxy: {
      '/api': { // Proxy API requests to the backend
        target: 'http://localhost:3002', // Update this to your backend port (3002 in your server config)
        secure: false,
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist', // Default build directory
  },
})


import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['@emotion/react'], // Ensures @emotion/react is bundled correctly
  },
  server: {
    port: 3000, // Port for the dev server
    open: true, // Automatically opens the browser
    proxy: {
      '/api': {
        target: 'http://localhost:3001', // Proxy API requests to backend
        secure: false,
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist', // Ensures production files are output to "dist"
  },
});




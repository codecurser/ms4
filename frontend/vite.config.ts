import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,
    proxy: {
      '/api': {
        target: process.env.VITE_API_BASE_URL || 'https://ms4-d7da.onrender.com',
        changeOrigin: true,
        secure: false
      },
      '/health': {
        target: process.env.VITE_API_BASE_URL || 'https://ms4-d7da.onrender.com',
        changeOrigin: true,
        secure: false
      }
    }
  }
});

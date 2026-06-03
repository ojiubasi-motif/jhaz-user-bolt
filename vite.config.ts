import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    proxy: {
      // Proxy all /api requests to the gateway during development.
      // This makes cookies same-origin (no cross-origin SameSite issues).
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        // Forward cookies (needed for httpOnly refresh token)
        cookieDomainRewrite: 'localhost',
      },
    },
  },
});

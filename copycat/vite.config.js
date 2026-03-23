import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: '/copycat/',
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://chriscalver.com',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api/, '/apitest/api'),
      },
    },
  },
})

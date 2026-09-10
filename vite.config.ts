import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

const REPO = 'week8-nestjs-api-demo'

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  base: command === 'build' ? `/${REPO}/` : '/',
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api/a1': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/a1/, ''),
      },
      '/api/a2': {
        target: 'http://localhost:3002',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/a2/, ''),
      },
      '/api/a3': {
        target: 'http://localhost:3003',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/a3/, ''),
      },
    },
  },
}))

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true,
    proxy: {
      '/api/leetcode': {
        target: 'https://leetcode.com',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api\/leetcode/, '/graphql'),
        headers: {
          Referer: 'https://leetcode.com',
          Origin: 'https://leetcode.com'
        }
      }
    }
  },
  build: {
    outDir: 'dist',
    minify: 'esbuild'
  }
})

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    proxy: {
      '/fib-api': {
        target: 'https://fib.stage.fib.iq',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/fib-api/, ''),
        secure: false,
        configure: (proxy, options) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            // Remove the referer header that might cause CORS issues
            proxyReq.removeHeader('referer')
            proxyReq.removeHeader('origin')
            // Set proper host header
            proxyReq.setHeader('host', 'fib.stage.fib.iq')
          })
        }
      }
    }
  }
})

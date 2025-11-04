import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],

  server: {
    host: '0.0.0.0',  // Make the server accessible on all network interfaces
    port: 5173,
    allowedHosts: [
      'localhost',
      '127.0.0.1',
      '44.226.145.213',
      '54.187.200.255',
      '136.114.250.120'  // Add your LoadBalancer IP
    ],
    // Proxy API calls to avoid CORS
    proxy: {
      '/api': {
        target: 'http://34.134.66.123:5000',
        changeOrigin: true,
        rewrite: (path) => path
      },
      '/auth': {
        target: 'http://34.134.66.123:5000',
        changeOrigin: true,
        rewrite: (path) => path
      }
    },
    hmr: {
      clientPort: 3000,  // Tell browser to connect WebSocket on this port
      host: '136.114.250.120'  // Your LoadBalancer IP
    }
  }
})

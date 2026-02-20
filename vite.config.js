import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'https://refqa-0-lhx8.vercel.app',
        changeOrigin: true,
      },
      '/user': {
        target: 'https://refqa-0-lhx8.vercel.app',
        changeOrigin: true,
      },
      '/auth': {
        target: 'https://refqa-0-lhx8.vercel.app',
        changeOrigin: true,
      },
      '/chat': {
        target: 'https://refqa-0-lhx8.vercel.app',
        changeOrigin: true,
        ws: true,
      },
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          icons: ['react-icons'],
        }
      }
    },
    chunkSizeWarningLimit: 1000,
  },
  preview: {
    port: 4173,
  }
})

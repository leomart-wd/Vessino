import { defineConfig } from 'vite';
import autoprefixer from 'autoprefixer';
import cssnano from 'cssnano';

export default defineConfig({
  root: 'src',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['chart.js', 'howler', 'marked'],
          core: ['./src/js/core/'],
          features: ['./src/js/features/']
        }
      }
    }
  },
  css: {
    postcss: {
      plugins: [
        autoprefixer(),
        cssnano({ preset: 'default' })
      ]
    }
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'https://api.vessiamoci.com',
        changeOrigin: true,
        secure: false
      }
    }
  }
});
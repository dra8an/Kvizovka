import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      // Point directly to the shared package source for HMR
      '@kvizovka/shared': path.resolve(__dirname, '../shared/src/index.ts'),
    },
  },
  optimizeDeps: {
    // Exclude local workspace package from pre-bundling to avoid stale cache
    exclude: ['@kvizovka/shared'],
  },
  server: {
    // Watch the shared package for changes
    watch: {
      ignored: ['!**/node_modules/@kvizovka/shared/**'],
    },
  },
  build: {
    commonjsOptions: {
      include: [/node_modules/],
      transformMixedEsModules: true,
    },
  },
})

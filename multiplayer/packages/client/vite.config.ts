import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  optimizeDeps: {
    include: ['@kvizovka/shared'],
  },
  build: {
    commonjsOptions: {
      include: [/@kvizovka\/shared/, /node_modules/],
      transformMixedEsModules: true,
    },
  },
})

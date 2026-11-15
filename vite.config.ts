import path from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

// A API só aceita a origem http://localhost:3000 (CORS_ORIGINS), por isso a porta 3000.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { '@': path.resolve(import.meta.dirname, './src') },
  },
  server: { port: 3000, strictPort: true },
  preview: { port: 3000, strictPort: true },
  // O Recharts já fica no chunk da tela de dashboard (React.lazy); ~200 KB gzip por chunk é aceitável aqui.
  build: { chunkSizeWarningLimit: 800 },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    css: false,
  },
})

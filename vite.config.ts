import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath, URL } from 'node:url'
// import { webcrypto } from 'crypto' // ✅ ESM-compatible import

// https://vitejs.dev/config/
export default defineConfig(({mode}) => {
  const env = loadEnv(mode, process.cwd(), '')
  const __dirname = path.dirname(fileURLToPath(import.meta.url))

  return {
    base: '/',
    plugins: [react(),],
    define: {
      'process.env': {},
      global: 'globalThis',
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "src"),
      },
    },
    optimizeDeps: {
      exclude: ['lucide-react'],
    },
    server: {
      port: parseInt(env.VITE_PORT) || 5173, // 👈 change this to your desired port
    },
  }
})
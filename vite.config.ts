import {defineConfig, loadEnv} from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig(({mode}) => {
    const env = loadEnv(mode, process.cwd(), '')

    return {
        base: '/',
        optimizeDeps: {
            exclude: ['lucide-react'],
        },
        plugins: [react(),],
        define: {'process.env': {},},
        resolve: {
            alias: {
                "@": path.resolve(__dirname, "src"),
            },
        },
        build: {
            minify: 'terser',
            terserOptions: {
                compress: {
                    drop_console: true,   // Removes console.log, console.warn, etc.
                    drop_debugger: true,  // Removes debugger statements
                },
            },
        },
        server: {
            host: true, // or use '0.0.0.0'
            port: parseInt(env.VITE_PORT) || 5175, // 👈 change this to your desired port
        },
    }
})

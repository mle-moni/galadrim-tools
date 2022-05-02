import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    envDir: 'apps/frontend',
    server: {
        proxy: {
            '/api/': {
                target: 'http://localhost:3333/',
                changeOrigin: true,
                rewrite: (path: string) => path.replace(/^\/api/, ''),
            },
        },
    },
    build: {
        outDir: '../../dist/apps/frontend',
    },
})

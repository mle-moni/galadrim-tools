import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    server: {
        port: 3000,
        proxy: {
            "/api/": {
                target: "http://127.0.0.1:3333/",
                changeOrigin: true,
                rewrite: (path: string) => path.replace(/^\/api/, ""),
            },
            // '/uploads': {
            //     target: 'http://127.0.0.1:3333',
            //     changeOrigin: true,
            // },
        },
    },
    optimizeDeps: {
        include: ["@galadrim-tools/shared"],
    },
    build: {
        outDir: "dist",
        chunkSizeWarningLimit: 3000,
        commonjsOptions: {
            include: [/libs\/shared/, /node_modules/],
        },
    },
});

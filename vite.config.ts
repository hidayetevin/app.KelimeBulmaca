import { defineConfig } from 'vite';

export default defineConfig({
    plugins: [],
    server: {
        host: true,
        port: 4300
    },
    resolve: {
        alias: {
            '@': '/src',
        },
    },
    build: {
        assetsInlineLimit: 0, // Phaser assetleri için önemli
        rollupOptions: {
            output: {
                manualChunks: {
                    phaser: ['phaser']
                }
            }
        }
    }
});

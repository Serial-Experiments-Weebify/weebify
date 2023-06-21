import { fileURLToPath, URL } from 'node:url';

import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { viteStaticCopy } from 'vite-plugin-static-copy';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        vue(),
        viteStaticCopy({
            targets: [
                {
                    src: 'node_modules/libass-wasm/dist/js/subtitles-octopus-worker.wasm',
                    dest: 'assets',
                },
            ],
        }),
    ],
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url)),
        },
    },
    css: {
        preprocessorOptions: {
            less: {
                additionalData: '@import "@/assets/vars.less";',
            },
        },
    },
    server: {
        hmr: false, // TODO: remove, player breaks with hmr
        proxy: {
            '/graphql': 'http://localhost:3000',
            '/api/media': {
                target: 'http://localhost:3330',
                rewrite: (path) => path.replace(/^\/api/, ''),
                xfwd: true,
            },
            '/api/search': {
                target: 'http://localhost:7700',
                rewrite: (path) => path.replace(/^\/api\/search/, ''),
                xfwd: true,
            },
            '/cdn': {
                target: 'http://localhost:33300',
                rewrite: (path) => path.replace(/^\/cdn/, ''),
                xfwd: true,
            },
        },
    },
});

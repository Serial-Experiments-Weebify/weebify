import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  css: {
    preprocessorOptions: {
      less: {
        additionalData: '@import "@/assets/vars.less";'
      }
    }
  },
  server: {
    proxy: {
      '/graphql': 'http://localhost:3000',
      '/media': 'http://localhost:3330',
      '/cdn': {
        target: 'http://localhost:33300',
        rewrite: (path) => path.replace(/^\/cdn/, ""),
      }
    }
  }
})

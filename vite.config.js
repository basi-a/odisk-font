import { fileURLToPath, URL } from 'node:url'
import fs from 'node:fs'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [
    vue(),
  ],
  server: {
    https: {
     key: fs.readFileSync('./cert/server.key'),
     cert: fs.readFileSync('./cert/server.crt'),
    },
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})
 
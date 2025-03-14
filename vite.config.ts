import { fileURLToPath, URL } from 'node:url'
import plugins from './plugins'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  server: {
    port: 4443,
    host: '0.0.0.0',
  },
  plugins: [vue(), vueJsx(), vueDevTools(), ...plugins],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})

import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import UnoCSS from 'unocss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueJsx(),
    UnoCSS(),
    VitePWA({
      manifest: {
        'name': '狂飙计算器',
        'short_name': '狂飙',
        'icons': [
          {
            'src': '/pwa-192x192.png',
            'sizes': '192x192',
            'type': 'image/png',
            'purpose': 'any'
          },
          {
            'src': '/pwa-512x512.png',
            'sizes': '512x512',
            'type': 'image/png',
            'purpose': 'any'
          },
          {
            'src': '/pwa-maskable-192x192.png',
            'sizes': '192x192',
            'type': 'image/png',
            'purpose': 'maskable'
          },
          {
            'src': '/pwa-maskable-512x512.png',
            'sizes': '512x512',
            'type': 'image/png',
            'purpose': 'maskable'
          }
        ],
        'start_url': '/',
        'display': 'fullscreen',
        'background_color': '#FFFFFF',
        'theme_color': '#1867C0',
        'description': '做大做强！再创辉煌！'
      }
    })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})

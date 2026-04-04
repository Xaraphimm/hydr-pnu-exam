import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt',
      includeAssets: ['icon-192.svg', 'icon-512.svg'],
      manifest: false,
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,jpeg,png,woff2,pdf}'],
      },
    }),
  ],
  base: '/hydr-pnu-exam/',
})

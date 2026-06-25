import { defineConfig } from 'vite'
import { fileURLToPath, URL } from 'node:url'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon-192.svg', 'icon-512.svg'],
      manifest: false,
      workbox: {
        clientsClaim: true,
        globPatterns: ['**/*.{js,css,html,svg,jpeg,png,woff2}'],
        skipWaiting: true,
      },
    }),
  ],
  base: '/hydr-pnu-exam/',
})

import { defineConfig } from 'vitest/config';
import { fileURLToPath, URL } from 'node:url';
import react from '@vitejs/plugin-react';

export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.js'],
  },
});

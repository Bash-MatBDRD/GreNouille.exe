import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
  server: {
    hmr: true,
    host: '0.0.0.0',
    allowedHosts: true,
    watch: {
      ignored: ['**/.local/**', '**/node_modules/**', '**/data/**'],
    },
  },
});

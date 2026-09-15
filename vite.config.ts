/// <reference types="vitest/config" />
import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(() => {
  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
      proxy: {
        '/api/deezer': {
          target: 'https://api.deezer.com',
          changeOrigin: true,
          rewrite: (pathname) => pathname.replace(/^\/api\/deezer/, ''),
        },
      },
    },
    plugins: [react(), tailwindcss()],
    optimizeDeps: {
      exclude: ['@huggingface/transformers'],
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    },
    test: {
      environment: 'node',
      include: ['src/**/*.test.ts'],
    },
  };
});

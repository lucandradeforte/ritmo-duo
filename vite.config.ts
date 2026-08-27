import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { defineConfig } from 'vitest/config';

const repositoryName = process.env.GITHUB_REPOSITORY?.split('/')[1];
const base = process.env.GITHUB_ACTIONS && repositoryName ? `/${repositoryName}/` : '/';

export default defineConfig({
  base,
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt',
      injectRegister: false,
      manifest: {
        id: base,
        name: 'Ritmo Duo',
        short_name: 'Ritmo Duo',
        description: 'Treinos de Lucas e Geovanna, com registro rápido e modo dupla.',
        start_url: base,
        scope: base,
        display: 'standalone',
        display_override: ['window-controls-overlay', 'standalone', 'minimal-ui'],
        orientation: 'any',
        background_color: '#090b09',
        theme_color: '#090b09',
        categories: ['fitness', 'health', 'lifestyle'],
        lang: 'pt-BR',
        icons: [
          { src: 'pwa-icon-v2-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-icon-v2-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: 'pwa-icon-v2-maskable-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
        ]
      },
      workbox: {
        cleanupOutdatedCaches: true,
        clientsClaim: false,
        skipWaiting: false,
        navigateFallback: 'index.html',
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webp,woff2,json}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/www\.acefitness\.org\//i,
            handler: 'NetworkOnly'
          }
        ]
      },
      devOptions: { enabled: true }
    })
  ],
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.ts',
    css: true,
    coverage: { reporter: ['text', 'json', 'html'] }
  }
});

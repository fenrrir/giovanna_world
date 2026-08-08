import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

import { BASE_PATH, manifest } from './src/pwa/manifest';

/**
 * GitHub Pages serves this project from https://fenrrir.github.io/giovanna_world/,
 * so built assets need the repository name as their base path. The dev server is
 * served from the root, where a base path would only get in the way.
 */
export default defineConfig(({ command }) => ({
  base: command === 'build' ? BASE_PATH : '/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon-180x180.png', 'app-icon.svg'],
      // `as const` gives the manifest literal types the tests can pin, but the
      // plugin wants a mutable icon list; copy it at the boundary.
      manifest: { ...manifest, icons: [...manifest.icons] },
      workbox: {
        // The whole bundle is precached: the app must work in aeroplane mode
        // from the very first offline load (SPEC section 2).
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
        cleanupOutdatedCaches: true,
        navigateFallback: 'index.html',
      },
    }),
  ],
  build: {
    target: 'es2022',
    sourcemap: true,
  },
}));

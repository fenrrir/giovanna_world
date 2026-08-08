import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

/**
 * GitHub Pages serves this project from https://fenrrir.github.io/giovanna_world/,
 * so built assets need the repository name as their base path. The dev server is
 * served from the root, where a base path would only get in the way.
 */
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/giovanna_world/' : '/',
  plugins: [react()],
  build: {
    target: 'es2022',
    sourcemap: true,
  },
}));

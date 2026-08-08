import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

/**
 * Kept separate from vite.config.ts so the test run never loads the PWA plugin.
 */
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}', 'tests/**/*.test.{ts,tsx}'],
    restoreMocks: true,
    coverage: {
      provider: 'v8',
      // Vitest 4 reports every file matched by `include`, tested or not.
      include: ['src/**/*.{ts,tsx}'],
      // main.tsx is the DOM bootstrap (createRoot); it holds no branch to assert.
      exclude: ['src/main.tsx', 'src/vite-env.d.ts', 'src/**/*.test.{ts,tsx}'],
      reporter: ['text-summary', 'html', 'lcov'],
      thresholds: { lines: 95, branches: 95, functions: 95, statements: 95 },
    },
  },
});

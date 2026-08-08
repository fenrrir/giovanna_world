import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, beforeEach } from 'vitest';

/**
 * Node 22+ defines its own `localStorage` global, experimental and disabled
 * unless `--localstorage-file` is passed. Being already present, it shadows the
 * one jsdom would otherwise install — so the app under test finds no store at
 * all, and every access prints an experimental warning.
 *
 * Installing a real in-memory Storage puts the tests back on the API a browser
 * actually provides, instead of exercising the missing-store path everywhere.
 */
const memoryStorage = (): Storage => {
  const entries = new Map<string, string>();

  return {
    get length() {
      return entries.size;
    },
    clear: () => {
      entries.clear();
    },
    getItem: (key) => entries.get(key) ?? null,
    key: (index) => [...entries.keys()][index] ?? null,
    removeItem: (key) => {
      entries.delete(key);
    },
    setItem: (key, value) => {
      entries.set(key, value);
    },
  };
};

Object.defineProperty(globalThis, 'localStorage', {
  configurable: true,
  writable: true,
  value: memoryStorage(),
});

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  cleanup();
});

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

/**
 * jsdom implements no pointer capture. The app uses it so a dragged piece keeps
 * following the finger once it leaves the button it started on (SPEC §13), so
 * the tests need the API to exist — tracking which element holds the capture is
 * the browser's job, not something worth reimplementing here.
 */
const captured = new Set<number>();

// Arrows, so nothing here depends on the element it is called on.
Element.prototype.setPointerCapture = (pointerId: number): void => {
  captured.add(pointerId);
};
Element.prototype.releasePointerCapture = (pointerId: number): void => {
  captured.delete(pointerId);
};
Element.prototype.hasPointerCapture = (pointerId: number): boolean => captured.has(pointerId);

/**
 * jsdom has no hit testing either. The app asks the browser which layer a
 * finger is on when a piece is pulled off the doll (SPEC §13); without this the
 * call is simply absent and any test that presses on the doll throws. Returning
 * null is the honest default — nothing is laid out, so nothing is under a point
 * — and a test that cares stubs it.
 */
document.elementFromPoint = (): Element | null => null;

/**
 * jsdom lays nothing out, so it ships no ResizeObserver: there is no size for
 * one to report. The scrolling tray bar watches its own width to decide whether
 * a chevron has anywhere to point, and without the constructor the component
 * throws on mount. Observing nothing is the honest stand-in — the row never
 * changes size in a test, so the callback would never fire in a browser either.
 */
class NoopResizeObserver implements ResizeObserver {
  observe(): void {
    // Nothing is ever laid out, so nothing ever resizes.
  }
  unobserve(): void {
    // Symmetry with observe.
  }
  disconnect(): void {
    // Nothing to disconnect from.
  }
}

globalThis.ResizeObserver = NoopResizeObserver;

/**
 * jsdom implements no scrolling either. Returning nothing keeps the chevron's
 * handler callable, and a test that cares what it was asked to scroll spies on
 * this.
 */
Element.prototype.scrollBy = (): void => {
  // No layout, so there is nowhere to scroll to.
};

beforeEach(() => {
  localStorage.clear();
  captured.clear();
});

afterEach(() => {
  cleanup();
});

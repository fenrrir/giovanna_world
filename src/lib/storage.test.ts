import { describe, expect, it, vi } from 'vitest';

import { DEFAULT_LOOK } from '../model/defaults';
import type { Look } from '../model/types';
import { DEFAULT_WORLD } from '../model/world';
import { CURRENT_LOOK_KEY, loadLook, saveWorld } from './storage';

/** A Storage double, so the tests never depend on the ambient localStorage. */
const fakeStorage = (seed: Record<string, string> = {}): Storage => {
  const entries = new Map(Object.entries(seed));

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

const A_LOOK: Look = {
  schemaVersion: 1,
  skin: '#C68A5E',
  equipped: { top: { partId: 'top.t-shirt', color: '#1D9E75' } },
};

/*
 * Nothing writes `look:current` any more — the world does the saving now. It is
 * still read, once, to carry the outfit she was wearing into the first doll.
 */
describe('the look a previous version left', () => {
  it('reads back from the key the spec names', () => {
    const storage = fakeStorage();

    expect(CURRENT_LOOK_KEY).toBe('look:current');
    storage.setItem(CURRENT_LOOK_KEY, JSON.stringify(A_LOOK));

    expect(loadLook(storage)).toStrictEqual(A_LOOK);
  });
});

describe('loadLook', () => {
  it('returns null when nothing has been stored yet', () => {
    expect(loadLook(fakeStorage())).toBeNull();
  });

  it('returns null for invalid json rather than throwing', () => {
    expect(loadLook(fakeStorage({ [CURRENT_LOOK_KEY]: '{not json' }))).toBeNull();
  });

  it.each([
    ['an unknown schema version', { ...A_LOOK, schemaVersion: 2 }],
    ['a missing skin', { schemaVersion: 1, equipped: {} }],
    ['a non-string skin', { schemaVersion: 1, skin: 7, equipped: {} }],
    ['a missing equipped map', { schemaVersion: 1, skin: '#F7DCC3' }],
    ['a non-object equipped map', { schemaVersion: 1, skin: '#F7DCC3', equipped: [] }],
    [
      'an equipped entry without a colour',
      {
        schemaVersion: 1,
        skin: '#F7DCC3',
        equipped: { top: { partId: 'top.t-shirt' } },
      },
    ],
    [
      'an equipped entry that is not an object',
      {
        schemaVersion: 1,
        skin: '#F7DCC3',
        equipped: { top: 'top.t-shirt' },
      },
    ],
    ['a bare array', []],
    ['a bare string', 'hello'],
    ['null', null],
  ])('discards %s', (_case, payload) => {
    const storage = fakeStorage({ [CURRENT_LOOK_KEY]: JSON.stringify(payload) });

    expect(loadLook(storage)).toBeNull();
  });

  it('accepts a look with no equipped parts', () => {
    const storage = fakeStorage({ [CURRENT_LOOK_KEY]: JSON.stringify(DEFAULT_LOOK) });

    expect(loadLook(storage)).toStrictEqual(DEFAULT_LOOK);
  });
});

describe('with no store available', () => {
  it('reads nothing rather than throwing', () => {
    expect(loadLook(null)).toBeNull();
  });

  it('writes nothing rather than throwing', () => {
    expect(() => {
      saveWorld(DEFAULT_WORLD, null);
    }).not.toThrow();
  });

  /** Replaces the ambient store for the duration of `run`, then puts it back. */
  const withLocalStorage = (descriptor: PropertyDescriptor, run: () => void): void => {
    const original = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');

    Object.defineProperty(globalThis, 'localStorage', { configurable: true, ...descriptor });

    try {
      run();
    } finally {
      if (original) Object.defineProperty(globalThis, 'localStorage', original);
      else Reflect.deleteProperty(globalThis, 'localStorage');
    }
  };

  /** Safari with cookies blocked throws on the property access itself. */
  const withBlockedLocalStorage = (run: () => void): void => {
    withLocalStorage(
      {
        get() {
          throw new DOMException('access denied', 'SecurityError');
        },
      },
      run,
    );
  };

  /** A host that is not a browser defines no store at all. */
  const withoutLocalStorage = (run: () => void): void => {
    withLocalStorage({ value: undefined, writable: true }, run);
  };

  it('reads nothing when the host defines no store', () => {
    withoutLocalStorage(() => {
      expect(loadLook()).toBeNull();
    });
  });

  it('writes nothing when the host defines no store', () => {
    withoutLocalStorage(() => {
      expect(() => {
        saveWorld(DEFAULT_WORLD);
      }).not.toThrow();
    });
  });

  it('reads nothing when the browser denies access to the store', () => {
    withBlockedLocalStorage(() => {
      expect(loadLook()).toBeNull();
    });
  });

  it('writes nothing when the browser denies access to the store', () => {
    withBlockedLocalStorage(() => {
      expect(() => {
        saveWorld(DEFAULT_WORLD);
      }).not.toThrow();
    });
  });
});

describe('saveWorld', () => {
  it('swallows a quota error, because losing what she made is a normal scenario', () => {
    const storage = fakeStorage();
    vi.spyOn(storage, 'setItem').mockImplementation(() => {
      throw new DOMException('quota', 'QuotaExceededError');
    });

    expect(() => {
      saveWorld(DEFAULT_WORLD, storage);
    }).not.toThrow();
  });
});

describe('DEFAULT_LOOK', () => {
  it('starts on the first skin tone, wearing nothing but a face', () => {
    expect(DEFAULT_LOOK).toStrictEqual({
      schemaVersion: 1,
      skin: '#F7DCC3',
      equipped: {
        brows: { partId: 'brows.soft-arch', color: '#6B3A1F' },
        lips: { partId: 'lips.smile', color: '#C63F5A' },
        blush: { partId: 'blush.round', color: '#E8899B' },
      },
    });
  });
});

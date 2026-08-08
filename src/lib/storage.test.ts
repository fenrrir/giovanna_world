import { describe, expect, it, vi } from 'vitest';

import { DEFAULT_LOOK } from '../model/defaults';
import type { Look } from '../model/types';
import { CURRENT_LOOK_KEY, loadLook, saveLook } from './storage';

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

describe('saveLook and loadLook', () => {
  it('round-trips a look', () => {
    const storage = fakeStorage();

    saveLook(A_LOOK, storage);

    expect(loadLook(storage)).toStrictEqual(A_LOOK);
  });

  it('writes under the key the spec names', () => {
    const storage = fakeStorage();

    saveLook(A_LOOK, storage);

    expect(CURRENT_LOOK_KEY).toBe('look:current');
    expect(storage.getItem(CURRENT_LOOK_KEY)).toBe(JSON.stringify(A_LOOK));
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

describe('saveLook', () => {
  it('swallows a quota error, because losing a look is a normal scenario', () => {
    const storage = fakeStorage();
    vi.spyOn(storage, 'setItem').mockImplementation(() => {
      throw new DOMException('quota', 'QuotaExceededError');
    });

    expect(() => {
      saveLook(A_LOOK, storage);
    }).not.toThrow();
  });
});

describe('DEFAULT_LOOK', () => {
  it('starts on the first skin tone with nothing equipped', () => {
    expect(DEFAULT_LOOK).toStrictEqual({
      schemaVersion: 1,
      skin: '#F7DCC3',
      equipped: {},
    });
  });
});

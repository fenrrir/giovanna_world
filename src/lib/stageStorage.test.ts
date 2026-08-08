import { describe, expect, it } from 'vitest';

import { DEFAULT_STAGE } from '../model/stage';
import { CURRENT_LOOK_KEY, CURRENT_STAGE_KEY, loadStage, openingStage, saveStage } from './storage';

const fakeStorage = (): Storage => {
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

describe('the stage on disk', () => {
  it('round-trips what she left', () => {
    const storage = fakeStorage();

    saveStage({ ...DEFAULT_STAGE, dressing: 1 }, storage);

    expect(loadStage(storage)?.dressing).toBe(1);
  });

  it('is absent before she has played', () => {
    expect(loadStage(fakeStorage())).toBeNull();
    expect(openingStage(fakeStorage())).toStrictEqual(DEFAULT_STAGE);
  });

  it.each([
    ['invalid json', '{oops'],
    ['a stage from an unknown version', JSON.stringify({ ...DEFAULT_STAGE, schemaVersion: 9 })],
    [
      'a stage with one doll',
      JSON.stringify({ ...DEFAULT_STAGE, dolls: [DEFAULT_STAGE.dolls[0]] }),
    ],
    ['a stage dressing nobody', JSON.stringify({ ...DEFAULT_STAGE, dressing: 7 })],
    ['a backdrop that is not a part', JSON.stringify({ ...DEFAULT_STAGE, scene: 'meadow' })],
    ['something that is not a stage at all', JSON.stringify([1, 2, 3])],
  ])('starts from the default on %s', (_name, stored) => {
    const storage = fakeStorage();

    storage.setItem(CURRENT_STAGE_KEY, stored);

    expect(loadStage(storage)).toBeNull();
    expect(openingStage(storage)).toStrictEqual(DEFAULT_STAGE);
  });

  /*
   * Deliberately not migrated. One look could have become the first doll, but
   * the backdrop moved out of the look in the same change, so a migration would
   * have to guess which of two dolls a sky belonged to.
   */
  it('does not read a look stored before there were two of them', () => {
    const storage = fakeStorage();

    storage.setItem(CURRENT_LOOK_KEY, JSON.stringify(DEFAULT_STAGE.dolls[0]));

    expect(openingStage(storage)).toStrictEqual(DEFAULT_STAGE);
  });

  it('says nothing when the store refuses to write', () => {
    const refusing = fakeStorage();

    refusing.setItem = (): never => {
      throw new Error('quota');
    };

    expect(() => {
      saveStage(DEFAULT_STAGE, refusing);
    }).not.toThrow();
  });

  it('says nothing when there is no store at all', () => {
    expect(loadStage(null)).toBeNull();
    expect(() => {
      saveStage(DEFAULT_STAGE, null);
    }).not.toThrow();
  });
});

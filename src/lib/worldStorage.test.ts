import { describe, expect, it } from 'vitest';

import { DEFAULT_LOOK } from '../model/defaults';
import { PALETTES } from '../model/palettes';
import { DEFAULT_WORLD } from '../model/world';
import { CURRENT_LOOK_KEY, CURRENT_WORLD_KEY, loadWorld, openingWorld, saveWorld } from './storage';

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

const holding = (stored: unknown, key = CURRENT_WORLD_KEY): Storage => {
  const storage = fakeStorage();

  storage.setItem(key, JSON.stringify(stored));

  return storage;
};

describe('the world on disk', () => {
  it('round-trips where she left everything', () => {
    const storage = fakeStorage();
    const world = { ...DEFAULT_WORLD, here: 'park.meadow', dressing: null } as const;

    saveWorld(world, storage);

    expect(loadWorld(storage)).toStrictEqual(world);
  });

  it('is absent before she has played', () => {
    expect(loadWorld(fakeStorage())).toBeNull();
    expect(openingWorld(fakeStorage())).toStrictEqual(DEFAULT_WORLD);
  });

  it.each([
    ['invalid json', '{oops'],
    ['a world from an unknown version', JSON.stringify({ ...DEFAULT_WORLD, schemaVersion: 9 })],
    ['a world with one doll', JSON.stringify({ ...DEFAULT_WORLD, dolls: [DEFAULT_LOOK] })],
    ['a world dressing nobody it has', JSON.stringify({ ...DEFAULT_WORLD, dressing: 7 })],
    ['a room that is not a name', JSON.stringify({ ...DEFAULT_WORLD, here: 7 })],
    [
      'a placement that is not one',
      JSON.stringify({ ...DEFAULT_WORLD, placements: ['here', null] }),
    ],
    ['colours that are not colours', JSON.stringify({ ...DEFAULT_WORLD, colors: { a: 7 } })],
    ['something that is not a world at all', JSON.stringify([1, 2, 3])],
  ])('starts from the default on %s', (_name, stored) => {
    const storage = fakeStorage();

    storage.setItem(CURRENT_WORLD_KEY, stored);

    expect(loadWorld(storage)).toBeNull();
    expect(openingWorld(storage)).toStrictEqual(DEFAULT_WORLD);
  });

  /*
   * A room she can no longer reach costs her a backdrop, not the world. The
   * alternative is throwing the whole thing away over one name, which is how a
   * child loses two dolls and every outfit on them.
   */
  it('keeps a world that names a room this version no longer has', () => {
    const storage = holding({ ...DEFAULT_WORLD, here: 'house.attic', dressing: null });

    expect(loadWorld(storage)?.here).toBeNull();
    expect(loadWorld(storage)?.dolls).toHaveLength(2);
  });

  /*
   * The one migration. A look stored before there was a world becomes the first
   * doll, and the backdrop she was standing in is dropped rather than guessed
   * at — it belonged to neither doll, which is the whole reason it moved out.
   */
  it('makes the look she was wearing into the first doll', () => {
    const worn = { ...DEFAULT_LOOK, skin: PALETTES.skin[3] };
    const storage = holding(worn, CURRENT_LOOK_KEY);

    expect(openingWorld(storage).dolls[0].skin).toBe(PALETTES.skin[3]);
    expect(openingWorld(storage).dolls[1]).toStrictEqual(DEFAULT_WORLD.dolls[1]);
  });

  /* Carried across whole rather than edited on the way. Whatever she can no
     longer wear falls away on read, where every other repair happens. */
  it('carries the outfit across without editing it', () => {
    const worn = {
      ...DEFAULT_LOOK,
      equipped: { ...DEFAULT_LOOK.equipped, top: { partId: 'top.t-shirt', color: '#1D9E75' } },
    };

    expect(openingWorld(holding(worn, CURRENT_LOOK_KEY)).dolls[0].equipped).toStrictEqual(
      worn.equipped,
    );
  });

  it('prefers the world she left over the look she used to wear', () => {
    const storage = holding({ ...DEFAULT_WORLD, here: 'park.meadow' });

    storage.setItem(CURRENT_LOOK_KEY, JSON.stringify({ ...DEFAULT_LOOK, skin: PALETTES.skin[3] }));

    expect(openingWorld(storage).here).toBe('park.meadow');
    expect(openingWorld(storage).dolls[0].skin).toBe(DEFAULT_LOOK.skin);
  });

  it('says nothing when the store refuses to write', () => {
    const refusing = fakeStorage();

    refusing.setItem = (): never => {
      throw new Error('quota');
    };

    expect(() => {
      saveWorld(DEFAULT_WORLD, refusing);
    }).not.toThrow();
  });

  it('says nothing when there is no store at all', () => {
    expect(loadWorld(null)).toBeNull();
    expect(openingWorld(null)).toStrictEqual(DEFAULT_WORLD);
    expect(() => {
      saveWorld(DEFAULT_WORLD, null);
    }).not.toThrow();
  });
});

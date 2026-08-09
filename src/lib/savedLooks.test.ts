import { describe, expect, it } from 'vitest';

import { DEFAULT_LOOK } from '../model/defaults';
import { PALETTES } from '../model/palettes';
import type { Look } from '../model/types';
import {
  MAX_SAVED_LOOKS,
  SAVED_LOOKS_KEY,
  loadSavedLooks,
  saveSavedLooks,
  withSavedLook,
} from './storage';

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

const lookIn = (skin: string): Look => ({ ...DEFAULT_LOOK, skin });

const twelve = (): Look[] =>
  Array.from({ length: MAX_SAVED_LOOKS }, (_, index) => lookIn(`#00000${index.toString(16)}`));

describe('withSavedLook', () => {
  it('keeps the first look she saves', () => {
    expect(withSavedLook([], DEFAULT_LOOK)).toStrictEqual([DEFAULT_LOOK]);
  });

  it('puts the newest at the front, where her thumbnail appears first', () => {
    const older = lookIn(PALETTES.skin[3]);

    expect(withSavedLook([older], DEFAULT_LOOK)).toStrictEqual([DEFAULT_LOOK, older]);
  });

  /*
   * Twelve slots are too few to spend two on one outfit, and a child pressing
   * the button twice is not asking for a duplicate.
   */
  it('moves a look she already kept to the front instead of keeping it twice', () => {
    const other = lookIn(PALETTES.skin[2]);
    const album = withSavedLook(withSavedLook([], DEFAULT_LOOK), other);

    expect(withSavedLook(album, DEFAULT_LOOK)).toStrictEqual([DEFAULT_LOOK, other]);
  });

  it('drops the oldest once the album is full', () => {
    const full = twelve();
    const album = withSavedLook(full, lookIn('#FFFFFF'));

    expect(album).toHaveLength(MAX_SAVED_LOOKS);
    expect(album[0]?.skin).toBe('#FFFFFF');
    expect(album).not.toContain(full.at(-1));
  });

  it('never mutates the album it is given', () => {
    const album = Object.freeze([lookIn(PALETTES.skin[1])]);

    expect(() => withSavedLook(album, DEFAULT_LOOK)).not.toThrow();
    expect(album).toHaveLength(1);
  });

  /*
   * The same outfit reaches here spelled two ways: `sanitizeLook` rebuilds
   * `equipped` in iteration order and refills the painted slots at the end,
   * while the reducer writes each piece as she puts it on. Compared as raw
   * text those are two outfits, so the album fills with twins she cannot tell
   * apart and none of them ever shows as the one she is wearing.
   */
  it('treats one outfit as one, however its keys happen to be ordered', () => {
    const top = { partId: 'top.t-shirt', color: PALETTES.fabric[0] };
    const bottom = { partId: 'bottom.skirt', color: PALETTES.fabric[1] };
    const asWorn: Look = { ...DEFAULT_LOOK, equipped: { top, bottom } };
    const asRead: Look = { ...DEFAULT_LOOK, equipped: { bottom, top } };

    expect(withSavedLook([asWorn], asRead)).toStrictEqual([asRead]);
  });
});

describe('the album on disk', () => {
  it('is empty before she has kept anything', () => {
    expect(loadSavedLooks(fakeStorage())).toStrictEqual([]);
  });

  it('round-trips what she kept', () => {
    const storage = fakeStorage();
    const album = [DEFAULT_LOOK, lookIn(PALETTES.skin[2])];

    saveSavedLooks(album, storage);

    expect(loadSavedLooks(storage)).toStrictEqual(album);
  });

  /*
   * One entry a later version cannot read costs her that outfit, not the album.
   */
  it('drops only the entries it cannot read', () => {
    const storage = fakeStorage();

    storage.setItem(
      SAVED_LOOKS_KEY,
      JSON.stringify([DEFAULT_LOOK, { schemaVersion: 99 }, 'nonsense', lookIn('#123456')]),
    );

    expect(loadSavedLooks(storage).map((look) => look.skin)).toStrictEqual([
      DEFAULT_LOOK.skin,
      '#123456',
    ]);
  });

  it('reads nothing at all from invalid json', () => {
    const storage = fakeStorage();

    storage.setItem(SAVED_LOOKS_KEY, '{oops');

    expect(loadSavedLooks(storage)).toStrictEqual([]);
  });

  it('reads nothing at all when it is not a list', () => {
    const storage = fakeStorage();

    storage.setItem(SAVED_LOOKS_KEY, JSON.stringify(DEFAULT_LOOK));

    expect(loadSavedLooks(storage)).toStrictEqual([]);
  });

  it('never writes more than the album holds', () => {
    const storage = fakeStorage();

    saveSavedLooks([...twelve(), lookIn('#FFFFFF')], storage);

    expect(loadSavedLooks(storage)).toHaveLength(MAX_SAVED_LOOKS);
  });

  it('never reads more than the album holds, whatever is on disk', () => {
    const storage = fakeStorage();

    storage.setItem(SAVED_LOOKS_KEY, JSON.stringify([...twelve(), lookIn('#FFFFFF')]));

    expect(loadSavedLooks(storage)).toHaveLength(MAX_SAVED_LOOKS);
  });

  it('says nothing when the store refuses to write', () => {
    const refusing = fakeStorage();

    refusing.setItem = (): never => {
      throw new Error('quota');
    };

    expect(() => {
      saveSavedLooks([DEFAULT_LOOK], refusing);
    }).not.toThrow();
  });

  it('says nothing when there is no store at all', () => {
    expect(loadSavedLooks(null)).toStrictEqual([]);
    expect(() => {
      saveSavedLooks([DEFAULT_LOOK], null);
    }).not.toThrow();
  });
});

import { describe, expect, it } from 'vitest';

import { DEFAULT_LOOK } from '../model/defaults';
import { PALETTES } from '../model/palettes';
import { SELECTABLE_SLOTS } from '../model/slots';
import type { Look } from '../model/types';
import { randomLook } from './randomize';
import { RANDOM_TRAYS, TRAYS, trayItems, type TrayDefinition, type TrayItem } from './trays';

/** What the dice may land on: every piece in the tray, shaped ones included. */
const drawable = (tray: TrayDefinition): TrayItem[] => trayItems(tray);

/** The trays that always come up dressed, as against the ones that may not. */
const ALWAYS = RANDOM_TRAYS.filter((tray) => tray.randomised === 'always');
const SOMETIMES = RANDOM_TRAYS.filter((tray) => tray.randomised === 'sometimes');

/** Yields the given values in order, then repeats the last one. */
const sequence = (...values: number[]): (() => number) => {
  let index = 0;

  return () => values[Math.min(index++, values.length - 1)] ?? 0;
};

/** A doll already made up, wearing a bow, on a skin tone she chose. */
const dressed: Look = {
  ...DEFAULT_LOOK,
  skin: PALETTES.skin[2],
  equipped: {
    ...DEFAULT_LOOK.equipped,
    lips: { partId: 'lips.smile', color: PALETTES.makeup[3] },
    accessoryHead: { partId: 'accessoryHead.bow', color: PALETTES.fabric[1] },
    handheld: { partId: 'handheld.bag', color: PALETTES.fabric[3] },
    outer: { partId: 'outer.custom', color: PALETTES.fabric[0] },
    socks: { partId: 'socks.custom', color: PALETTES.fabric[2] },
  },
};

describe('randomLook', () => {
  it('dresses every outfit tray', () => {
    const look = randomLook(sequence(0), DEFAULT_LOOK);

    expect(look.equipped.hairBack).toBeDefined();
    expect(look.equipped.hairFront).toBeDefined();
    expect(look.equipped.top).toBeDefined();
    expect(look.equipped.bottom).toBeDefined();
    expect(look.equipped.shoes).toBeDefined();
  });

  it('picks the first of everything when the generator returns 0', () => {
    const look = randomLook(sequence(0), DEFAULT_LOOK);

    for (const tray of RANDOM_TRAYS) {
      expect(look.equipped[tray.slot]?.partId).toBe(drawable(tray)[0]?.id);
      expect(look.equipped[tray.slot]?.color).toBe(PALETTES[tray.palette][0]);
    }
  });

  it('picks the last of everything when the generator is just under 1', () => {
    const look = randomLook(sequence(0.999), DEFAULT_LOOK);

    // A high roll also means the optional trays come up bare, so only the
    // outfit is there to check.
    for (const tray of ALWAYS) {
      expect(look.equipped[tray.slot]?.partId).toBe(drawable(tray).at(-1)?.id);
      expect(look.equipped[tray.slot]?.color).toBe(PALETTES[tray.palette].at(-1));
    }
  });

  it('never picks past the end, even if the generator returns 1', () => {
    const look = randomLook(sequence(1), DEFAULT_LOOK);

    for (const tray of ALWAYS) {
      expect(look.equipped[tray.slot]?.partId).toBe(drawable(tray).at(-1)?.id);
    }
  });

  it('keeps both hair slots on the same style and colour', () => {
    const look = randomLook(sequence(0.5), DEFAULT_LOOK);

    expect(look.equipped.hairBack).toStrictEqual(look.equipped.hairFront);
  });

  /*
   * The dice used to skip generated pieces: landing on one could only ever have
   * drawn it at its default axes, a fixed piece wearing a disguise. Now the
   * axes are rolled too, which is what makes one worth landing on — and what
   * lets a jacket appear at all, since the only jacket there is is generated.
   */
  it('rolls the axes when it lands on a piece she would otherwise shape', () => {
    const shaped = randomLook(sequence(0.999), DEFAULT_LOOK).equipped.hairFront;

    expect(shaped?.partId).toBe('hair.custom');
    expect(shaped?.params).toBeDefined();
    expect(shaped?.params).not.toStrictEqual(DEFAULT_LOOK.equipped.hairFront?.params);
  });

  it('gives a generated piece a different shape on a different roll', () => {
    const low = randomLook(sequence(0), DEFAULT_LOOK).equipped.hairFront?.params;
    const high = randomLook(sequence(0.999), DEFAULT_LOOK).equipped.hairFront?.params;

    expect(low).not.toStrictEqual(high);
  });

  it('produces a valid look, ready to be stored', () => {
    const look = randomLook(sequence(0.3, 0.7, 0.1), DEFAULT_LOOK);

    expect(look.schemaVersion).toBe(1);
    expect(PALETTES.skin).toContain(look.skin);
  });

  it('varies with the generator', () => {
    const first = randomLook(sequence(0), DEFAULT_LOOK);
    const second = randomLook(sequence(0.999), DEFAULT_LOOK);

    expect(first).not.toStrictEqual(second);
  });

  /*
   * The randomiser owns the outfit and nothing else. Building from the default
   * instead of from the doll in front of the child would have reset all three of
   * these without ever looking like a bug.
   */
  it('leaves the skin tone alone', () => {
    expect(randomLook(sequence(0.999), dressed).skin).toBe(dressed.skin);
  });

  it('leaves the face she made alone', () => {
    const look = randomLook(sequence(0.999), dressed);

    expect(look.equipped.lips).toStrictEqual(dressed.equipped.lips);
    expect(look.equipped.brows).toStrictEqual(dressed.equipped.brows);
    expect(look.equipped.blush).toStrictEqual(dressed.equipped.blush);
  });

  /*
   * The dice give her a new outfit, so the old one comes off first. Left on,
   * anything the dice do not own would stay through every roll: a jacket worn
   * once was on for good, and dragging it off was the only way back.
   */
  it.each(['accessoryHead', 'handheld', 'outer', 'socks'] as const)(
    'takes the %s she was wearing off before deciding again',
    (slot) => {
      const kept = dressed.equipped[slot];
      const rolled = randomLook(sequence(0), dressed).equipped[slot];

      expect(rolled).not.toStrictEqual(kept);
    },
  );

  it('leaves nothing worn behind that it did not choose itself', () => {
    // A high roll leaves every optional tray bare, so what remains is the
    // outfit and nothing carried over.
    const look = randomLook(sequence(0.999), dressed);
    const worn = Object.keys(look.equipped).filter(
      (slot) => !['brows', 'lips', 'blush'].includes(slot),
    );

    expect(worn.sort()).toStrictEqual(['bottom', 'hairBack', 'hairFront', 'shoes', 'top']);
  });

  /* What she asked for: a jacket and a bag that turn up sometimes, not always. */
  it('dresses an optional tray on a low roll and leaves it bare on a high one', () => {
    for (const tray of SOMETIMES) {
      expect(randomLook(sequence(0), dressed).equipped[tray.slot]).toBeDefined();
      expect(randomLook(sequence(0.999), dressed).equipped[tray.slot]).toBeUndefined();
    }
  });

  it('replaces the outfit she was wearing', () => {
    const look = randomLook(sequence(0), dressed);

    const top = TRAYS.find((tray) => tray.id === 'top')!;

    expect(look.equipped.top?.partId).toBe(trayItems(top)[0]?.id);
  });

  it('covers every tray the child can open', () => {
    expect(TRAYS.map((tray) => tray.id)).toStrictEqual([...SELECTABLE_SLOTS]);
  });

  it('always dresses the outfit and only sometimes the rest', () => {
    expect(ALWAYS.map((tray) => tray.id)).toStrictEqual(['hair', 'top', 'bottom', 'shoes']);
    expect(SOMETIMES.map((tray) => tray.id)).toStrictEqual([
      'socks',
      'outer',
      'accessoryHead',
      'handheld',
    ]);
  });
});

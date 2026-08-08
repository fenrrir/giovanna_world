import { describe, expect, it } from 'vitest';

import { DEFAULT_LOOK } from '../model/defaults';
import { PALETTES } from '../model/palettes';
import { SELECTABLE_SLOTS } from '../model/slots';
import type { Look } from '../model/types';
import { randomLook } from './randomize';
import { RANDOM_TRAYS, TRAYS, trayItems, type TrayDefinition, type TrayItem } from './trays';

/** What the dice may land on: every piece except the ones she shapes herself. */
const drawable = (tray: TrayDefinition): TrayItem[] =>
  trayItems(tray).filter((item) => !item.shaped);

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

    for (const tray of RANDOM_TRAYS) {
      expect(look.equipped[tray.slot]?.partId).toBe(drawable(tray).at(-1)?.id);
      expect(look.equipped[tray.slot]?.color).toBe(PALETTES[tray.palette].at(-1));
    }
  });

  it('never picks past the end, even if the generator returns 1', () => {
    const look = randomLook(sequence(1), DEFAULT_LOOK);

    for (const tray of RANDOM_TRAYS) {
      expect(look.equipped[tray.slot]?.partId).toBe(drawable(tray).at(-1)?.id);
    }
  });

  it('keeps both hair slots on the same style and colour', () => {
    const look = randomLook(sequence(0.5), DEFAULT_LOOK);

    expect(look.equipped.hairBack).toStrictEqual(look.equipped.hairFront);
  });

  /*
   * Choosing it opens the axes that shape it, so a roll of the dice landing on
   * it would open an editor the child never asked for. It could only ever be
   * drawn at its default axes anyway — a fixed piece wearing a disguise.
   */
  it('never lands on the hairstyle she shapes herself', () => {
    for (const rng of [sequence(0), sequence(0.5), sequence(0.999), sequence(1)]) {
      expect(randomLook(rng, DEFAULT_LOOK).equipped.hairFront?.partId).not.toBe('hair.custom');
    }
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
    'takes off the %s she was wearing, since the dice cannot replace it',
    (slot) => {
      expect(randomLook(sequence(0.999), dressed).equipped[slot]).toBeUndefined();
    },
  );

  it('leaves nothing worn behind that it did not choose itself', () => {
    const look = randomLook(sequence(0.5), dressed);
    const worn = Object.keys(look.equipped).filter(
      (slot) => !['brows', 'lips', 'blush'].includes(slot),
    );

    expect(worn.sort()).toStrictEqual(['bottom', 'hairBack', 'hairFront', 'shoes', 'top']);
  });

  it('replaces the outfit she was wearing', () => {
    const look = randomLook(sequence(0), dressed);

    expect(look.equipped.top?.partId).toBe(trayItems(TRAYS[4]!)[0]?.id);
  });

  it('covers every tray the child can open', () => {
    expect(TRAYS.map((tray) => tray.id)).toStrictEqual([...SELECTABLE_SLOTS]);
  });

  it('randomises the outfit trays and only those', () => {
    expect(RANDOM_TRAYS.map((tray) => tray.id)).toStrictEqual(['hair', 'top', 'bottom', 'shoes']);
  });
});

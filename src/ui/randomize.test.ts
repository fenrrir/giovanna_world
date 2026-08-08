import { describe, expect, it } from 'vitest';

import { PALETTES } from '../model/palettes';
import { SELECTABLE_SLOTS } from '../model/slots';
import { randomLook } from './randomize';
import { TRAYS, trayItems } from './trays';

/** Yields the given values in order, then repeats the last one. */
const sequence = (...values: number[]): (() => number) => {
  let index = 0;

  return () => values[Math.min(index++, values.length - 1)] ?? 0;
};

describe('randomLook', () => {
  it('dresses every tray', () => {
    const look = randomLook(sequence(0));

    expect(look.equipped.hairBack).toBeDefined();
    expect(look.equipped.hairFront).toBeDefined();
    expect(look.equipped.top).toBeDefined();
    expect(look.equipped.bottom).toBeDefined();
    expect(look.equipped.shoes).toBeDefined();
  });

  it('picks the first of everything when the generator returns 0', () => {
    const look = randomLook(sequence(0));

    expect(look.skin).toBe(PALETTES.skin[0]);

    for (const tray of TRAYS) {
      expect(look.equipped[tray.slot]?.partId).toBe(trayItems(tray)[0]?.id);
      expect(look.equipped[tray.slot]?.color).toBe(PALETTES[tray.palette][0]);
    }
  });

  it('picks the last of everything when the generator is just under 1', () => {
    const look = randomLook(sequence(0.999));

    expect(look.skin).toBe(PALETTES.skin.at(-1));

    for (const tray of TRAYS) {
      expect(look.equipped[tray.slot]?.partId).toBe(trayItems(tray).at(-1)?.id);
      expect(look.equipped[tray.slot]?.color).toBe(PALETTES[tray.palette].at(-1));
    }
  });

  it('never picks past the end, even if the generator returns 1', () => {
    const look = randomLook(sequence(1));

    for (const tray of TRAYS) {
      expect(look.equipped[tray.slot]?.partId).toBe(trayItems(tray).at(-1)?.id);
    }
  });

  it('keeps both hair slots on the same style and colour', () => {
    const look = randomLook(sequence(0.5));

    expect(look.equipped.hairBack).toStrictEqual(look.equipped.hairFront);
  });

  it('produces a valid look, ready to be stored', () => {
    const look = randomLook(sequence(0.3, 0.7, 0.1));

    expect(look.schemaVersion).toBe(1);
    expect(PALETTES.skin).toContain(look.skin);
  });

  it('varies with the generator', () => {
    const first = randomLook(sequence(0));
    const second = randomLook(sequence(0.999));

    expect(first).not.toStrictEqual(second);
  });

  it('covers every tray the child can open', () => {
    expect(TRAYS.map((tray) => tray.id)).toStrictEqual([...SELECTABLE_SLOTS]);
  });
});

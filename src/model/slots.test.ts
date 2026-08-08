import { describe, expect, it } from 'vitest';

import { RENDER_ORDER, SELECTABLE_SLOTS, Z } from './slots';

describe('Z', () => {
  it("holds every slot with its spec value, and the face in the body's gap", () => {
    expect(Z).toStrictEqual({
      scene: -10,
      hairBack: 0,
      body: 10,
      blush: 12,
      brows: 14,
      lips: 16,
      socks: 20,
      shoes: 30,
      bottom: 40,
      top: 50,
      outer: 60,
      hairFront: 70,
      accessoryFace: 75,
      accessoryHead: 80,
      handheld: 90,
    });
  });

  it('gives every slot a distinct depth', () => {
    const values = Object.values(Z);

    expect(new Set(values).size).toBe(values.length);
  });

  /*
   * What the gap above the body was left for. The face has to be over the skin
   * and under the fringe: painted below the body it would vanish, painted above
   * the fringe it would sit on top of the hair.
   */
  it('paints the face above the body and below the fringe', () => {
    for (const slot of ['blush', 'brows', 'lips'] as const) {
      expect(Z[slot]).toBeGreaterThan(Z.body);
      expect(Z[slot]).toBeLessThan(Z.hairFront);
    }
  });
});

describe('RENDER_ORDER', () => {
  it('lists every slot exactly once', () => {
    expect([...RENDER_ORDER].sort()).toStrictEqual(Object.keys(Z).sort());
  });

  it('runs back to front, ascending by z', () => {
    const zValues = RENDER_ORDER.map((slot) => Z[slot]);

    expect(zValues).toStrictEqual([...zValues].sort((a, b) => a - b));
  });

  it('starts at the backdrop and ends at the handheld object', () => {
    expect(RENDER_ORDER[0]).toBe('scene');
    expect(RENDER_ORDER.at(-1)).toBe('handheld');
  });
});

describe('SELECTABLE_SLOTS', () => {
  it('offers the child every tray, in the order they appear on screen', () => {
    expect(SELECTABLE_SLOTS).toStrictEqual([
      'scene',
      'hair',
      'brows',
      'lips',
      'blush',
      'top',
      'bottom',
      'socks',
      'shoes',
      'outer',
      'accessoryHead',
      'handheld',
    ]);
  });

  it('never offers the body, which is not a choice', () => {
    expect(SELECTABLE_SLOTS as readonly string[]).not.toContain('body');
  });
});

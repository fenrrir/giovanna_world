import { describe, expect, it } from 'vitest';

import { RENDER_ORDER, SELECTABLE_SLOTS, Z } from './slots';

describe('Z', () => {
  it('holds exactly the eleven slots from the spec, with the spec values', () => {
    expect(Z).toStrictEqual({
      hairBack: 0,
      body: 10,
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

  it('leaves room between layers for future insertions', () => {
    const values = Object.values(Z).sort((a, b) => a - b);
    const gaps = values.slice(1).map((value, index) => value - values[index]!);

    expect(Math.min(...gaps)).toBeGreaterThanOrEqual(5);
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

  it('starts at the back hair and ends at the handheld object', () => {
    expect(RENDER_ORDER[0]).toBe('hairBack');
    expect(RENDER_ORDER.at(-1)).toBe('handheld');
  });
});

describe('SELECTABLE_SLOTS', () => {
  it('offers the child every tray, in the order they appear on screen', () => {
    expect(SELECTABLE_SLOTS).toStrictEqual(['hair', 'top', 'bottom', 'shoes', 'accessoryHead']);
  });

  it('never offers the body, which is not a choice', () => {
    expect(SELECTABLE_SLOTS as readonly string[]).not.toContain('body');
  });
});

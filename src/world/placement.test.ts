import { describe, expect, it } from 'vitest';

import { ANCHORS, VIEW_BOX } from '../anchors';
import { dollTransform } from './placement';

const GROUND = { y: ANCHORS.sole.y, scale: 1 };

/** The same body, drawn ten to the right and ten down. */
const shifted = {
  ...ANCHORS,
  sole: { y: ANCHORS.sole.y + 10 },
  dollBounds: { x1: ANCHORS.dollBounds.x1 + 10, x2: ANCHORS.dollBounds.x2 + 10 },
};

describe('dollTransform', () => {
  /* At the size and height she is drawn at, standing in the middle is where she
     already is — so the two scenes that predate the world need no adjusting. */
  it('does nothing at all when the floor is where her feet already are', () => {
    expect(dollTransform(GROUND, 0.5)).toBe('translate(0 0) scale(1)');
  });

  it('stands her against the left edge without pushing her through it', () => {
    const transform = dollTransform(GROUND, 0);

    expect(transform).toBe(`translate(${String(-ANCHORS.dollBounds.x1)} 0) scale(1)`);
  });

  it('stands her against the right edge without pushing her through it', () => {
    const spare = VIEW_BOX.width - ANCHORS.dollBounds.x2;

    expect(dollTransform(GROUND, 1)).toBe(`translate(${String(spare)} 0) scale(1)`);
  });

  /* A six-year-old aims past the edge, and the drawing must not follow her
     there even if a stored placement somehow does. */
  it('keeps her inside the canvas however far past it she is put', () => {
    expect(dollTransform(GROUND, -4)).toBe(dollTransform(GROUND, 0));
    expect(dollTransform(GROUND, 9)).toBe(dollTransform(GROUND, 1));
  });

  /*
   * The two contracts meeting. Every part is asserted to stay within
   * `dollBounds`, and this puts those bounds exactly on the canvas edges at
   * either end — so no piece of artwork can be cut off by being stood in a
   * corner, at any size, without one of the two suites saying so.
   */
  it.each([1, 0.5, 0.25])('lands her declared bounds on the canvas edges at scale %s', (scale) => {
    const at = (x: number): { dx: number; s: number } => {
      const [, dx, , s] = /translate\((-?[\d.]+) (-?[\d.]+)\) scale\(([\d.]+)\)/.exec(
        dollTransform({ y: ANCHORS.sole.y, scale }, x),
      )!;

      return { dx: Number(dx), s: Number(s) };
    };

    const left = at(0);
    const right = at(1);

    expect(left.dx + ANCHORS.dollBounds.x1 * left.s).toBeCloseTo(0);
    expect(right.dx + ANCHORS.dollBounds.x2 * right.s).toBeCloseTo(VIEW_BOX.width);
  });

  it('rests her feet on the floor the room declares', () => {
    expect(dollTransform({ y: 400, scale: 1 }, 0.5)).toBe(
      `translate(0 ${String(400 - ANCHORS.sole.y)}) scale(1)`,
    );
  });

  it('shrinks her to the size the room asks for', () => {
    expect(dollTransform({ y: ANCHORS.sole.y, scale: 0.5 }, 0.5)).toMatch(/scale\(0\.5\)$/);
  });

  /* Half the size means half the coordinates, so standing her in the middle of
     the room takes a translate of its own rather than none. */
  it('rests her feet on the floor at that size too, and still centres her', () => {
    const middle = (ANCHORS.dollBounds.x1 + ANCHORS.dollBounds.x2) / 2;
    const dx = VIEW_BOX.width / 2 - middle * 0.5;
    const dy = 400 - ANCHORS.sole.y * 0.5;

    expect(dollTransform({ y: 400, scale: 0.5 }, 0.5)).toBe(
      `translate(${String(dx)} ${String(dy)}) scale(0.5)`,
    );
  });

  /*
   * The anchor test, the same one every generated part owes. Moving the body
   * inside its own canvas must not move where she stands in the room: the
   * transform is derived from the anchors, so it has to absorb the shift.
   */
  it('leaves her standing in the same place when the body itself moves', () => {
    const centred = dollTransform({ y: 400, scale: 1 }, 0.5, shifted);

    expect(centred).toBe(`translate(-10 ${String(400 - ANCHORS.sole.y - 10)}) scale(1)`);
  });
});

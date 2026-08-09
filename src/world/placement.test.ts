import { describe, expect, it } from 'vitest';

import { ANCHORS, VIEW_BOX } from '../anchors';
import { acrossFloor, canvasX, dollTransform } from './placement';

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

describe('canvasX', () => {
  /* The canvas exactly fills its box: no letterboxing to undo. */
  it('reads a point straight off a box of the same shape', () => {
    const box = { left: 0, top: 0, width: VIEW_BOX.width, height: VIEW_BOX.height };

    expect(canvasX(0, box)).toBe(0);
    expect(canvasX(340, box)).toBe(340);
  });

  it('takes the box off the screen into account', () => {
    const box = { left: 100, top: 0, width: VIEW_BOX.width, height: VIEW_BOX.height };

    expect(canvasX(100, box)).toBe(0);
  });

  it('scales a box drawn smaller than the canvas', () => {
    const box = { left: 0, top: 0, width: VIEW_BOX.width / 2, height: VIEW_BOX.height / 2 };

    expect(canvasX(VIEW_BOX.width / 4, box)).toBe(VIEW_BOX.width / 2);
  });

  /*
   * The one this exists for. A box wider than the canvas letterboxes it with
   * empty space down each side, and measuring against the box rather than the
   * drawing would put her further right than the child let go.
   */
  it('ignores the empty space beside a canvas in too wide a box', () => {
    const box = { left: 0, top: 0, width: VIEW_BOX.width + 200, height: VIEW_BOX.height };

    expect(canvasX(100, box)).toBe(0);
    expect(canvasX(100 + VIEW_BOX.width, box)).toBe(VIEW_BOX.width);
  });
});

describe('acrossFloor', () => {
  /* The two have to be exact inverses, or a doll lands somewhere other than
     where the finger let her go. */
  it.each([0, 0.25, 0.5, 0.75, 1])('undoes dollTransform at %s', (x) => {
    for (const scale of [1, 0.5]) {
      const floor = { y: ANCHORS.sole.y, scale };
      const [, dx] = /translate\((-?[\d.]+) /.exec(dollTransform(floor, x))!;
      const middle = (ANCHORS.dollBounds.x1 + ANCHORS.dollBounds.x2) / 2;

      expect(acrossFloor(floor, Number(dx) + middle * scale)).toBeCloseTo(x);
    }
  });

  it('keeps a finger past the edge inside the room', () => {
    const floor = { y: ANCHORS.sole.y, scale: 1 };

    expect(acrossFloor(floor, -400)).toBe(0);
    expect(acrossFloor(floor, VIEW_BOX.width + 400)).toBe(1);
  });
});

import { ANCHORS } from '../../anchors';

/**
 * Where a shoe may be drawn, per foot.
 *
 * The two shoe anchors overlap by 8 px, which is room to work in rather than an
 * instruction to fill: filling both makes the pair read as one wide platform.
 * But the inner edge cannot be pulled back to taste either — cut past the leg
 * and bare skin shows between the shoe and its sole.
 *
 * So the inner edge is derived from the leg the shoe has to cover. Every shoe
 * starts from these boxes, which is why the mistake can only be made once.
 */

const { shoeLeft, shoeRight, legLeft, legRight, sole } = ANCHORS;

export type ShoeBox = { x1: number; x2: number; y1: number; y2: number };

/** How far a shoe reaches past the foot it covers. */
const COVER = 2;

export const LEFT_SHOE: ShoeBox = { ...shoeLeft, x2: legLeft.x2 + COVER };
export const RIGHT_SHOE: ShoeBox = { ...shoeRight, x1: legRight.x1 - COVER };

export const SOLE_Y = sole.y;

/**
 * The upper: rounded across the top, square along the bottom where the sole
 * meets it. Rounding all four corners — the obvious `rx` on a `rect` — curves
 * the inner bottom corner away from the foot and leaves a sliver of skin at the
 * join.
 */
export const upperPath = (box: ShoeBox, soleTop: number, radius: number): string => {
  const n = (value: number): string => String(value);

  return `M ${n(box.x1)} ${n(box.y1 + radius)}
          Q ${n(box.x1)} ${n(box.y1)} ${n(box.x1 + radius)} ${n(box.y1)}
          L ${n(box.x2 - radius)} ${n(box.y1)}
          Q ${n(box.x2)} ${n(box.y1)} ${n(box.x2)} ${n(box.y1 + radius)}
          L ${n(box.x2)} ${n(soleTop)} L ${n(box.x1)} ${n(soleTop)} Z`;
};

/** The sole: square along the top, rounded only where a sole is actually round. */
export const solePath = (box: ShoeBox, soleTop: number, radius: number): string => {
  const n = (value: number): string => String(value);

  return `M ${n(box.x1)} ${n(soleTop)} L ${n(box.x2)} ${n(soleTop)}
          L ${n(box.x2)} ${n(SOLE_Y - radius)}
          Q ${n(box.x2)} ${n(SOLE_Y)} ${n(box.x2 - radius)} ${n(SOLE_Y)}
          L ${n(box.x1 + radius)} ${n(SOLE_Y)}
          Q ${n(box.x1)} ${n(SOLE_Y)} ${n(box.x1)} ${n(SOLE_Y - radius)} Z`;
};

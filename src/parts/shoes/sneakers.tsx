import type { ReactNode } from 'react';

import { ANCHORS } from '../../anchors';
import { FOLD, shade } from '../../lib/color';
import { FIXED_COLORS } from '../../model/palettes';
import type { Part } from '../../model/types';

/**
 * A pair of low sneakers with white laces.
 *
 * Each shoe fills its anchor box and its sole sits flush on y 494, so the doll
 * stands on the ground line rather than floating above it.
 */

const { shoeLeft, shoeRight, legLeft, legRight, sole } = ANCHORS;

const SOLE_HEIGHT = 10;
const TOE_RADIUS = 12;

/** How far the shoe reaches past the foot it covers. */
const COVER = 2;

type ShoeBox = { x1: number; x2: number; y1: number; y2: number };

const n = (value: number): string => String(value);

/**
 * The upper is rounded at the top and square at the bottom; the sole is square
 * at the top and rounded at the bottom. Rounding all four corners of each — the
 * obvious `rx` on a `rect` — curves the inner bottom corner away from the foot
 * and leaves a sliver of bare skin showing at the join.
 */
const shoe = (box: ShoeBox, color: string, laceX: number): ReactNode => {
  const soleTop = sole.y - SOLE_HEIGHT;
  const r = TOE_RADIUS;
  const soleR = 4;

  return (
    <g>
      <path
        d={`M ${n(box.x1)} ${n(box.y1 + r)}
            Q ${n(box.x1)} ${n(box.y1)} ${n(box.x1 + r)} ${n(box.y1)}
            L ${n(box.x2 - r)} ${n(box.y1)}
            Q ${n(box.x2)} ${n(box.y1)} ${n(box.x2)} ${n(box.y1 + r)}
            L ${n(box.x2)} ${n(soleTop)} L ${n(box.x1)} ${n(soleTop)} Z`}
        fill={color}
      />
      <path
        d={`M ${n(box.x1)} ${n(soleTop)} L ${n(box.x2)} ${n(soleTop)}
            L ${n(box.x2)} ${n(sole.y - soleR)}
            Q ${n(box.x2)} ${n(sole.y)} ${n(box.x2 - soleR)} ${n(sole.y)}
            L ${n(box.x1 + soleR)} ${n(sole.y)}
            Q ${n(box.x1)} ${n(sole.y)} ${n(box.x1)} ${n(sole.y - soleR)} Z`}
        fill={shade(color, FOLD)}
      />
      <path
        d={`M ${n(laceX - 11)} ${n(box.y1 + 10)} L ${n(laceX + 11)} ${n(box.y1 + 18)}
            M ${n(laceX - 11)} ${n(box.y1 + 18)} L ${n(laceX + 11)} ${n(box.y1 + 10)}`}
        fill="none"
        stroke={FIXED_COLORS.collarWhite}
        strokeWidth={4}
        strokeLinecap="round"
      />
    </g>
  );
};

/**
 * The two shoe anchor boxes overlap by 8 px, which is room to work in rather
 * than an instruction to fill: filling both makes the pair read as one wide
 * platform. But the inner edge cannot simply be pulled back to taste either —
 * cut past the foot and bare skin shows between the shoe and its sole.
 *
 * So the inner edge is derived from the leg it has to cover, not chosen. Move
 * the legs and the shoes follow.
 */
const LEFT: ShoeBox = { ...shoeLeft, x2: legLeft.x2 + COVER };
const RIGHT: ShoeBox = { ...shoeRight, x1: legRight.x1 - COVER };

const render = (color: string): ReactNode => (
  <g>
    {shoe(LEFT, color, (LEFT.x1 + LEFT.x2) / 2)}
    {shoe(RIGHT, color, (RIGHT.x1 + RIGHT.x2) / 2)}
  </g>
);

export const SNEAKERS: Part = {
  id: 'shoes.sneakers',
  slot: 'shoes',
  palette: 'fabric',
  render,
};

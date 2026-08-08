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

const { shoeLeft, shoeRight, sole } = ANCHORS;

const SOLE_HEIGHT = 10;
const TOE_RADIUS = 12;

/**
 * The two shoe anchor boxes overlap by 8 px, which is room to work in rather
 * than an instruction to fill. Each shoe is pulled back from the centre line so
 * the pair reads as two shoes instead of one wide platform.
 */
const CENTRE_GAP = 6;

type ShoeBox = { x1: number; x2: number; y1: number; y2: number };

const shoe = (box: ShoeBox, color: string, laceX: number): ReactNode => {
  const soleTop = sole.y - SOLE_HEIGHT;

  return (
    <g>
      <rect
        x={box.x1}
        y={box.y1}
        width={box.x2 - box.x1}
        height={soleTop - box.y1 + 2}
        rx={TOE_RADIUS}
        fill={color}
      />
      <rect
        x={box.x1}
        y={soleTop}
        width={box.x2 - box.x1}
        height={SOLE_HEIGHT}
        rx={4}
        fill={shade(color, FOLD)}
      />
      <path
        d={`M ${String(laceX - 11)} ${String(box.y1 + 8)} L ${String(laceX + 11)} ${String(box.y1 + 16)}
            M ${String(laceX - 11)} ${String(box.y1 + 16)} L ${String(laceX + 11)} ${String(box.y1 + 8)}`}
        fill="none"
        stroke={FIXED_COLORS.collarWhite}
        strokeWidth={4}
        strokeLinecap="round"
      />
    </g>
  );
};

const centre = (shoeLeft.x2 + shoeRight.x1) / 2;

const LEFT: ShoeBox = { ...shoeLeft, x2: centre - CENTRE_GAP };
const RIGHT: ShoeBox = { ...shoeRight, x1: centre + CENTRE_GAP };

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

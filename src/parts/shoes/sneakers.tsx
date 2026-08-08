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

const render = (color: string): ReactNode => (
  <g>
    {shoe(shoeLeft, color, (shoeLeft.x1 + shoeLeft.x2) / 2 - 4)}
    {shoe(shoeRight, color, (shoeRight.x1 + shoeRight.x2) / 2 + 4)}
  </g>
);

export const SNEAKERS: Part = {
  id: 'shoes.sneakers',
  slot: 'shoes',
  palette: 'fabric',
  render,
};

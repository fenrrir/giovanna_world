import type { ReactNode } from 'react';

import { FOLD, shade } from '../../lib/color';
import { FIXED_COLORS } from '../../model/palettes';
import type { Part } from '../../model/types';
import { LEFT_SHOE, RIGHT_SHOE, SOLE_Y, solePath, upperPath, type ShoeBox } from './shoeBoxes';

/**
 * A pair of low sneakers with white laces.
 *
 * The boxes and the two path shapes come from shoeBoxes, which is where the
 * rules live: the inner edge is derived from the leg, and only the ends a shoe
 * is actually round at are rounded.
 */

const SOLE_HEIGHT = 10;
const TOE_RADIUS = 12;
const SOLE_RADIUS = 4;

const soleTop = SOLE_Y - SOLE_HEIGHT;

const n = (value: number): string => String(value);

const shoe = (box: ShoeBox, color: string): ReactNode => {
  const laceX = (box.x1 + box.x2) / 2;

  return (
    <g>
      <path d={upperPath(box, soleTop, TOE_RADIUS)} fill={color} />
      <path d={solePath(box, soleTop, SOLE_RADIUS)} fill={shade(color, FOLD)} />
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

const render = (color: string): ReactNode => (
  <g>
    {shoe(LEFT_SHOE, color)}
    {shoe(RIGHT_SHOE, color)}
  </g>
);

export const SNEAKERS: Part = {
  id: 'shoes.sneakers',
  slot: 'shoes',
  palette: 'fabric',
  render,
};

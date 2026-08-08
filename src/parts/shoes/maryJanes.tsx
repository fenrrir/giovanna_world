import type { ReactNode } from 'react';

import { FOLD, HIGHLIGHT, shade } from '../../lib/color';
import { FIXED_COLORS } from '../../model/palettes';
import type { Part } from '../../model/types';
import { LEFT_SHOE, RIGHT_SHOE, SOLE_Y, solePath, upperPath, type ShoeBox } from './shoeBoxes';

/**
 * Rounded flat shoes with a single strap across the instep and a small buckle.
 *
 * The boxes and the two path shapes come from shoeBoxes, which is where the
 * rules live: the inner edge is derived from the leg, and only the ends a shoe
 * is actually round at are rounded.
 */

const SOLE_HEIGHT = 8;
const TOE_RADIUS = 10;
const SOLE_RADIUS = 3;

/** Below the rounded toe, where the upper is at full width: a strap drawn
 * across the curve sticks out past the shoe on both sides. */
const STRAP_TOP = 474;
const STRAP_HEIGHT = 7;
const BUCKLE = 5;

const soleTop = SOLE_Y - SOLE_HEIGHT;

const shoe = (box: ShoeBox, color: string): ReactNode => (
  <g>
    <path d={upperPath(box, soleTop, TOE_RADIUS)} fill={color} />
    <path d={solePath(box, soleTop, SOLE_RADIUS)} fill={shade(color, FOLD)} />

    {/* A single strap across the instep, one tone up so it reads as a band. */}
    <rect
      x={box.x1}
      y={STRAP_TOP}
      width={box.x2 - box.x1}
      height={STRAP_HEIGHT}
      fill={shade(color, HIGHLIGHT)}
    />
    <rect
      x={(box.x1 + box.x2) / 2 - BUCKLE / 2}
      y={STRAP_TOP - 1}
      width={BUCKLE}
      height={STRAP_HEIGHT + 2}
      fill={FIXED_COLORS.collarWhite}
    />
  </g>
);

const render = (color: string): ReactNode => (
  <g>
    {shoe(LEFT_SHOE, color)}
    {shoe(RIGHT_SHOE, color)}
  </g>
);

export const MARY_JANES: Part = {
  id: 'shoes.mary-janes',
  slot: 'shoes',
  palette: 'fabric',
  render,
};

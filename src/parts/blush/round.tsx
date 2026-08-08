import type { ReactNode } from 'react';

import { ANCHORS } from '../../anchors';
import { BLUSH_OPACITY } from '../../model/palettes';
import type { Part } from '../../model/types';

/**
 * Two soft patches on the cheeks.
 *
 * Carried over from the body, which drew them in a fixed colour. The softness
 * comes from opacity rather than from a lighter tone, so every colour in the
 * palette stays soft — a dark one mixed toward the skin instead of derived
 * would read as a bruise.
 */

const { eyeLine } = ANCHORS;

const OUTSET = 14;
const DROP = 18;
const RADIUS_X = 14;
const RADIUS_Y = 9;

const CHEEKS = [eyeLine.xLeft - OUTSET, eyeLine.xRight + OUTSET] as const;

const render = (color: string): ReactNode => (
  <g>
    {CHEEKS.map((cx) => (
      <ellipse
        key={String(cx)}
        cx={cx}
        cy={eyeLine.y + DROP}
        rx={RADIUS_X}
        ry={RADIUS_Y}
        fill={color}
        opacity={BLUSH_OPACITY}
      />
    ))}
  </g>
);

export const ROUND_BLUSH: Part = {
  id: 'blush.round',
  slot: 'blush',
  palette: 'makeup',
  render,
};

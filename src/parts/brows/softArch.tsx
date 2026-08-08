import type { ReactNode } from 'react';

import { ANCHORS } from '../../anchors';
import type { Part } from '../../model/types';

/**
 * A pair of soft arched eyebrows.
 *
 * Placed from the eye line rather than by eye, and mirrored about the doll's
 * centre so the two can never drift apart. They sit below `hairFront`, so a
 * fringe covers them the way a fringe covers real eyebrows.
 */

const { eyeLine } = ANCHORS;
const CENTRE = (eyeLine.xLeft + eyeLine.xRight) / 2;

const HALF_WIDTH = 12;
/** How far above the eye the arch peaks, and how far its ends drop from there. */
const PEAK = 24;
const OUTER_DROP = 10;
const INNER_DROP = 7;
const THICKNESS = 5;

/** +1 draws the doll's right brow, -1 its left. */
type Side = 1 | -1;

const browPath = (side: Side): string => {
  const centre = CENTRE + side * (eyeLine.xRight - CENTRE);
  const outer = centre + side * HALF_WIDTH;
  const inner = centre - side * HALF_WIDTH;

  return [
    `M ${String(outer)} ${String(eyeLine.y - PEAK + OUTER_DROP)}`,
    `Q ${String(centre)} ${String(eyeLine.y - PEAK)}`,
    `${String(inner)} ${String(eyeLine.y - PEAK + INNER_DROP)}`,
  ].join(' ');
};

const render = (color: string): ReactNode => (
  <g>
    {([-1, 1] as const).map((side) => (
      <path
        key={String(side)}
        d={browPath(side)}
        fill="none"
        stroke={color}
        strokeWidth={THICKNESS}
        strokeLinecap="round"
      />
    ))}
  </g>
);

export const SOFT_ARCH: Part = {
  id: 'brows.soft-arch',
  slot: 'brows',
  palette: 'hair',
  render,
};

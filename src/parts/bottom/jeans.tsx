import type { ReactNode } from 'react';

import { ANCHORS } from '../../anchors';
import { FOLD, HIGHLIGHT, shade } from '../../lib/color';
import type { Part } from '../../model/types';

/**
 * Full-length trousers with a waistband, a centre seam and turned-up cuffs.
 *
 * One shape with a notch at the crotch rather than two separate legs, so the
 * seat cannot come apart from the legs.
 *
 * Every edge is derived from the leg it has to cover, including the taper at
 * the hem. Tapering by eye is what left bare shin down the outside of each
 * ankle the first time round — the same mistake the shoes made (see CLAUDE.md).
 */

const { waist, legLeft, legRight, ankle } = ANCHORS;

const TOP = waist.y - 2;
const BAND = TOP + 20;
const CROTCH = 352;
/** Just past the ankle, so the cuff sits on it rather than floating above. */
const HEM = ankle.y + 8;
const CUFF = HEM - 20;

/** Clearance the trouser keeps outside the leg, at the hip and at the hem. */
const HIP_COVER = 6;
const HEM_COVER = 2;

const HIP_LEFT = legLeft.x1 - HIP_COVER;
const HIP_RIGHT = legRight.x2 + HIP_COVER;
const HEM_LEFT = legLeft.x1 - HEM_COVER;
const HEM_RIGHT = legRight.x2 + HEM_COVER;

/**
 * The inseam sits 1 px past each leg, which is the most the trouser can give
 * away and still cover it. That leaves a gap too narrow to read on its own, so
 * a fold runs down the inside of each leg to widen the split visually — at 4 px
 * apart the two legs render as one solid shape.
 */
const IN_LEFT = legLeft.x2 + 1;
const IN_RIGHT = legRight.x1 - 1;
const INSEAM_SHADE = 8;

const n = (value: number): string => String(value);

const cuff = (outer: number, inner: number, color: string): ReactNode => (
  <path
    d={`M ${n(outer)} ${n(CUFF)} L ${n(inner)} ${n(CUFF)} L ${n(inner)} ${n(HEM)}
        L ${n(outer)} ${n(HEM)} Z`}
    fill={shade(color, HIGHLIGHT)}
  />
);

const render = (color: string): ReactNode => (
  <g>
    <path
      d={`M ${n(waist.x1)} ${n(TOP)} L ${n(waist.x2)} ${n(TOP)}
          C ${n(waist.x2 + 4)} 312 ${n(waist.x2 + 2)} 332 ${n(HIP_RIGHT)} 348
          C ${n(HIP_RIGHT - 1)} 388 ${n(HEM_RIGHT + 1)} 420 ${n(HEM_RIGHT)} ${n(HEM)}
          L ${n(IN_RIGHT)} ${n(HEM)}
          C ${n(IN_RIGHT - 1)} 410 ${n(IN_RIGHT - 2)} 380 341 ${n(CROTCH)}
          C 339 380 ${n(IN_LEFT + 2)} 410 ${n(IN_LEFT)} ${n(HEM)}
          L ${n(HEM_LEFT)} ${n(HEM)}
          C ${n(HEM_LEFT - 1)} 420 ${n(HIP_LEFT + 1)} 388 ${n(HIP_LEFT)} 348
          C ${n(waist.x1 - 2)} 332 ${n(waist.x1 - 4)} 312 ${n(waist.x1)} ${n(TOP)} Z`}
      fill={color}
    />

    <path
      d={`M 340 ${n(BAND)} L 340 ${n(CROTCH - 4)}`}
      fill="none"
      stroke={shade(color, FOLD)}
      strokeWidth={3}
      strokeLinecap="round"
    />

    {/* Inseam folds, so the two legs read apart at this scale. */}
    <path
      d={`M ${n(IN_LEFT - INSEAM_SHADE)} ${n(CROTCH + 6)} L ${n(IN_LEFT)} ${n(CROTCH)}
          C ${n(IN_LEFT + 2)} 410 ${n(IN_LEFT)} 420 ${n(IN_LEFT)} ${n(CUFF)}
          L ${n(IN_LEFT - INSEAM_SHADE)} ${n(CUFF)} Z`}
      fill={shade(color, FOLD)}
    />
    <path
      d={`M ${n(IN_RIGHT + INSEAM_SHADE)} ${n(CROTCH + 6)} L ${n(IN_RIGHT)} ${n(CROTCH)}
          C ${n(IN_RIGHT - 2)} 410 ${n(IN_RIGHT)} 420 ${n(IN_RIGHT)} ${n(CUFF)}
          L ${n(IN_RIGHT + INSEAM_SHADE)} ${n(CUFF)} Z`}
      fill={shade(color, FOLD)}
    />

    {cuff(HEM_LEFT, IN_LEFT, color)}
    {cuff(HEM_RIGHT, IN_RIGHT, color)}

    <rect
      x={waist.x1}
      y={TOP}
      width={waist.x2 - waist.x1}
      height={BAND - TOP}
      rx={5}
      fill={shade(color, FOLD)}
    />
  </g>
);

export const JEANS: Part = {
  id: 'bottom.jeans',
  slot: 'bottom',
  palette: 'fabric',
  render,
};

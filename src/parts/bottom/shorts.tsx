import type { ReactNode } from 'react';

import { ANCHORS } from '../../anchors';
import { FOLD, shade } from '../../lib/color';
import type { Part } from '../../model/types';

/**
 * Mid-thigh shorts with a waistband and a soft fold at each hem.
 *
 * Cut like the jeans — one shape with a notch at the crotch, every edge derived
 * from the leg it covers — but looser and stopping above the knee. Sizing an
 * edge by eye is what leaves skin showing (see CLAUDE.md).
 */

const { waist, legLeft, legRight, hip } = ANCHORS;

const TOP = waist.y - 2;
const BAND = TOP + 18;
const CROTCH = 346;
const HEM = 392;
const FOLD_TOP = HEM - 10;

/** Shorts hang loose, so they clear the leg by more than the jeans do. */
const HIP_COVER = 8;
const HEM_COVER = 14;

const HIP_LEFT = legLeft.x1 - HIP_COVER;
const HIP_RIGHT = legRight.x2 + HIP_COVER;
const HEM_LEFT = legLeft.x1 - HEM_COVER;
const HEM_RIGHT = legRight.x2 + HEM_COVER;

/** As on the jeans: 1 px past the leg, with a fold to make the split read. */
const IN_LEFT = legLeft.x2 + 1;
const IN_RIGHT = legRight.x1 - 1;
const INSEAM_SHADE = 8;

const n = (value: number): string => String(value);

const hemFold = (outer: number, inner: number, color: string): ReactNode => (
  <path
    d={`M ${n(outer)} ${n(FOLD_TOP)} L ${n(inner)} ${n(FOLD_TOP)} L ${n(inner)} ${n(HEM)}
        C ${n((outer + inner) / 2)} ${n(HEM + 6)} ${n((outer + inner) / 2)} ${n(HEM + 6)} ${n(outer)} ${n(HEM)} Z`}
    fill={shade(color, FOLD)}
  />
);

const render = (color: string): ReactNode => (
  <g>
    <path
      d={`M ${n(waist.x1)} ${n(TOP)} L ${n(waist.x2)} ${n(TOP)}
          C ${n(waist.x2 + 4)} 308 ${n(waist.x2 + 2)} 330 ${n(HIP_RIGHT)} ${n(hip.y + 16)}
          C ${n(HIP_RIGHT + 2)} 364 ${n(HEM_RIGHT - 2)} 378 ${n(HEM_RIGHT)} ${n(HEM)}
          C ${n(HEM_RIGHT - 12)} ${n(HEM + 6)} ${n(IN_RIGHT + 10)} ${n(HEM + 6)} ${n(IN_RIGHT)} ${n(HEM)}
          C ${n(IN_RIGHT - 1)} 374 ${n(IN_RIGHT - 2)} 360 341 ${n(CROTCH)}
          C 339 360 ${n(IN_LEFT + 2)} 374 ${n(IN_LEFT)} ${n(HEM)}
          C ${n(IN_LEFT - 10)} ${n(HEM + 6)} ${n(HEM_LEFT + 12)} ${n(HEM + 6)} ${n(HEM_LEFT)} ${n(HEM)}
          C ${n(HEM_LEFT + 2)} 378 ${n(HIP_LEFT - 2)} 364 ${n(HIP_LEFT)} ${n(hip.y + 16)}
          C ${n(waist.x1 - 2)} 330 ${n(waist.x1 - 4)} 308 ${n(waist.x1)} ${n(TOP)} Z`}
      fill={color}
    />

    {/* Inseam folds, so the two legs read apart at this scale. */}
    <path
      d={`M ${n(IN_LEFT - INSEAM_SHADE)} ${n(CROTCH + 6)} L ${n(IN_LEFT)} ${n(CROTCH)}
          C ${n(IN_LEFT + 2)} 374 ${n(IN_LEFT)} 380 ${n(IN_LEFT)} ${n(FOLD_TOP)}
          L ${n(IN_LEFT - INSEAM_SHADE)} ${n(FOLD_TOP)} Z`}
      fill={shade(color, FOLD)}
    />
    <path
      d={`M ${n(IN_RIGHT + INSEAM_SHADE)} ${n(CROTCH + 6)} L ${n(IN_RIGHT)} ${n(CROTCH)}
          C ${n(IN_RIGHT - 2)} 374 ${n(IN_RIGHT)} 380 ${n(IN_RIGHT)} ${n(FOLD_TOP)}
          L ${n(IN_RIGHT + INSEAM_SHADE)} ${n(FOLD_TOP)} Z`}
      fill={shade(color, FOLD)}
    />

    {hemFold(HEM_LEFT, IN_LEFT, color)}
    {hemFold(HEM_RIGHT, IN_RIGHT, color)}

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

export const SHORTS: Part = {
  id: 'bottom.shorts',
  slot: 'bottom',
  palette: 'fabric',
  render,
};

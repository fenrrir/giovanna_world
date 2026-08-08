import type { ReactNode } from 'react';

import { ANCHORS } from '../../anchors';
import { FOLD, HIGHLIGHT, shade } from '../../lib/color';
import { stripes } from '../../lib/patterns';
import type { Part } from '../../model/types';

/**
 * A flared skirt with a waistband and pleats.
 *
 * The band sits on the waistline y 280; the hem lands on the skirt reference
 * y 398 and flares within the doll bounds. Pleats come from stripes() rather
 * than being drawn one by one, so changing the pleating is changing a call
 * (SPEC section 9).
 */

const { waist, skirtHem } = ANCHORS;

const HEM_LEFT = 274;
const HEM_RIGHT = 406;
const BAND_BOTTOM = waist.y + waist.height;

/** The pleats are clipped to this box by the generator's own bounds check. */
const PLEAT_BOX = {
  x: HEM_LEFT + 12,
  y: BAND_BOTTOM + 6,
  width: HEM_RIGHT - HEM_LEFT - 24,
  height: skirtHem.y - BAND_BOTTOM - 18,
};

const render = (color: string): ReactNode => (
  <g>
    <path
      d={`M ${String(waist.x1 + 6)} ${String(BAND_BOTTOM)}
          L ${String(waist.x2 - 6)} ${String(BAND_BOTTOM)}
          L ${String(HEM_RIGHT)} ${String(skirtHem.y)}
          C ${String(HEM_RIGHT - 20)} ${String(skirtHem.y + 12)} ${String(HEM_LEFT + 20)} ${String(skirtHem.y + 12)} ${String(HEM_LEFT)} ${String(skirtHem.y)} Z`}
      fill={color}
    />

    {stripes(PLEAT_BOX, shade(color, FOLD), { width: 6, spacing: 22 })}

    {/* Hem fold, one tone down, following the flare. */}
    <path
      d={`M ${String(HEM_LEFT + 2)} ${String(skirtHem.y - 12)}
          C ${String(HEM_LEFT + 30)} ${String(skirtHem.y - 4)} ${String(HEM_RIGHT - 30)} ${String(skirtHem.y - 4)} ${String(HEM_RIGHT - 2)} ${String(skirtHem.y - 12)}
          L ${String(HEM_RIGHT)} ${String(skirtHem.y)}
          C ${String(HEM_RIGHT - 20)} ${String(skirtHem.y + 12)} ${String(HEM_LEFT + 20)} ${String(skirtHem.y + 12)} ${String(HEM_LEFT)} ${String(skirtHem.y)} Z`}
      fill={shade(color, FOLD)}
    />

    <rect
      x={waist.x1}
      y={waist.y}
      width={waist.x2 - waist.x1}
      height={waist.height}
      rx={6}
      fill={shade(color, HIGHLIGHT)}
    />
  </g>
);

export const SKIRT: Part = {
  id: 'bottom.skirt',
  slot: 'bottom',
  palette: 'fabric',
  render,
};

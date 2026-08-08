import type { ReactNode } from 'react';

import { ANCHORS } from '../../anchors';
import { FOLD, HIGHLIGHT, shade } from '../../lib/color';
import { dots } from '../../lib/patterns';
import { FIXED_COLORS } from '../../model/palettes';
import type { Part } from '../../model/types';

/**
 * A sleeveless A-line dress covered in polka dots.
 *
 * The only Phase 1 part that hides another slot: worn over trousers or a skirt
 * it removes the `bottom` layer from the render, and swapping it for a t-shirt
 * brings that layer straight back (SPEC section 7).
 */

const { shoulderLeft, waist, skirtHem } = ANCHORS;

const HEM = skirtHem.y;
const HEM_LEFT = 268;
const HEM_RIGHT = 412;

/**
 * Wholly inside the skirt at every height, so the generator's own bounds check
 * is enough and no clip path is needed. The dress is narrowest at the waist.
 */
const DOT_BOX = { x: 300, y: 226, width: 80, height: 156 };

const render = (color: string): ReactNode => (
  <g>
    <path
      d={`M 296 ${String(shoulderLeft.y - 4)}
          C 312 200 330 197 340 197 C 350 197 368 200 384 ${String(shoulderLeft.y - 4)}
          L 390 ${String(waist.y - 2)} L ${String(HEM_RIGHT)} ${String(HEM)}
          C 380 ${String(HEM + 12)} 300 ${String(HEM + 12)} ${String(HEM_LEFT)} ${String(HEM)}
          L 290 ${String(waist.y - 2)} Z`}
      fill={color}
    />

    {/* Bodice one tone up, hem one tone down: two layers is all the volume needed. */}
    <path
      d={`M 300 214 C 314 204 332 201 340 201 C 348 201 366 204 380 214
          L 384 ${String(waist.y - 6)} C 366 ${String(waist.y)} 314 ${String(waist.y)} 296 ${String(waist.y - 6)} Z`}
      fill={shade(color, HIGHLIGHT)}
    />

    {dots(DOT_BOX, FIXED_COLORS.collarWhite, { radius: 6, spacing: 26 })}

    <path
      d={`M ${String(HEM_LEFT + 3)} ${String(HEM - 14)}
          C 300 ${String(HEM - 4)} 380 ${String(HEM - 4)} ${String(HEM_RIGHT - 3)} ${String(HEM - 14)}
          L ${String(HEM_RIGHT)} ${String(HEM)}
          C 380 ${String(HEM + 12)} 300 ${String(HEM + 12)} ${String(HEM_LEFT)} ${String(HEM)} Z`}
      fill={shade(color, FOLD)}
    />

    <path
      d="M 322 198 C 330 208 350 208 358 198 C 350 203 330 203 322 198 Z"
      fill={FIXED_COLORS.collarWhite}
    />
  </g>
);

export const POLKA_DOT_DRESS: Part = {
  id: 'top.polka-dot-dress',
  slot: 'top',
  palette: 'fabric',
  hides: ['bottom'],
  render,
};

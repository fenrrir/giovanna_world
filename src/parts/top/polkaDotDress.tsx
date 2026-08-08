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

const { shoulderLeft, shoulderRight, waist, skirtHem } = ANCHORS;

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
    {/*
      The straps reach the shoulder anchors. Stopping short of them leaves bare
      shoulder above the neckline and the dress reads as slipping off.
    */}
    <path
      d={`M ${String(shoulderLeft.x)} ${String(shoulderLeft.y + 6)}
          C 292 204 310 197 322 196 C 330 208 350 208 358 196
          C 370 197 388 204 ${String(shoulderRight.x)} ${String(shoulderRight.y + 6)}
          L 390 ${String(waist.y - 2)} L ${String(HEM_RIGHT)} ${String(HEM)}
          C 380 ${String(HEM + 12)} 300 ${String(HEM + 12)} ${String(HEM_LEFT)} ${String(HEM)}
          L 290 ${String(waist.y - 2)} Z`}
      fill={color}
    />

    {/* Bodice one tone up, hem one tone down: two layers is all the volume needed. */}
    <path
      d={`M 296 218 C 312 206 332 202 340 202 C 348 202 368 206 384 218
          L 386 ${String(waist.y - 6)} C 366 ${String(waist.y)} 314 ${String(waist.y)} 294 ${String(waist.y - 6)} Z`}
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
  </g>
);

export const POLKA_DOT_DRESS: Part = {
  id: 'top.polka-dot-dress',
  slot: 'top',
  palette: 'fabric',
  hides: ['bottom'],
  render,
};

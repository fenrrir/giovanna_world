import type { ReactNode } from 'react';

import { ANCHORS } from '../../anchors';
import { FOLD, HIGHLIGHT, shade } from '../../lib/color';
import { FIXED_COLORS } from '../../model/palettes';
import type { Part } from '../../model/types';

/**
 * A short-sleeved t-shirt with a white collar.
 *
 * Sits on the shoulder line (282,216) and (398,216), runs to the waist at
 * y 280, and the sleeves end mid-upper-arm. Volume comes from two layers only:
 * the bodice a tone up, the hem a tone down (SPEC section 9).
 */

const { neckBase, waist } = ANCHORS;

const SLEEVE_END = 268;
const HEM = waist.y + 22;

const render = (color: string): ReactNode => (
  <g>
    {/* Sleeves, behind the body of the shirt so the seam reads cleanly. */}
    <path
      d="M 288 212 L 262 226 C 256 230 256 240 260 250 L 268 268
         C 271 274 280 274 284 268 L 296 240 Z"
      fill={shade(color, FOLD)}
    />
    <path
      d="M 392 212 L 418 226 C 424 230 424 240 420 250 L 412 268
         C 409 274 400 274 396 268 L 384 240 Z"
      fill={shade(color, FOLD)}
    />

    <path
      d={`M 288 214 C 300 204 314 199 ${String(neckBase.x1)} 198
          C 328 210 352 210 ${String(neckBase.x2)} 198
          C 366 199 380 204 392 214 L 396 ${String(HEM)}
          C 372 ${String(HEM + 8)} 308 ${String(HEM + 8)} 284 ${String(HEM)} Z`}
      fill={color}
    />

    {/* Bodice highlight: one tone up, no second colour introduced. */}
    <path
      d={`M 300 216 C 316 208 364 208 380 216 L 380 ${String(SLEEVE_END - 2)}
          C 360 ${String(SLEEVE_END + 4)} 320 ${String(SLEEVE_END + 4)} 300 ${String(SLEEVE_END - 2)} Z`}
      fill={shade(color, HIGHLIGHT)}
    />

    {/* Hem fold: one tone down. */}
    <path
      d={`M 285 ${String(HEM - 14)} C 310 ${String(HEM - 8)} 370 ${String(HEM - 8)} 395 ${String(HEM - 14)}
          L 396 ${String(HEM)} C 372 ${String(HEM + 8)} 308 ${String(HEM + 8)} 284 ${String(HEM)} Z`}
      fill={shade(color, FOLD)}
    />

    <path
      d={`M ${String(neckBase.x1)} 198 C 328 212 352 212 ${String(neckBase.x2)} 198
          C 352 206 328 206 ${String(neckBase.x1)} 198 Z`}
      fill={FIXED_COLORS.collarWhite}
    />
  </g>
);

export const T_SHIRT: Part = {
  id: 'top.t-shirt',
  slot: 'top',
  palette: 'fabric',
  render,
};

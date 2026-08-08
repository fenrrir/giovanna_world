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
    {/*
      Sleeves, drawn behind the shirt body and reaching well inside it. Ending
      them at the body's edge leaves a sliver of skin at the shoulder seam.
    */}
    <path
      d="M 306 204 C 282 202 262 214 259 232 L 263 262
         C 265 272 280 275 286 267 L 306 242 Z"
      fill={shade(color, FOLD)}
    />
    <path
      d="M 374 204 C 398 202 418 214 421 232 L 417 262
         C 415 272 400 275 394 267 L 374 242 Z"
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

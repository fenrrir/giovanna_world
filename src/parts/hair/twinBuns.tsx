import type { ReactNode } from 'react';

import { FOLD, HIGHLIGHT, shade } from '../../lib/color';
import type { HairStyle } from '../../model/types';

/**
 * Two round buns high on the head, with a soft fringe.
 *
 * The buns belong to the front layer, not the back: sitting on top of the head
 * they are in front of the skull, and drawn behind they would be swallowed by
 * the fringe and read as ears growing out of the side of the head.
 *
 * The nape is a solid curtain — it renders under the body, so no notch is cut
 * for the neck (see CLAUDE.md).
 */

const STRAND_FACTOR = 1.28;
const STRAND_OPACITY = 0.55;

const BUN_RADIUS = 27;
const BUN_Y = 62;
const BUN_LEFT_X = 300;
const BUN_RIGHT_X = 380;

const bun = (cx: number, color: string): ReactNode => (
  <g>
    <circle cx={cx} cy={BUN_Y} r={BUN_RADIUS} fill={color} />
    <circle cx={cx - 7} cy={BUN_Y - 9} r={11} fill={shade(color, HIGHLIGHT)} />
  </g>
);

const back = (color: string): ReactNode => (
  <g>
    <path
      d="M 274 150 C 274 82 302 62 340 62 C 378 62 406 82 406 150
         C 406 180 402 196 396 208
         C 376 198 304 198 284 208
         C 278 196 274 180 274 150 Z"
      fill={color}
    />
    <path
      d="M 274 172 C 292 184 388 184 406 172
         C 406 186 402 198 396 208 C 376 198 304 198 284 208
         C 278 198 274 186 274 172 Z"
      fill={shade(color, FOLD)}
    />
  </g>
);

const front = (color: string): ReactNode => (
  <g>
    {/*
      One horseshoe: fringe and sides in a single shape. A thin fringe with
      separate side locks leaves the outer edge of the skull showing between
      them, which reads as bare scalp.
    */}
    <path
      d="M 276 158
         C 272 108 280 80 294 68 C 308 58 324 56 340 56
         C 356 56 372 58 386 68 C 400 80 408 108 404 158
         C 400 140 394 128 386 122
         C 370 112 310 112 294 122
         C 286 128 280 140 276 158 Z"
      fill={color}
    />
    <path
      d="M 312 82 C 328 74 352 76 368 86"
      fill="none"
      stroke={shade(color, STRAND_FACTOR)}
      strokeWidth={6}
      strokeLinecap="round"
      opacity={STRAND_OPACITY}
    />
    {bun(BUN_LEFT_X, color)}
    {bun(BUN_RIGHT_X, color)}
  </g>
);

export const TWIN_BUNS: HairStyle = {
  id: 'hair.twin-buns',
  back,
  front,
};

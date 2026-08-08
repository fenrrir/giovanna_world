import type { ReactNode } from 'react';

import { FOLD, shade } from '../../lib/color';
import type { HairStyle } from '../../model/types';

/**
 * Long wavy hair with a centre parting, falling past the shoulders.
 *
 * The back is a solid curtain: it renders behind the doll, so the body already
 * occludes whatever should be hidden and cutting a notch for the neck would
 * only risk a hole (see CLAUDE.md).
 */

const STRAND_FACTOR = 1.28;
const STRAND_OPACITY = 0.55;

const back = (color: string): ReactNode => (
  <g>
    <path
      d="M 262 168 C 262 78 296 58 340 58 C 384 58 418 78 418 168
         C 420 220 416 268 410 314
         C 408 324 396 328 388 318
         C 372 300 308 300 292 318
         C 284 328 272 324 270 314
         C 264 268 260 220 262 168 Z"
      fill={color}
    />
    {/* Waves along the lower length, one tone down. */}
    <path
      d="M 264 262 C 280 278 400 278 416 262
         C 414 282 412 300 410 314 C 408 324 396 328 388 318
         C 372 300 308 300 292 318 C 284 328 272 324 270 314
         C 268 300 266 282 264 262 Z"
      fill={shade(color, FOLD)}
    />
    <path
      d="M 292 100 C 278 132 272 186 276 246"
      fill="none"
      stroke={shade(color, STRAND_FACTOR)}
      strokeWidth={7}
      strokeLinecap="round"
      opacity={STRAND_OPACITY}
    />
  </g>
);

const front = (color: string): ReactNode => (
  <g>
    {/*
      Centre parting: each sweep runs from the crown down the side of the face
      past the jaw, so the temples are hair rather than skin. A thin hairline
      crescent leaves the sides of the head bare and the face spills out beside
      it — the head circle reaches x 278 and x 402, so a sweep must too.
    */}
    <path
      d="M 270 202
         C 266 160 268 96 280 80 C 296 62 316 58 340 58
         C 364 58 384 62 400 80 C 412 96 414 160 410 202
         C 402 186 390 166 384 148
         C 378 118 364 100 340 96
         C 316 100 302 118 296 148
         C 290 166 278 186 270 202 Z"
      fill={color}
    />
    <path
      d="M 318 74 C 334 66 352 68 364 80"
      fill="none"
      stroke={shade(color, STRAND_FACTOR)}
      strokeWidth={6}
      strokeLinecap="round"
      opacity={STRAND_OPACITY}
    />
  </g>
);

export const LONG_WAVY: HairStyle = {
  id: 'hair.long-wavy',
  back,
  front,
};

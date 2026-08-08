import type { ReactNode } from 'react';

import { FOLD, shade } from '../../lib/color';
import type { HairStyle } from '../../model/types';

/**
 * A chin-length bob with a rounded fringe.
 *
 * Drawn against the skull top (340,68) and the head circle (340,130) r62. The
 * back mass falls to just past the shoulder line; the fringe crosses the crown
 * and the temple strands frame the face down to the cheek.
 */

/** Strand sheen, per SPEC section 9: one or two lighter paths over the mass. */
const STRAND_FACTOR = 1.28;
const STRAND_OPACITY = 0.55;

const back = (color: string): ReactNode => (
  <g>
    <path
      d="M 268 152 C 268 78 292 62 340 62 C 388 62 412 78 412 152 L 412 248
         C 412 256 404 260 396 255 C 390 248 388 226 386 198 L 294 198
         C 292 226 290 248 284 255 C 276 260 268 256 268 248 Z"
      fill={color}
    />
    <path
      d="M 294 198 L 386 198 C 386 214 384 232 382 244 L 298 244
         C 296 232 294 214 294 198 Z"
      fill={shade(color, FOLD)}
    />
    <path
      d="M 296 96 C 284 118 280 148 282 182"
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
    <path
      d="M 282 148 C 282 80 306 62 340 62 C 374 62 398 80 398 148
         C 392 120 378 102 356 96 C 332 90 306 106 292 128
         C 288 134 284 141 282 148 Z"
      fill={color}
    />
    <path
      d="M 284 122 C 276 152 274 182 278 206 C 282 211 291 211 294 205
         C 291 178 293 150 299 128 Z"
      fill={color}
    />
    <path
      d="M 396 122 C 404 152 406 182 402 206 C 398 211 389 211 386 205
         C 389 178 387 150 381 128 Z"
      fill={color}
    />
    <path
      d="M 316 82 C 336 72 362 76 378 92"
      fill="none"
      stroke={shade(color, STRAND_FACTOR)}
      strokeWidth={6}
      strokeLinecap="round"
      opacity={STRAND_OPACITY}
    />
  </g>
);

export const BOB_FRINGE: HairStyle = {
  id: 'hair.bob-fringe',
  back,
  front,
};

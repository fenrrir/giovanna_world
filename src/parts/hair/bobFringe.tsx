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
    {/*
      A solid curtain, with no notch cut for the neck. hairBack renders behind
      the body (z 0 against 10), so the doll already occludes whatever should be
      hidden. Cutting a notch to "let the neck through" duplicates that, and any
      millimetre where the notch is wider than the torso becomes a hole with the
      background showing straight through the shoulders.
    */}
    <path
      d="M 268 152 C 268 78 292 62 340 62 C 388 62 412 78 412 152 L 412 244
         C 412 254 404 259 396 253 C 378 245 302 245 284 253
         C 276 259 268 254 268 244 Z"
      fill={color}
    />
    <path
      d="M 268 214 L 412 214 L 412 244 C 412 254 404 259 396 253
         C 378 245 302 245 284 253 C 276 259 268 254 268 244 Z"
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
    {/*
      One horseshoe: the fringe across the forehead and the two sides in a
      single shape. Drawn as a thin fringe plus separate temple locks instead,
      the outer edge of the skull shows between them as a pale sliver — the
      head circle reaches x 278 and x 402, so the hair must cover past that at
      every height it frames.
    */}
    <path
      d="M 276 200
         C 272 150 274 92 288 76 C 302 62 320 58 340 58
         C 360 58 378 62 392 76 C 406 92 408 150 404 200
         C 398 180 392 160 388 146
         C 384 128 380 118 368 112
         C 352 104 328 104 312 112
         C 300 118 296 128 292 146
         C 288 160 282 180 276 200 Z"
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

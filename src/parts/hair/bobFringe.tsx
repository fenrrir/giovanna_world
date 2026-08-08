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
    <path
      d="M 282 148 C 282 80 306 62 340 62 C 374 62 398 80 398 148
         C 392 120 378 102 356 96 C 332 90 306 106 292 128
         C 288 134 284 141 282 148 Z"
      fill={color}
    />
    {/*
      Temple locks, tapered to a point. hairFront paints over the clothing
      (z 70 against 50), so a lock that ends in a blunt rounded stub lands on
      the shoulder as a bite taken out of the sleeve rather than as hair.
    */}
    <path d="M 284 124 C 275 154 273 184 280 208 C 288 184 292 152 299 130 Z" fill={color} />
    <path d="M 396 124 C 405 154 407 184 400 208 C 392 184 388 152 381 130 Z" fill={color} />
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

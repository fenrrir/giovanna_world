import type { ReactNode } from 'react';

import { ANCHORS, type Box } from '../../anchors';
import { FOLD, shade } from '../../lib/color';
import { stripes } from '../../lib/patterns';
import type { Part } from '../../model/types';

/**
 * A loose long-sleeved sweatshirt with horizontal stripes and a ribbed hem.
 *
 * Sits on the shoulder anchors, runs past the waist, and the sleeves reach the
 * wrist so only the hands stay bare. The stripes come from the pattern
 * generator rather than being drawn band by band.
 *
 * Both sleeves are written out rather than mirrored through a shared helper:
 * the first attempt parameterised the mirror with sign arithmetic and produced
 * geometry that silently collapsed, leaving the doll sleeveless while every
 * contract assertion still passed.
 */

const { shoulderLeft, shoulderRight } = ANCHORS;

const HEM = 302;
const RIB_TOP = 286;
const CUFF_TOP = 308;

/** Inside the body at every height, so the generator's bounds check suffices. */
const STRIPE_BOX: Box = { x: 288, y: 222, width: 104, height: 62 };

const render = (color: string): ReactNode => (
  <g>
    {/*
      Sleeves first, so the body covers the seam at the shoulder, and a tone
      down so the arm reads as a separate limb. Drawn in the body colour they
      merge into it and the whole garment becomes one flat block.
    */}
    <path
      d="M 322 198 C 288 197 262 212 259 238
         L 259 316 C 259 332 291 334 293 318
         L 302 240 C 306 218 312 204 322 198 Z"
      fill={shade(color, FOLD)}
    />
    <path
      d="M 358 198 C 392 197 418 212 421 238
         L 421 316 C 421 332 389 334 387 318
         L 378 240 C 374 218 368 204 358 198 Z"
      fill={shade(color, FOLD)}
    />
    <path
      d={`M 259 ${String(CUFF_TOP)} L 293 ${String(CUFF_TOP)} L 293 318 C 291 334 259 332 259 316 Z`}
      fill={color}
    />
    <path
      d={`M 421 ${String(CUFF_TOP)} L 387 ${String(CUFF_TOP)} L 387 318 C 389 334 421 332 421 316 Z`}
      fill={color}
    />

    <path
      d={`M ${String(shoulderLeft.x)} 226
          C 294 204 312 195 322 194 C 330 206 350 206 358 194
          C 368 195 386 204 ${String(shoulderRight.x)} 226
          C 400 254 398 280 394 ${String(HEM)}
          C 368 ${String(HEM + 8)} 312 ${String(HEM + 8)} 286 ${String(HEM)}
          C 282 280 280 254 ${String(shoulderLeft.x)} 226 Z`}
      fill={color}
    />

    {stripes(STRIPE_BOX, shade(color, FOLD), {
      orientation: 'horizontal',
      width: 11,
      spacing: 17,
    })}

    <path
      d={`M 284 ${String(RIB_TOP)} L 396 ${String(RIB_TOP)} L 394 ${String(HEM)}
          C 368 ${String(HEM + 8)} 312 ${String(HEM + 8)} 286 ${String(HEM)} Z`}
      fill={shade(color, FOLD)}
    />
  </g>
);

export const STRIPED_SWEATSHIRT: Part = {
  id: 'top.striped-sweatshirt',
  slot: 'top',
  palette: 'fabric',
  render,
};

import type { ReactNode } from 'react';

import { ANCHORS } from '../../anchors';
import { FOLD, HIGHLIGHT, shade } from '../../lib/color';
import type { Part } from '../../model/types';

/**
 * A fitted sleeveless tank top with narrow straps.
 *
 * The straps sit inboard of the shoulder anchors and the shoulder itself stays
 * bare — that is what a tank top is, unlike the dress whose straps have to
 * reach (282,216) and (398,216) or it reads as slipping off.
 */

const { neckBase, waist } = ANCHORS;

const HEM = 296;
const STRAP_TOP = 199;

const render = (color: string): ReactNode => (
  <g>
    <path
      d={`M 294 ${String(STRAP_TOP)} L 312 ${String(STRAP_TOP)}
          C 314 214 ${String(neckBase.x1)} 228 340 230
          C 356 228 ${String(neckBase.x2)} 214 368 ${String(STRAP_TOP)}
          L 386 ${String(STRAP_TOP)}
          C 392 218 396 250 394 ${String(HEM)}
          C 368 ${String(HEM + 8)} 312 ${String(HEM + 8)} 286 ${String(HEM)}
          C 284 250 288 218 294 ${String(STRAP_TOP)} Z`}
      fill={color}
    />

    {/* Bodice one tone up, hem one tone down: two layers is all the volume needed. */}
    <path
      d={`M 302 240 C 318 246 362 246 378 240
          L 380 ${String(waist.y)} C 360 ${String(waist.y + 6)} 320 ${String(waist.y + 6)} 300 ${String(waist.y)} Z`}
      fill={shade(color, HIGHLIGHT)}
    />

    <path
      d={`M 288 ${String(HEM - 14)} C 312 ${String(HEM - 6)} 368 ${String(HEM - 6)} 392 ${String(HEM - 14)}
          L 394 ${String(HEM)} C 368 ${String(HEM + 8)} 312 ${String(HEM + 8)} 286 ${String(HEM)} Z`}
      fill={shade(color, FOLD)}
    />
  </g>
);

export const TANK_TOP: Part = {
  id: 'top.tank-top',
  slot: 'top',
  palette: 'fabric',
  render,
};

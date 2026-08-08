import type { ReactNode } from 'react';

import { FOLD, shade } from '../../../lib/color';
import type { HairStyle, PartParams } from '../../../model/types';
import { hairBackPath, hairFoldPath, hairFrontPath, hairStrandPath } from './geometry';
import { toHairParams, type HairParams } from './params';

/**
 * The hairstyle the child builds herself, rather than picks ready-made.
 *
 * One id for the whole family: which of its infinitely many shapes she is
 * wearing lives in the params of her equipped entry, so the render layer, the
 * tray and the autosave treat it exactly like any other hairstyle.
 */
export const CUSTOM_HAIR_ID = 'hair.custom';

const STRAND_FACTOR = 1.28;
const STRAND_OPACITY = 0.55;
const STRAND_WIDTH = 6;

const back =
  (params: HairParams) =>
  (color: string): ReactNode => (
    <g>
      <path d={hairBackPath(params)} fill={color} />
      <path d={hairFoldPath(params)} fill={shade(color, FOLD)} />
    </g>
  );

const front =
  (params: HairParams) =>
  (color: string): ReactNode => (
    <g>
      <path d={hairFrontPath(params)} fill={color} />
      <path
        d={hairStrandPath(params)}
        fill="none"
        stroke={shade(color, STRAND_FACTOR)}
        strokeWidth={STRAND_WIDTH}
        strokeLinecap="round"
        opacity={STRAND_OPACITY}
      />
    </g>
  );

/**
 * The hairstyle those axes describe.
 *
 * Takes the stored params rather than a validated set, because the caller is
 * the registry answering a lookup and whatever storage held is what arrives.
 * `toHairParams` is total, so there is no shape this cannot answer with.
 */
export const customHair = (raw?: PartParams): HairStyle => {
  const params = toHairParams(raw);

  return { id: CUSTOM_HAIR_ID, back: back(params), front: front(params) };
};

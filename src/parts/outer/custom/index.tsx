import type { ReactNode } from 'react';

import { FOLD, HIGHLIGHT, shade } from '../../../lib/color';
import type { Part, PartParams } from '../../../model/types';
import { collarShape, cuffPath, hemPath, panelPath, sleevePath, type Side } from './geometry';
import { toOuterParams, type OuterParams } from './params';

/**
 * The jacket the child builds herself, rather than picks ready-made.
 *
 * One id for the whole family: which of its infinitely many shapes she is
 * wearing lives in the params of her equipped entry, so the render layer, the
 * tray and the autosave treat it exactly like any other garment.
 */
export const CUSTOM_OUTER_ID = 'outer.custom';

const SIDES: readonly Side[] = [-1, 1];

/*
 * Sleeves a tone down from the panels, the way the doll's own limbs are. Flat
 * against the body they merge into it and the silhouette reads as one block
 * rather than as someone wearing a coat.
 */
const render =
  (params: OuterParams) =>
  (color: string): ReactNode => {
    const collar = collarShape(params);

    return (
      <g>
        {SIDES.map((side) => (
          <path
            key={`sleeve${String(side)}`}
            d={sleevePath(side, params)}
            fill={shade(color, FOLD)}
          />
        ))}
        {SIDES.map((side) => (
          <path key={`panel${String(side)}`} d={panelPath(side, params)} fill={color} />
        ))}
        {SIDES.map((side) => (
          <path key={`hem${String(side)}`} d={hemPath(side, params)} fill={shade(color, FOLD)} />
        ))}
        {SIDES.map((side) => (
          <path key={`cuff${String(side)}`} d={cuffPath(side, params)} fill={shade(color, FOLD)} />
        ))}
        {collar !== null && <path d={collar} fill={shade(color, HIGHLIGHT)} />}
      </g>
    );
  };

/**
 * The jacket those axes describe.
 *
 * Takes the stored params rather than a validated set, because the caller is
 * the registry answering a lookup and whatever storage held is what arrives.
 * `toOuterParams` is total, so there is no shape this cannot answer with.
 */
export const customOuter = (raw?: PartParams): Part => ({
  id: CUSTOM_OUTER_ID,
  slot: 'outer',
  palette: 'fabric',
  render: render(toOuterParams(raw)),
});

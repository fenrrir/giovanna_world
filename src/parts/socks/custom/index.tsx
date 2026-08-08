import type { ReactNode } from 'react';

import { FOLD, shade } from '../../../lib/color';
import { dots, stripes } from '../../../lib/patterns';
import type { Part, PartParams } from '../../../model/types';
import { cuffPath, printBox, sockPath, type Side } from './geometry';
import { toSocksParams, type Pattern, type SocksParams } from './params';

/**
 * The socks the child builds herself, rather than picks ready-made.
 *
 * One id for the whole family: which of its shapes she is wearing lives in the
 * params of her equipped entry, so the render layer, the tray and the autosave
 * treat it exactly like any other garment.
 */
export const CUSTOM_SOCKS_ID = 'socks.custom';

const SIDES: readonly Side[] = [-1, 1];

const STRIPE_WIDTH = 7;
const STRIPE_SPACING = 16;
const DOT_RADIUS = 3;
const DOT_SPACING = 11;

/**
 * The print, generated rather than drawn.
 *
 * Both come from `lib/patterns`, which emits a shape only where one fits inside
 * the box — so a sock wound down to the ankle simply prints fewer stripes
 * instead of spilling them onto the shin (CLAUDE.md: patterns come from the
 * generator, never written by hand).
 */
const print = (pattern: Pattern, side: Side, params: SocksParams, color: string): ReactNode => {
  const box = printBox(side, params);
  const ink = shade(color, FOLD);

  if (pattern === 'stripes') {
    return stripes(box, ink, {
      width: STRIPE_WIDTH,
      spacing: STRIPE_SPACING,
      orientation: 'horizontal',
    });
  }

  if (pattern === 'dots') {
    return dots(box, ink, { radius: DOT_RADIUS, spacing: DOT_SPACING });
  }

  return null;
};

const render =
  (params: SocksParams) =>
  (color: string): ReactNode => (
    <g>
      {SIDES.map((side) => (
        <g key={String(side)}>
          <path d={sockPath(side, params)} fill={color} />
          {print(params.pattern, side, params, color)}
          <path d={cuffPath(side, params)} fill={shade(color, FOLD)} />
        </g>
      ))}
    </g>
  );

/**
 * The socks those axes describe.
 *
 * Takes the stored params rather than a validated set, because the caller is
 * the registry answering a lookup and whatever storage held is what arrives.
 * `toSocksParams` is total, so there is no shape this cannot answer with.
 */
export const customSocks = (raw?: PartParams): Part => ({
  id: CUSTOM_SOCKS_ID,
  slot: 'socks',
  palette: 'fabric',
  render: render(toSocksParams(raw)),
});

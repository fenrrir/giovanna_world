import type { ReactNode } from 'react';

import { ANCHORS } from '../../anchors';
import type { Part } from '../../model/types';

/**
 * The smile.
 *
 * Was drawn by the body in a fixed colour until the mouth became something the
 * child chooses. The curve is unchanged — only who owns it, and that its colour
 * now comes from the makeup palette instead of a constant.
 */

const { chin } = ANCHORS;

const HALF_WIDTH = 14;
/** Measured up from the chin: where the corners sit and how far the curve dips. */
const CORNER_LIFT = 28;
const DIP = 14;
const THICKNESS = 5;

const smilePath = (): string =>
  [
    `M ${String(chin.x - HALF_WIDTH)} ${String(chin.y - CORNER_LIFT)}`,
    `Q ${String(chin.x)} ${String(chin.y - DIP)}`,
    `${String(chin.x + HALF_WIDTH)} ${String(chin.y - CORNER_LIFT)}`,
  ].join(' ');

const render = (color: string): ReactNode => (
  <path d={smilePath()} fill="none" stroke={color} strokeWidth={THICKNESS} strokeLinecap="round" />
);

export const SMILE: Part = {
  id: 'lips.smile',
  slot: 'lips',
  palette: 'makeup',
  render,
};

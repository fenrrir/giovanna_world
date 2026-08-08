import type { ReactNode } from 'react';

import { ANCHORS } from '../../anchors';
import { FOLD, HIGHLIGHT, shade } from '../../lib/color';
import { FIXED_COLORS } from '../../model/palettes';
import type { Part } from '../../model/types';

/**
 * A small bag hanging from her hand.
 *
 * Everything is an offset from the hand anchor, so the bag travels with it.
 * The handle loops over the hand rather than stopping at it: `handheld` paints
 * at z 90, above everything, and a handle that stopped short would read as a
 * bag floating beside her fist instead of hanging from it.
 */

const { handRight: HAND } = ANCHORS;

const HALF_WIDTH = 22;
/** Where the bag's mouth sits, measured down from the hand. */
const MOUTH = 12;
const DEPTH = 40;
const CORNER = 8;
/** How far the handle rises above the hand, and how wide it opens. */
const HANDLE_RISE = 22;
const HANDLE_HALF = 13;
const HANDLE_WIDTH = 5;
const FLAP = 12;
const CLASP = 5;

const p = (...values: number[]): string =>
  values.map((value) => String(Math.round(value))).join(' ');

const bodyPath = (): string => {
  const top = HAND.y + MOUTH;
  const bottom = top + DEPTH;
  const x1 = HAND.x - HALF_WIDTH;
  const x2 = HAND.x + HALF_WIDTH;

  return [
    `M ${p(x1, top)}`,
    `L ${p(x2, top)}`,
    `L ${p(x2, bottom - CORNER)}`,
    `C ${p(x2, bottom, x1, bottom, x1, bottom - CORNER)}`,
    'Z',
  ].join(' ');
};

/** The flap, one tone down, so the bag reads as closed rather than as a block. */
const flapPath = (): string => {
  const top = HAND.y + MOUTH;
  const x1 = HAND.x - HALF_WIDTH;
  const x2 = HAND.x + HALF_WIDTH;

  return [
    `M ${p(x1, top)}`,
    `L ${p(x2, top)}`,
    `L ${p(x2, top + FLAP - CORNER / 2)}`,
    `C ${p(x2, top + FLAP + 4, x1, top + FLAP + 4, x1, top + FLAP - CORNER / 2)}`,
    'Z',
  ].join(' ');
};

/** The handle, an open loop over the hand. */
const handlePath = (): string => {
  const foot = HAND.y + MOUTH;
  const crest = HAND.y - HANDLE_RISE;

  return [
    `M ${p(HAND.x - HANDLE_HALF, foot)}`,
    `C ${p(HAND.x - HANDLE_HALF, crest, HAND.x + HANDLE_HALF, crest, HAND.x + HANDLE_HALF, foot)}`,
    `L ${p(HAND.x + HANDLE_HALF - HANDLE_WIDTH, foot)}`,
    `C ${p(
      HAND.x + HANDLE_HALF - HANDLE_WIDTH,
      crest + HANDLE_WIDTH * 2,
      HAND.x - HANDLE_HALF + HANDLE_WIDTH,
      crest + HANDLE_WIDTH * 2,
      HAND.x - HANDLE_HALF + HANDLE_WIDTH,
      foot,
    )}`,
    'Z',
  ].join(' ');
};

const render = (color: string): ReactNode => (
  <g>
    <path d={handlePath()} fill={shade(color, FOLD)} />
    <path d={bodyPath()} fill={color} />
    <path d={flapPath()} fill={shade(color, HIGHLIGHT)} />
    <rect
      x={HAND.x - CLASP / 2}
      y={HAND.y + MOUTH + FLAP - 1}
      width={CLASP}
      height={CLASP + 2}
      fill={FIXED_COLORS.collarWhite}
    />
  </g>
);

export const BAG: Part = {
  id: 'handheld.bag',
  slot: 'handheld',
  palette: 'fabric',
  render,
};

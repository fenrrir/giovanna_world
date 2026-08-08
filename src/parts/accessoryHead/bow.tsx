import type { ReactNode } from 'react';

import { ANCHORS } from '../../anchors';
import { FOLD, HIGHLIGHT, shade } from '../../lib/color';
import type { Part } from '../../model/types';

/**
 * A ribbon bow worn on the side of the head.
 *
 * Everything is expressed as an offset from the head-accessory anchor, so the
 * whole bow moves as one if that anchor ever moves. The left half is the right
 * half with the horizontal offsets negated — a bow is symmetric, and writing it
 * twice invites the two halves to drift apart.
 *
 * It sits at z 80, above the fringe, and reaches inward far enough to overlap
 * the skull: a bow that only touched the hair's outline would read as floating
 * beside the head rather than clipped into it.
 */

const { x: KNOT_X, y: KNOT_Y } = ANCHORS.headAccessorySide;

/** +1 draws the right half, -1 the left. */
type Side = 1 | -1;

/**
 * The anchor sits just outside the hair's silhouette, so a bow drawn
 * symmetrically around it hangs mostly in empty space. The loops stay
 * symmetric — a lopsided bow reads as a mistake — but the tails lean inward by
 * this much, which lands them back over the hair where they read as falling
 * from something rather than floating beside it.
 */
const TAIL_LEAN = -8;

const at = (dx: number, dy: number): string => `${String(KNOT_X + dx)} ${String(KNOT_Y + dy)}`;

/** One loop of the ribbon, sweeping out from the knot and back. */
const loopPath = (side: Side): string =>
  [
    `M ${at(side * 5, -6)}`,
    `C ${at(side * 18, -18)}, ${at(side * 31, -16)}, ${at(side * 29, -3)}`,
    `C ${at(side * 27, 10)}, ${at(side * 16, 10)}, ${at(side * 5, 6)}`,
    'Z',
  ].join(' ');

/** The fold along the underside of a loop, where the ribbon turns over. */
const foldPath = (side: Side): string =>
  [
    `M ${at(side * 5, 6)}`,
    `C ${at(side * 16, 10)}, ${at(side * 24, 8)}, ${at(side * 27, 3)}`,
    `C ${at(side * 22, 5)}, ${at(side * 12, 3)}, ${at(side * 5, 0)}`,
    'Z',
  ].join(' ');

/** A hanging tail, cut to a swallowtail at the bottom. */
const tailPath = (side: Side): string =>
  [
    `M ${at(side * 5, 3)}`,
    `L ${at(side * 15 + TAIL_LEAN, 33)}`,
    `L ${at(side * 8 + TAIL_LEAN, 30)}`,
    `L ${at(side * 5 + TAIL_LEAN, 38)}`,
    `L ${at(side * -3, 7)}`,
    'Z',
  ].join(' ');

/** The knot, drawn last so it covers where the four ribbons meet. */
const knotPath = (): string =>
  [
    `M ${at(-7, -7)}`,
    `C ${at(-9, -7)}, ${at(-9, 7)}, ${at(-7, 7)}`,
    `L ${at(7, 7)}`,
    `C ${at(9, 7)}, ${at(9, -7)}, ${at(7, -7)}`,
    'Z',
  ].join(' ');

const SIDES: readonly Side[] = [-1, 1];

const render = (color: string): ReactNode => (
  <g>
    {/* Tails hang behind the loops, so they are painted first. */}
    {SIDES.map((side) => (
      <path key={`tail${String(side)}`} d={tailPath(side)} fill={shade(color, FOLD)} />
    ))}
    {SIDES.map((side) => (
      <path key={`loop${String(side)}`} d={loopPath(side)} fill={color} />
    ))}
    {SIDES.map((side) => (
      <path key={`fold${String(side)}`} d={foldPath(side)} fill={shade(color, FOLD)} />
    ))}
    <path d={knotPath()} fill={shade(color, HIGHLIGHT)} />
  </g>
);

export const BOW: Part = {
  id: 'accessoryHead.bow',
  slot: 'accessoryHead',
  palette: 'fabric',
  render,
};

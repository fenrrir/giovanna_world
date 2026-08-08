import type { ReactNode } from 'react';

import { VIEW_BOX } from '../../anchors';
import { FOLD, HIGHLIGHT, shade } from '../../lib/color';
import type { Part } from '../../model/types';

/**
 * Her room: a papered wall, a floor, and a window with the evening in it.
 *
 * The indoor counterpart to the meadow, and the room a dress-up game is
 * actually played in. Like every scene it fills the canvas and takes one
 * colour — she picks the wall and the floor follows it down a tone.
 */

const { width: W, height: H } = VIEW_BOX;

/** Where the wall meets the floor: behind her knees, as the meadow's horizon is. */
const SKIRTING = 360;
const SKIRTING_HEIGHT = 12;

const WINDOW = { x: 62, y: 96, width: 150, height: 170 };
const SILL = 10;
const STRIPE_WIDTH = 18;
const STRIPE_GAP = 78;

const p = (...values: number[]): string =>
  values.map((value) => String(Math.round(value))).join(' ');

/** The paper: wide bands, spaced so the doll never stands against a seam. */
const stripeXs = (): number[] => {
  const count = Math.floor(W / STRIPE_GAP);
  const offset = (W - (count - 1) * STRIPE_GAP - STRIPE_WIDTH) / 2;

  return Array.from({ length: count }, (_, index) => offset + index * STRIPE_GAP);
};

const panePath = (): string =>
  [
    `M ${p(WINDOW.x, WINDOW.y)}`,
    `L ${p(WINDOW.x + WINDOW.width, WINDOW.y)}`,
    `L ${p(WINDOW.x + WINDOW.width, WINDOW.y + WINDOW.height)}`,
    `L ${p(WINDOW.x, WINDOW.y + WINDOW.height)}`,
    'Z',
  ].join(' ');

const render = (color: string): ReactNode => {
  const deep = shade(color, FOLD);
  const light = shade(color, HIGHLIGHT);

  return (
    <g>
      <rect x={0} y={0} width={W} height={H} fill={color} />

      {stripeXs().map((x) => (
        <rect key={String(x)} x={x} y={0} width={STRIPE_WIDTH} height={SKIRTING} fill={light} />
      ))}

      {/* The window, then its bars, so the evening reads as being behind them. */}
      <path d={panePath()} fill={light} />
      <rect
        x={WINDOW.x}
        y={WINDOW.y + WINDOW.height / 2 - 3}
        width={WINDOW.width}
        height={6}
        fill={deep}
      />
      <rect
        x={WINDOW.x + WINDOW.width / 2 - 3}
        y={WINDOW.y}
        width={6}
        height={WINDOW.height}
        fill={deep}
      />
      <rect
        x={WINDOW.x - SILL}
        y={WINDOW.y + WINDOW.height}
        width={WINDOW.width + SILL * 2}
        height={SILL}
        fill={deep}
      />

      <rect x={0} y={SKIRTING} width={W} height={H - SKIRTING} fill={deep} />
      <rect x={0} y={SKIRTING} width={W} height={SKIRTING_HEIGHT} fill={light} />
    </g>
  );
};

export const BEDROOM: Part = {
  id: 'scene.bedroom',
  slot: 'scene',
  palette: 'fabric',
  render,
};

import type { ReactNode } from 'react';

import { VIEW_BOX } from '../../../anchors';
import { FOLD, HIGHLIGHT, shade } from '../../../lib/color';
import { PALETTES } from '../../../model/palettes';
import { DOLL_SCALE } from '../../placement';
import type { Environment } from '../../registry';

/**
 * A meadow under an open sky, and the one place in the world that is outdoors.
 *
 * The lateral margin is a rule about things worn on a doll; a place owes the
 * opposite and fills the canvas, or the stage shows through at an edge.
 *
 * One colour still. She picks the sky and the ground follows it down a tone,
 * which is what lets a green afternoon and a violet evening both come out of
 * the same drawing.
 */

const { width: W, height: H } = VIEW_BOX;

/**
 * Where the ground meets the sky.
 *
 * Well above her feet, so she stands *in* the field rather than on its edge.
 * Drawn when she was the height of the canvas, which put the horizon across her
 * middle; at the size a doll is in a room it sits behind her hip.
 */
const HORIZON = 360;
const HILL_RISE = 46;
const SUN = { x: 96, y: 96, r: 46 };
const CLOUD_Y = 150;

const p = (...values: number[]): string =>
  values.map((value) => String(Math.round(value))).join(' ');

/** The near hill, drawn over the ground so the meadow has depth. */
const hillPath = (): string =>
  [
    `M 0 ${p(HORIZON)}`,
    `C ${p(W * 0.22, HORIZON - HILL_RISE, W * 0.44, HORIZON - HILL_RISE, W * 0.56, HORIZON)}`,
    `C ${p(W * 0.72, HORIZON + HILL_RISE, W * 0.88, HORIZON + HILL_RISE, W, HORIZON - 8)}`,
    `L ${p(W, H)}`,
    `L 0 ${p(H)}`,
    'Z',
  ].join(' ');

/** A cloud: three overlapping rounds, so it reads as weather and not a pill. */
const cloud = (x: number, scale: number, fill: string): ReactNode => (
  <g key={String(x)}>
    <ellipse cx={x} cy={CLOUD_Y} rx={38 * scale} ry={18 * scale} fill={fill} />
    <ellipse
      cx={x - 22 * scale}
      cy={CLOUD_Y + 6 * scale}
      rx={26 * scale}
      ry={14 * scale}
      fill={fill}
    />
    <ellipse
      cx={x + 24 * scale}
      cy={CLOUD_Y + 5 * scale}
      rx={24 * scale}
      ry={13 * scale}
      fill={fill}
    />
  </g>
);

const render = (color: string): ReactNode => {
  const light = shade(color, HIGHLIGHT);

  return (
    <g>
      <rect x={0} y={0} width={W} height={H} fill={color} />
      <circle cx={SUN.x} cy={SUN.y} r={SUN.r} fill={light} />
      {cloud(190, 1, light)}
      {cloud(540, 0.8, light)}
      <path d={hillPath()} fill={shade(color, FOLD)} />
    </g>
  );
};

export const MEADOW: Environment = {
  id: 'park.meadow',
  floor: { y: 470, scale: DOLL_SCALE },
  defaultColor: PALETTES.fabric[4],
  render,
};

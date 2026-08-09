import type { ReactNode } from 'react';

import { VIEW_BOX } from '../anchors';
import { FOLD, HIGHLIGHT, shade } from '../lib/color';
import { PALETTES, WORLD_COLORS } from '../model/palettes';
import { LOCATION_IDS, type LocationId } from '../model/places';
import { MAP_SPOTS, type Spot } from './anchors';

/**
 * The world from above: the land, and the places she can go on it.
 *
 * Every building is drawn at the spot the anchors declare, never at a number
 * chosen here, because the finger has to land on the same disc the drawing
 * occupies. Reading `MAP_SPOTS` rather than repeating it is what keeps the two
 * from drifting apart.
 *
 * She paints the land and the far field and the track follow it up and down a
 * tone. The house and the trees keep colours of their own (`WORLD_COLORS`): a
 * house derived from the colour of the grass would be a green house, and what
 * this drawing has to do above everything is be recognisable at the size of a
 * thumbnail.
 */

const { width: W, height: H } = VIEW_BOX;

/** Where the far field meets the near one. Above the house, below the top. */
const HORIZON = 148;

const p = (...values: number[]): string =>
  values.map((value) => String(Math.round(value))).join(' ');

/** The far field: a soft edge rather than a ruled line, so it reads as land. */
const fieldPath = (): string =>
  [
    'M 0 0',
    `L ${p(W, 0)}`,
    `L ${p(W, HORIZON - 18)}`,
    `C ${p(W * 0.72, HORIZON + 22, W * 0.4, HORIZON - 30, 0, HORIZON + 10)}`,
    'Z',
  ].join(' ');

/**
 * The track between the two places, so the map reads as one world rather than
 * two drawings. It runs at the height they stand at, and they are drawn over
 * it — a track passing below everything is a stripe, not a path.
 */
const trackPath = (): string =>
  [
    'M 60 368',
    `C ${p(210, 344, 360, 388, 624, 352)}`,
    `L ${p(624, 392)}`,
    `C ${p(360, 428, 210, 384, 60, 408)}`,
    'Z',
  ].join(' ');

/**
 * A patch of ground for something to stand on, so it is not floating.
 *
 * The baseline is passed rather than derived from the spot: the spot is where a
 * finger lands, and what is drawn inside it does not have to reach the bottom
 * of it. Deriving one from the other left the park's shadow adrift below its
 * own trees — which every assertion passed and one look caught.
 */
const ground = (x: number, base: number, width: number, fill: string): ReactNode => (
  <ellipse cx={x} cy={base} rx={width} ry={15} fill={fill} />
);

/** Where the house meets the ground, and where the trees do. */
const HOUSE_BASE = 82;
const PARK_BASE = 50;

const house = (spot: Spot): ReactNode => {
  const { x, y } = spot;
  const roof = [`M ${p(x - 74, y - 12)}`, `L ${p(x, y - 76)}`, `L ${p(x + 74, y - 12)}`, 'Z'].join(
    ' ',
  );

  return (
    <g key="house">
      <rect x={x - 60} y={y - 12} width={120} height={94} fill={WORLD_COLORS.wall} />
      <path d={roof} fill={WORLD_COLORS.roof} />
      <rect x={x - 15} y={y + 38} width={30} height={44} fill={WORLD_COLORS.wood} />
      <rect x={x - 44} y={y + 6} width={28} height={28} fill={WORLD_COLORS.pane} />
      <rect x={x + 18} y={y + 6} width={28} height={28} fill={WORLD_COLORS.pane} />
    </g>
  );
};

/** One tree, drawn from its own centre so a row of them cannot drift. */
const tree = (x: number, y: number, r: number): ReactNode => (
  <g key={`${String(x)}-${String(y)}`}>
    <rect x={x - 6} y={y} width={12} height={r + 34} fill={WORLD_COLORS.wood} />
    <circle cx={x} cy={y} r={r} fill={WORLD_COLORS.leaf} />
    {/* Lightened by opacity rather than by a second green, the way every
        highlight in this project is (SPEC section 9). */}
    <circle
      cx={x - r * 0.3}
      cy={y - r * 0.3}
      r={r * 0.42}
      fill={WORLD_COLORS.wall}
      opacity={0.22}
    />
  </g>
);

const park = (spot: Spot): ReactNode => (
  <g key="park">
    {tree(spot.x - 50, spot.y - 32, 42)}
    {tree(spot.x + 54, spot.y - 20, 36)}
    {tree(spot.x + 6, spot.y - 42, 48)}
  </g>
);

/** Keyed by location, so a place added to the taxonomy has to be drawn here. */
const PLACES: Record<LocationId, (spot: Spot) => ReactNode> = { house, park };

const GROUNDS: Record<LocationId, (spot: Spot, fill: string) => ReactNode> = {
  house: (spot, fill) => ground(spot.x, spot.y + HOUSE_BASE, 96, fill),
  park: (spot, fill) => ground(spot.x, spot.y + PARK_BASE, 100, fill),
};

const render = (color: string): ReactNode => {
  const near = shade(color, FOLD);
  const far = shade(color, HIGHLIGHT);

  return (
    <g>
      <rect x={0} y={0} width={W} height={H} fill={color} />
      <path d={fieldPath()} fill={far} />
      <path d={trackPath()} fill={far} />

      {LOCATION_IDS.map((id) => (
        <g key={id} data-location={id}>
          {GROUNDS[id](MAP_SPOTS[id], near)}
          {PLACES[id](MAP_SPOTS[id])}
        </g>
      ))}
    </g>
  );
};

export const WORLD_MAP = {
  id: 'map',
  defaultColor: PALETTES.fabric[1],
  render,
};

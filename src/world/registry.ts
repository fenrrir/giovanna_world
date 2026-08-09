import type { ReactNode } from 'react';

import { VIEW_BOX, type Box } from '../anchors';
import { ENVIRONMENTS, type EnvironmentId, type LocationId } from '../model/places';
import { MAP_SPOTS, type Spot } from './anchors';
import { WORLD_MAP } from './map';
import { BEDROOM } from './locations/house/bedroom';
import { MEADOW } from './locations/park/meadow';
import type { Floor } from './placement';

/**
 * The only import point for the world's artwork, as `parts/registry.ts` is for
 * the doll's. Adding a room is a file plus a line here.
 *
 * A place is deliberately not a `Part`. A part is worn on a doll and owes the
 * lateral margin; a place is where the doll is and owes the opposite — it fills
 * the canvas or the stage shows through at an edge. Keeping them apart is what
 * lets `Slot` shed `scene` entirely rather than carry a member that breaks
 * every rule the others follow.
 */
export type Environment = {
  id: EnvironmentId;
  /** Where her feet rest here, and how tall she stands. */
  floor: Floor;
  /** What colour the room is until the child paints it. */
  defaultColor: string;
  /** An SVG fragment filling the canvas, without an outer `<svg>`. */
  render: (color: string) => ReactNode;
};

/**
 * Keyed by environment, so the lookup is total: adding a room to the taxonomy
 * is a compile error here until it has something to draw, and no place can be
 * named that cannot be shown.
 */
export const ENVIRONMENTS_BY_ID: Readonly<Record<EnvironmentId, Environment>> = {
  'house.bedroom': BEDROOM,
  'park.meadow': MEADOW,
};

export const findEnvironment = (id: EnvironmentId): Environment => ENVIRONMENTS_BY_ID[id];

/**
 * A location, as the map shows it: where it sits, and the way in.
 *
 * The way in is its first environment, which is also its picture — a location
 * has no drawing of its own, and the room she arrives in is the truest thing to
 * show her before she gets there.
 */
export type Location = {
  id: LocationId;
  spot: Spot;
  entrance: Environment;
};

export const findLocation = (id: LocationId): Location => ({
  id,
  spot: MAP_SPOTS[id],
  entrance: ENVIRONMENTS_BY_ID[ENVIRONMENTS[id][0]],
});

export { WORLD_MAP };

/**
 * A place is shown whole, where a piece is shown close up.
 *
 * Every other thumbnail zooms into the part of the doll its tray dresses. A
 * room has no such part: what tells one from another is the whole of it.
 */
export const PLACE_FOCUS: Box = { x: 0, y: 0, width: VIEW_BOX.width, height: VIEW_BOX.height };

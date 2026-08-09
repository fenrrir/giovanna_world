import type { ReactNode } from 'react';

import type { EnvironmentId } from '../model/places';
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

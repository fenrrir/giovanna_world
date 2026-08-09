import type { LocationId } from '../model/places';

/**
 * Where each location sits on the map.
 *
 * The counterpart of `src/anchors.ts`, and it exists for the same reason that
 * one does: two files have to agree about these numbers. The map draws a
 * building at the spot and the finger has to land on the same disc, so a
 * coordinate chosen twice would drift and the child would tap a house that took
 * her nowhere.
 *
 * A floor line is the opposite case and lives with its own room — nothing but
 * that environment ever reads it.
 */
export type Spot = { x: number; y: number; r: number };

/**
 * Keyed by location, so a place added to the taxonomy has nowhere to hide: it
 * is a compile error here until somebody decides where it is.
 */
export const MAP_SPOTS: Readonly<Record<LocationId, Spot>> = {
  house: { x: 220, y: 262, r: 92 },
  park: { x: 474, y: 300, r: 92 },
};

/**
 * Where the world can be: the taxonomy, not the artwork.
 *
 * The counterpart of `slots.ts`. This file says which places exist and how they
 * nest; `world/registry.ts` provides the drawing for each. The model never
 * imports the art layer, so the names have to be declared on this side of the
 * line — and declaring them as a union rather than as strings is what makes
 * adding a room a compile error everywhere it has to be handled.
 *
 * A location holds several environments, and an environment belongs to exactly
 * one. That is why the location is derived rather than stored beside it: two
 * copies of the same fact can disagree, and this one is asked on every tap.
 */
export const ENVIRONMENTS = {
  house: ['house.bedroom', 'house.livingRoom'],
  park: ['park.meadow'],
} as const;

export type LocationId = keyof typeof ENVIRONMENTS;
export type EnvironmentId = (typeof ENVIRONMENTS)[LocationId][number];

export const LOCATION_IDS: readonly LocationId[] = Object.keys(ENVIRONMENTS) as LocationId[];

export const ENVIRONMENT_IDS: readonly EnvironmentId[] = LOCATION_IDS.flatMap(
  (location) => ENVIRONMENTS[location],
);

/**
 * The location an environment belongs to.
 *
 * Built once from the table above, so the two cannot drift. The cast is over
 * code rather than over stored data, which is the whole difference: this key
 * set is derived from the union itself and cannot hold a name from outside it.
 */
const OWNER = Object.fromEntries(
  LOCATION_IDS.flatMap((location) => ENVIRONMENTS[location].map((id) => [id, location])),
) as Record<EnvironmentId, LocationId>;

export const locationOf = (environment: EnvironmentId): LocationId => OWNER[environment];

export const environmentsOf = (location: LocationId): readonly EnvironmentId[] =>
  ENVIRONMENTS[location];

const KNOWN: ReadonlySet<string> = new Set<string>(ENVIRONMENT_IDS);

/**
 * Whether a name out of storage is an environment this version of the app has.
 *
 * The same guard `isSlot` is, for the same reason: a stored world names places
 * as strings, and a world written by a later version can name a room this one
 * has never had.
 */
export const isEnvironmentId = (name: string): name is EnvironmentId => KNOWN.has(name);

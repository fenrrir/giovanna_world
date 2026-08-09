import { DEFAULT_LOOK } from './defaults';
import { PALETTES } from './palettes';
import { isEnvironmentId, type EnvironmentId } from './places';
import type { Look } from './types';

/**
 * The two of them, where they are standing, and where she is looking.
 *
 * `Look` is untouched by all of this. It still describes one person from skin
 * to bag, so the trays, the album, the randomiser and the drag that undresses
 * go on reading exactly what they read before.
 *
 * What used to be a backdrop the doll wore is now a place she is in. That is
 * the whole change: a look can be kept without keeping the afternoon with it,
 * and a room can hold two dolls without belonging to either.
 */
export type DollIndex = 0 | 1;

export const DOLLS: readonly DollIndex[] = [0, 1];

/** Where a doll is standing: which room, and how far across its floor. */
export type Placement = { at: EnvironmentId; x: number };

export type World = {
  schemaVersion: 3;
  /** The dolls, in the order they stand. */
  dolls: readonly [Look, Look];
  /** The room she is looking at. `null` is the map. */
  here: EnvironmentId | null;
  /** Which doll her taps dress. `null` is nobody — she is playing, not dressing. */
  dressing: DollIndex | null;
  /** Where each doll was left. `null` is on the shelf, in no room at all. */
  placements: readonly [Placement | null, Placement | null];
  /** The colour she painted each room. Absent until she paints one. */
  colors: Readonly<Partial<Record<EnvironmentId, string>>>;
};

/**
 * The three modes, derived rather than stored.
 *
 * Three fields already answer the question between them, so a fourth field
 * holding the answer could only ever come to disagree with them.
 */
export type Mode = 'map' | 'place' | 'dress';

export const modeOf = (world: World): Mode =>
  world.here === null ? 'map' : world.dressing === null ? 'place' : 'dress';

/**
 * Two dolls on different skin tones.
 *
 * Identical, they would read as one doll drawn twice, and the first thing she
 * does with a friend is tell them apart.
 */
export const DEFAULT_WORLD: World = {
  schemaVersion: 3,
  dolls: [DEFAULT_LOOK, { ...DEFAULT_LOOK, skin: PALETTES.skin[2] }],
  here: 'house.bedroom',
  dressing: 0,
  placements: [null, null],
  colors: {},
};

/** The doll her taps are dressing, or nobody. */
export const dressedDoll = (world: World): Look | null =>
  world.dressing === null ? null : world.dolls[world.dressing];

/** The world with the doll she is dressing replaced, and nothing else moved. */
export const withDressedDoll = (world: World, look: Look): World =>
  world.dressing === null
    ? world
    : {
        ...world,
        dolls: world.dressing === 0 ? [look, world.dolls[1]] : [world.dolls[0], look],
      };

/** The world with her attention on another doll, or on none of them. */
export const nowDressing = (world: World, doll: DollIndex | null): World =>
  doll === world.dressing ? world : { ...world, dressing: doll };

/**
 * The world seen from somewhere else, or from the map.
 *
 * Going anywhere stops the dressing: she cannot be dressing a doll in a room
 * she has left. It is also what makes the room thumbnail the way out of the
 * wardrobe, without a control of its own.
 */
export const lookingAt = (world: World, here: EnvironmentId | null): World =>
  here === world.here && world.dressing === null ? world : { ...world, here, dressing: null };

/** 0 at the left edge of the canvas, 1 at the right. */
const across = (x: number): number => Math.min(Math.max(x, 0), 1);

const placedAt = (world: World, doll: DollIndex, placement: Placement | null): World => ({
  ...world,
  placements: doll === 0 ? [placement, world.placements[1]] : [world.placements[0], placement],
});

/**
 * Her standing in the room in view, where the child let go of her.
 *
 * She can only be in one room, so putting her down here takes her out of
 * wherever she was. From the map there is no floor to stand on and nothing
 * happens.
 */
export const standing = (world: World, doll: DollIndex, x: number): World =>
  world.here === null ? world : placedAt(world, doll, { at: world.here, x: across(x) });

/** Her back on the shelf, in no room at all. */
export const awayFrom = (world: World, doll: DollIndex): World => placedAt(world, doll, null);

/** The room in view under a colour she chose. The map has no wall to paint. */
export const painted = (world: World, color: string): World =>
  world.here === null ? world : { ...world, colors: { ...world.colors, [world.here]: color } };

/**
 * A world as it comes off the disk: shaped like one, naming places that may not
 * exist any more.
 *
 * Deliberately a type of its own rather than `World`. Calling stored data by
 * the model's name is exactly what let a departed slot reach a lookup that
 * could not answer it — the check has to be somewhere the compiler agrees is
 * still worth making.
 */
export type StoredPlacement = { at: string; x: number };

export type StoredWorld = Omit<World, 'here' | 'placements' | 'colors'> & {
  here: string | null;
  placements: readonly [StoredPlacement | null, StoredPlacement | null];
  colors: Readonly<Record<string, string>>;
};

const stillThere = (placement: StoredPlacement | null): Placement | null =>
  placement && isEnvironmentId(placement.at) ? { at: placement.at, x: across(placement.x) } : null;

const paintedRooms = (colors: Readonly<Record<string, string>>): World['colors'] => {
  const kept: Partial<Record<EnvironmentId, string>> = {};

  for (const [room, color] of Object.entries(colors)) {
    if (isEnvironmentId(room)) kept[room] = color;
  }

  return kept;
};

/**
 * The stored world with every place it names checked against the ones that
 * exist, and every doll brought back inside the canvas.
 *
 * Losing a room costs her a backdrop. Letting a name this version has never had
 * reach the registry costs her the app (see `isSlot`), so nothing gets through
 * here on trust.
 */
export const repairWorld = (world: StoredWorld): World => ({
  ...world,
  here: world.here !== null && isEnvironmentId(world.here) ? world.here : null,
  placements: [stillThere(world.placements[0]), stillThere(world.placements[1])],
  colors: paintedRooms(world.colors),
});

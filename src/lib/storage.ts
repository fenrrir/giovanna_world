import type { EquippedPart, Look } from '../model/types';
import {
  DEFAULT_WORLD,
  repairWorld,
  type DollIndex,
  type StoredPlacement,
  type StoredWorld,
  type World,
} from '../model/world';
import { canonicalJson } from './canonical';

/** The active look, written with a 300 ms debounce (SPEC section 14). */
export const CURRENT_LOOK_KEY = 'look:current';

/**
 * The two of them, their rooms and where she is looking, on the same debounce.
 *
 * Version 3 rather than 2: the `Stage` that claimed 2 never shipped, so no
 * store anywhere holds one and the gap is a number nobody has to migrate from.
 */
export const CURRENT_WORLD_KEY = 'world:current';

const WORLD_VERSION = 3;

/** The looks she chose to keep (SPEC section 14). */
export const SAVED_LOOKS_KEY = 'look:saved';

/** How many the album holds before the oldest falls off the end (SPEC section 14). */
export const MAX_SAVED_LOOKS = 12;

const SCHEMA_VERSION = 1;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isEquippedPart = (value: unknown): value is EquippedPart =>
  isRecord(value) && typeof value.partId === 'string' && typeof value.color === 'string';

const isLook = (value: unknown): value is Look =>
  isRecord(value) &&
  value.schemaVersion === SCHEMA_VERSION &&
  typeof value.skin === 'string' &&
  isRecord(value.equipped) &&
  Object.values(value.equipped).every(isEquippedPart);

/**
 * Reads the stored look, or null when there is nothing usable there.
 *
 * An unknown schema version, malformed JSON or a wrong shape all resolve to
 * null: the app starts from the default and shows no error, because losing a
 * look is a normal scenario, not a failure (SPEC section 14).
 *
 * This deliberately knows nothing about the part registry. Reconciling a look
 * against the parts that actually exist is `sanitizeLook`'s job.
 */
/**
 * The browser store, or null when there is none.
 *
 * Reading `localStorage` is not always safe: Safari with cookies blocked
 * throws on access, and a non-browser host may not define it at all. Treating
 * that as "no data" keeps SPEC section 14's promise that losing a look is a
 * normal scenario rather than a failure.
 */
const browserStorage = (): Storage | null => {
  try {
    // The DOM lib types this as always present; at runtime it may not be.
    const store = globalThis.localStorage as Storage | undefined;

    return store ?? null;
  } catch {
    return null;
  }
};

export const loadLook = (storage: Storage | null = browserStorage()): Look | null => {
  const raw = storage?.getItem(CURRENT_LOOK_KEY) ?? null;

  if (raw === null) return null;

  try {
    const parsed: unknown = JSON.parse(raw);

    return isLook(parsed) ? parsed : null;
  } catch {
    return null;
  }
};

/**
 * The album, with the unreadable entries dropped rather than the whole of it.
 *
 * One look stored by a version that no longer parses costs her that look, not
 * the other eleven — which is the difference between a lost outfit and a lost
 * album (SPEC section 14).
 */
export const loadSavedLooks = (storage: Storage | null = browserStorage()): Look[] => {
  const raw = storage?.getItem(SAVED_LOOKS_KEY) ?? null;

  if (raw === null) return [];

  try {
    const parsed: unknown = JSON.parse(raw);

    return Array.isArray(parsed) ? parsed.filter(isLook).slice(0, MAX_SAVED_LOOKS) : [];
  } catch {
    return [];
  }
};

export const saveSavedLooks = (
  looks: readonly Look[],
  storage: Storage | null = browserStorage(),
): void => {
  try {
    storage?.setItem(SAVED_LOOKS_KEY, JSON.stringify(looks.slice(0, MAX_SAVED_LOOKS)));
  } catch {
    // A full or unavailable store must never surface as an error on screen.
  }
};

/**
 * What tells one outfit from another: everything about it, spelled the one way.
 *
 * Canonical rather than plain JSON because the same outfit arrives here written
 * two ways — read back off the disk and rebuilt by the reducer — and comparing
 * the raw text would call those two different outfits.
 */
export const lookSignature = (look: Look): string => canonicalJson(look);

/**
 * The album with this look kept, newest first.
 *
 * Keeping the same look twice does nothing but move it to the front: a child
 * pressing the button again is not asking for a duplicate, and twelve slots are
 * too few to spend on one. Past twelve the oldest falls off the end, which is
 * why there is no way to delete one — the album empties itself.
 */
export const withSavedLook = (saved: readonly Look[], look: Look): Look[] => {
  const same = lookSignature(look);

  return [look, ...saved.filter((kept) => lookSignature(kept) !== same)].slice(0, MAX_SAVED_LOOKS);
};

const isPlacement = (value: unknown): value is StoredPlacement | null =>
  value === null ||
  (isRecord(value) && typeof value.at === 'string' && typeof value.x === 'number');

const isPlacements = (value: unknown): value is StoredWorld['placements'] =>
  Array.isArray(value) && value.length === 2 && value.every(isPlacement);

const isColors = (value: unknown): value is StoredWorld['colors'] =>
  isRecord(value) && Object.values(value).every((color) => typeof color === 'string');

/**
 * A world off the disk is checked for its shape here and for its names later.
 *
 * `here` and every placement are validated as strings rather than as rooms,
 * deliberately: the room might have been deleted between versions, and losing
 * the whole world over one name is how a child loses two dolls and every outfit
 * on them. `repairWorld` drops the name; this only refuses what is not a world.
 */
const isDolls = (value: unknown): value is StoredWorld['dolls'] =>
  Array.isArray(value) && value.length === 2 && value.every(isLook);

const isHere = (value: unknown): value is string | null =>
  value === null || typeof value === 'string';

const isDressing = (value: unknown): value is DollIndex | null =>
  value === null || value === 0 || value === 1;

const isWorld = (value: unknown): value is StoredWorld =>
  isRecord(value) &&
  value.schemaVersion === WORLD_VERSION &&
  isDolls(value.dolls) &&
  isHere(value.here) &&
  isDressing(value.dressing) &&
  isPlacements(value.placements) &&
  isColors(value.colors);

export const loadWorld = (storage: Storage | null = browserStorage()): World | null => {
  const raw = storage?.getItem(CURRENT_WORLD_KEY) ?? null;

  if (raw === null) return null;

  try {
    const parsed: unknown = JSON.parse(raw);

    return isWorld(parsed) ? repairWorld(parsed) : null;
  } catch {
    return null;
  }
};

export const saveWorld = (world: World, storage: Storage | null = browserStorage()): void => {
  try {
    storage?.setItem(CURRENT_WORLD_KEY, JSON.stringify(world));
  } catch {
    // A full or unavailable store must never surface as an error on screen.
  }
};

/**
 * The look she was wearing before there was a world, as the first doll.
 *
 * The one migration this app performs, and it runs once. It carries the look
 * across whole rather than editing it on the way: whatever the doll was wearing
 * then is still hers, and anything she can no longer wear falls away on read
 * like every other repair (`sanitizeLook`). Taking the backdrop out here would
 * only cost her a sky before there is anywhere else to stand.
 */
const migrated = (storage: Storage | null): World | null => {
  const worn = loadLook(storage);

  return worn === null ? null : { ...DEFAULT_WORLD, dolls: [worn, DEFAULT_WORLD.dolls[1]] };
};

/** What the app opens on: what she left, else what she wore, else the default. */
export const openingWorld = (storage: Storage | null = browserStorage()): World =>
  loadWorld(storage) ?? migrated(storage) ?? DEFAULT_WORLD;

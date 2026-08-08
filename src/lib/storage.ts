import type { EquippedPart, Look } from '../model/types';

/** The active look, written with a 300 ms debounce (SPEC section 14). */
export const CURRENT_LOOK_KEY = 'look:current';

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

export const saveLook = (look: Look, storage: Storage | null = browserStorage()): void => {
  try {
    storage?.setItem(CURRENT_LOOK_KEY, JSON.stringify(look));
  } catch {
    // A full or unavailable store must never surface as an error on screen.
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
 * The album with this look kept, newest first.
 *
 * Keeping the same look twice does nothing but move it to the front: a child
 * pressing the button again is not asking for a duplicate, and twelve slots are
 * too few to spend on one. Past twelve the oldest falls off the end, which is
 * why there is no way to delete one — the album empties itself.
 */
export const withSavedLook = (saved: readonly Look[], look: Look): Look[] => {
  const same = JSON.stringify(look);

  return [look, ...saved.filter((kept) => JSON.stringify(kept) !== same)].slice(0, MAX_SAVED_LOOKS);
};

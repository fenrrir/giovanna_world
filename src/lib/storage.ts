import type { EquippedPart, Look } from '../model/types';

/** The active look, written with a 300 ms debounce (SPEC section 14). */
export const CURRENT_LOOK_KEY = 'look:current';

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
export const loadLook = (storage: Storage = localStorage): Look | null => {
  const raw = storage.getItem(CURRENT_LOOK_KEY);

  if (raw === null) return null;

  try {
    const parsed: unknown = JSON.parse(raw);

    return isLook(parsed) ? parsed : null;
  } catch {
    return null;
  }
};

export const saveLook = (look: Look, storage: Storage = localStorage): void => {
  try {
    storage.setItem(CURRENT_LOOK_KEY, JSON.stringify(look));
  } catch {
    // A full or unavailable store must never surface as an error on screen.
  }
};

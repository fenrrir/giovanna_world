import { PALETTES } from './palettes';
import type { Look } from './types';

/**
 * What the child sees on a first run, and what the app falls back to whenever
 * stored data is missing or unreadable (SPEC section 14).
 */
export const DEFAULT_LOOK: Look = {
  schemaVersion: 1,
  skin: PALETTES.skin[0],
  equipped: {},
};

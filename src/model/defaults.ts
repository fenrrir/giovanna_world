import { PALETTES } from './palettes';
import type { Look } from './types';

/**
 * What the child sees on a first run, and what the app falls back to whenever
 * stored data is missing or unreadable (SPEC section 14).
 */
export const DEFAULT_LOOK: Look = {
  schemaVersion: 1,
  skin: PALETTES.skin[0],
  /*
   * The face is equipped from the start. It is named by id rather than imported,
   * the same way a stored look names one, so the model still never reaches into
   * the art layer. A contract test checks every id here resolves.
   */
  equipped: {
    brows: { partId: 'brows.soft-arch', color: PALETTES.hair[0] },
    lips: { partId: 'lips.smile', color: PALETTES.makeup[2] },
    blush: { partId: 'blush.round', color: PALETTES.makeup[0] },
  },
};

import type { EquippedPart, Look } from './types';

/**
 * Telling the doll apart from the place she is standing in.
 *
 * The backdrop is a slot inside `Look` for now, which is why keeping an outfit
 * in the album keeps the meadow with it. These two are the seam: everything
 * that stores or restores an outfit goes through them, so when `scene` leaves
 * `Look` altogether this file is deleted rather than rewritten.
 */

/** The outfit alone, without the place she happened to be standing in. */
export const withoutScene = (look: Look): Look => {
  const equipped = { ...look.equipped };

  /* Deleted rather than set to undefined — the rule every optional entry here
     follows, so what is stored round-trips through JSON byte for byte. */
  delete equipped.scene;

  return { ...look, equipped };
};

/** A kept outfit put back on, in the backdrop she is looking at now. */
export const inCurrentScene = (kept: Look, current: Look): Look => {
  const here: EquippedPart | undefined = current.equipped.scene;
  const outfit = withoutScene(kept);

  return here ? { ...outfit, equipped: { ...outfit.equipped, scene: here } } : outfit;
};

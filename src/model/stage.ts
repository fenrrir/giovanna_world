import { DEFAULT_LOOK } from './defaults';
import { PALETTES } from './palettes';
import type { EquippedPart, Look } from './types';

/**
 * The two of them, and where they are standing.
 *
 * The backdrop lives here rather than in either doll, which is the whole reason
 * this type exists. A scene inside a `Look` had nowhere to be once there were
 * two of them: shared, it belonged to neither; owned, changing who she was
 * dressing changed the sky.
 *
 * `Look` is untouched by the move. It still describes one person from skin to
 * bag, and everything that reads one — the trays, the album, the randomiser,
 * the drag that undresses — goes on reading exactly what it read before.
 */
export type Stage = {
  schemaVersion: 2;
  /** The backdrop both of them stand in. Absent until she picks one. */
  scene?: EquippedPart;
  /** The dolls, in the order they stand. */
  dolls: readonly [Look, Look];
  /** Which of them her taps dress. */
  dressing: Standing;
};

export type Standing = 0 | 1;

export const STANDING: readonly Standing[] = [0, 1];

/**
 * Two dolls on different skin tones.
 *
 * Identical, they would read as one doll drawn twice, and the first thing she
 * does with a friend is tell them apart.
 */
export const DEFAULT_STAGE: Stage = {
  schemaVersion: 2,
  dolls: [DEFAULT_LOOK, { ...DEFAULT_LOOK, skin: PALETTES.skin[2] }],
  dressing: 0,
};

/** The doll her taps are dressing. */
export const dressedDoll = (stage: Stage): Look => stage.dolls[stage.dressing];

/** The stage with the doll she is dressing replaced, and nothing else moved. */
export const withDressedDoll = (stage: Stage, look: Look): Stage => ({
  ...stage,
  dolls: stage.dressing === 0 ? [look, stage.dolls[1]] : [stage.dolls[0], look],
});

/** The stage with her attention on the other doll. */
export const nowDressing = (stage: Stage, standing: Standing): Stage =>
  standing === stage.dressing ? stage : { ...stage, dressing: standing };

/**
 * The stage under a different sky, or under none.
 *
 * The key is dropped rather than set to undefined, so a stage with no backdrop
 * stores as one without the key at all — the same rule `params` follows.
 */
export const withScene = (stage: Stage, scene?: EquippedPart): Stage => {
  const rest: Omit<Stage, 'scene'> = {
    schemaVersion: stage.schemaVersion,
    dolls: stage.dolls,
    dressing: stage.dressing,
  };

  return scene ? { ...rest, scene } : rest;
};

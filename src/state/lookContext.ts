import { useMemo, type Dispatch } from 'react';

import { DEFAULT_LOOK } from '../model/defaults';
import type { LookAction } from '../model/reducer';
import type { Look } from '../model/types';
import { dressedDoll } from '../model/world';
import { useWorld } from './worldContext';

export type LookStore = {
  look: Look;
  dispatch: Dispatch<LookAction>;
};

/**
 * The doll she is dressing, and a dispatch that reaches her.
 *
 * Its shape is unchanged from when there was one doll and no world, which is
 * the whole point: every tray, the album, the dice and the drag that undresses
 * go on reading `{ look, dispatch }` and never learn that either exists. The
 * wrapping into `{ type: 'dress' }` happens here and nowhere else.
 *
 * It throws when nobody is being dressed rather than falling back to the first
 * doll. A fallback would let a tray silently recolour the wrong one, and no
 * test would catch it; everything that calls this is mounted only while she is
 * dressing somebody, so the throw is a guard against a wiring mistake.
 */
export const useLook = (): LookStore => {
  const { world, dispatch } = useWorld();
  const look = dressedDoll(world);

  const store = useMemo<LookStore | null>(
    () =>
      look === null
        ? null
        : {
            look,
            dispatch: (action: LookAction) => {
              dispatch({ type: 'dress', action });
            },
          },
    [look, dispatch],
  );

  if (!store) {
    throw new Error('useLook must be used while a doll is being dressed');
  }

  return store;
};

export { DEFAULT_LOOK };

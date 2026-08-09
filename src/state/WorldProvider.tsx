import { useEffect, useMemo, useReducer, type JSX, type ReactNode } from 'react';

import { debounce } from '../lib/debounce';
import { openingWorld, saveWorld } from '../lib/storage';
import { sanitizeLook, type PartLookup } from '../model/sanitize';
import { type World } from '../model/world';
import { worldReducer } from '../model/worldReducer';
import { findPart } from '../parts/registry';
import { WorldStoreContext, type WorldStore } from './worldContext';

/** SPEC section 4: no save button — autosave, 300 ms after the last change. */
export const AUTOSAVE_DELAY_MS = 300;

type WorldProviderProps = {
  children: ReactNode;
  /** Injected in tests; defaults to the browser's localStorage. */
  storage?: Storage;
  /** Injected in tests; defaults to the real part registry. */
  lookup?: PartLookup;
  /**
   * Injected in tests; defaults to whatever she left.
   *
   * Every integration test mounts this provider to reach one screen, and
   * without a way in they would each have to walk there first — turning every
   * test of a tray into a test of navigation as well.
   */
  world?: World;
};

/**
 * Both dolls reconciled against the parts that still exist.
 *
 * Storage knows nothing of the registry by design, so this is where a look
 * written when a piece existed meets the version that no longer has it.
 */
const hydrate = (storage: Storage | undefined, lookup: PartLookup): World => {
  const stored = openingWorld(storage);

  return {
    ...stored,
    dolls: [sanitizeLook(stored.dolls[0], lookup), sanitizeLook(stored.dolls[1], lookup)],
  };
};

export const WorldProvider = ({
  children,
  storage,
  lookup,
  world,
}: WorldProviderProps): JSX.Element => {
  const resolveLookup = lookup ?? findPart;
  const [current, dispatch] = useReducer(
    worldReducer,
    undefined,
    () => world ?? hydrate(storage, resolveLookup),
  );

  const persist = useMemo(
    () =>
      debounce((next: World) => {
        saveWorld(next, storage);
      }, AUTOSAVE_DELAY_MS),
    [storage],
  );

  useEffect(() => {
    persist(current);
  }, [current, persist]);

  // A pending write must survive the app closing, so flush on the way out.
  useEffect(
    () => () => {
      persist.flush();
    },
    [persist],
  );

  const store = useMemo<WorldStore>(() => ({ world: current, dispatch }), [current]);

  return <WorldStoreContext.Provider value={store}>{children}</WorldStoreContext.Provider>;
};

import { useEffect, useMemo, useReducer, type JSX, type ReactNode } from 'react';

import { debounce } from '../lib/debounce';
import { loadLook, saveLook } from '../lib/storage';
import { DEFAULT_LOOK } from '../model/defaults';
import { lookReducer } from '../model/reducer';
import { sanitizeLook, type PartLookup } from '../model/sanitize';
import type { Look } from '../model/types';
import { findPart } from '../parts/registry';
import { LookStoreContext, type LookStore } from './lookContext';

/** SPEC section 4: no save button — autosave, 300 ms after the last change. */
export const AUTOSAVE_DELAY_MS = 300;

type LookProviderProps = {
  children: ReactNode;
  /** Injected in tests; defaults to the browser's localStorage. */
  storage?: Storage;
  /** Injected in tests; defaults to the real part registry. */
  lookup?: PartLookup;
};

/**
 * Reads the stored look once, reconciles it against the parts that still
 * exist, and starts from the default if any of that fails.
 */
const hydrate = (storage: Storage | undefined, lookup: PartLookup): Look => {
  const stored = loadLook(storage);

  return stored ? sanitizeLook(stored, lookup) : DEFAULT_LOOK;
};

export const LookProvider = ({ children, storage, lookup }: LookProviderProps): JSX.Element => {
  const resolveLookup = lookup ?? findPart;
  const [look, dispatch] = useReducer(lookReducer, undefined, () =>
    hydrate(storage, resolveLookup),
  );

  const persist = useMemo(
    () =>
      debounce((next: Look) => {
        saveLook(next, storage);
      }, AUTOSAVE_DELAY_MS),
    [storage],
  );

  useEffect(() => {
    persist(look);
  }, [look, persist]);

  // A pending write must survive the app closing, so flush on the way out.
  useEffect(
    () => () => {
      persist.flush();
    },
    [persist],
  );

  const store = useMemo<LookStore>(() => ({ look, dispatch }), [look]);

  return <LookStoreContext.Provider value={store}>{children}</LookStoreContext.Provider>;
};

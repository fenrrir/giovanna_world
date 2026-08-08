import { createContext, useContext, type Dispatch } from 'react';

import { DEFAULT_LOOK } from '../model/defaults';
import type { LookAction } from '../model/reducer';
import type { Look } from '../model/types';

export type LookStore = {
  look: Look;
  dispatch: Dispatch<LookAction>;
};

export const LookStoreContext = createContext<LookStore | null>(null);

export const useLook = (): LookStore => {
  const store = useContext(LookStoreContext);

  if (!store) {
    throw new Error('useLook must be used inside a LookProvider');
  }

  return store;
};

export { DEFAULT_LOOK };

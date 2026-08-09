import { createContext, useContext, type Dispatch } from 'react';

import type { World } from '../model/world';
import type { WorldAction } from '../model/worldReducer';

export type WorldStore = {
  world: World;
  dispatch: Dispatch<WorldAction>;
};

export const WorldStoreContext = createContext<WorldStore | null>(null);

export const useWorld = (): WorldStore => {
  const store = useContext(WorldStoreContext);

  if (!store) {
    throw new Error('useWorld must be used inside a WorldProvider');
  }

  return store;
};

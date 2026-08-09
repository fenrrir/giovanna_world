import type { JSX } from 'react';

import { useWorld } from './state/worldContext';
import { DressView } from './ui/DressView';
import { MapView } from './ui/MapView';
import { PlaceView } from './ui/PlaceView';
import styles from './App.module.css';

/**
 * Where she is decides what she sees.
 *
 * Three modes, and none of them is stored: the room she is looking at and the
 * doll she is dressing already answer the question between them, so a field
 * holding the answer could only come to disagree with them.
 *
 * Nothing here stacks. Every move is made by tapping a picture of the
 * destination — a room in the rail, the doll herself — and every place is one
 * tap from wherever she is, which is what SPEC section 4's rule becomes once
 * the game has more than one room in it.
 *
 * `here === null` is the map: nowhere in particular, which is where she starts
 * and where the track between the places is drawn.
 */
export const App = (): JSX.Element => {
  const { world } = useWorld();

  return (
    <main className={styles.app}>
      {world.here === null ? (
        <MapView />
      ) : world.dressing === null ? (
        <PlaceView here={world.here} />
      ) : (
        <DressView here={world.here} doll={world.dressing} />
      )}
    </main>
  );
};

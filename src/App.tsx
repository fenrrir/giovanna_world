import type { JSX } from 'react';

import { useWorld } from './state/worldContext';
import { DressView } from './ui/DressView';
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
 * `here === null` is the map, and there is no map drawn yet. It renders an
 * empty stage rather than guessing at a room, and nothing dispatches its way
 * until the map arrives.
 */
export const App = (): JSX.Element => {
  const { world } = useWorld();

  return (
    <main className={styles.app}>
      {world.here !== null &&
        (world.dressing === null ? (
          <PlaceView here={world.here} />
        ) : (
          <DressView here={world.here} doll={world.dressing} />
        ))}
    </main>
  );
};

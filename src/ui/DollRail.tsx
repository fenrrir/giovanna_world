import type { JSX } from 'react';

import type { EnvironmentId } from '../model/places';
import { DOLLS } from '../model/world';
import { useWorld } from '../state/worldContext';
import { acrossFloor, canvasX } from '../world/placement';
import { findEnvironment } from '../world/registry';
import { PlacingDoll } from './PlacingDoll';
import { ScrollRail } from './ScrollRail';
import type { DragPoint } from './useDrag';
import styles from './controls.module.css';

type DollRailProps = {
  here: EnvironmentId;
  /** Where the room is on screen, so a drop can be measured against it. */
  stage: () => DOMRect | undefined;
  isInsideDropZone: (point: DragPoint) => boolean;
};

/**
 * Where the next one stands, given how many are already in.
 *
 * A quarter and three quarters is the widest two of them fit without
 * overlapping at the size the inherited rooms stand her at. Written as a
 * function of the count rather than as a list to index into: with two dolls
 * there is no third case, and a fallback for one would never run.
 */
const spotFor = (taken: number): number => (taken === 0 ? 0.25 : 0.75);

/**
 * The dolls, and which of them is standing in this room.
 *
 * Tapping one who is not here puts her here; tapping one who is starts dressing
 * her. The second tap is the thing a child actually wants next, and it makes
 * this the keyboard path into the wardrobe — tapping her on the stage is a
 * per-pixel hit test with no key to press, exactly like the drag that
 * undresses, so the way in cannot be that gesture alone.
 *
 * Carrying her into the room instead stands her where the finger let go. Taking
 * her out again is the mirror of it, on the room itself: drag her off the stage,
 * which is how a garment already comes off.
 */
export const DollRail = ({ here, stage, isInsideDropZone }: DollRailProps): JSX.Element => {
  const { world, dispatch } = useWorld();

  const isHere = (doll: number): boolean => world.placements[doll]?.at === here;
  const taken = DOLLS.filter(isHere).length;
  const { floor } = findEnvironment(here);

  return (
    <div className={styles.column}>
      <ScrollRail>
        {DOLLS.map((doll) => (
          <li key={doll}>
            <PlacingDoll
              look={world.dolls[doll]}
              here={isHere(doll)}
              isInsideDropZone={isInsideDropZone}
              onSelect={() => {
                if (isHere(doll)) dispatch({ type: 'dressDoll', doll });
                else dispatch({ type: 'place', doll, x: spotFor(taken) });
              }}
              onPlace={(point) => {
                const box = stage();

                if (box)
                  dispatch({ type: 'place', doll, x: acrossFloor(floor, canvasX(point.x, box)) });
              }}
            />
          </li>
        ))}
      </ScrollRail>
    </div>
  );
};

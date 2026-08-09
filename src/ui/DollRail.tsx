import type { JSX } from 'react';

import { useTranslation } from '../i18n';
import type { EnvironmentId } from '../model/places';
import { DOLLS } from '../model/world';
import { BODY, findPart } from '../parts/registry';
import { Doll } from '../render/Doll';
import { useWorld } from '../state/worldContext';
import { ScrollRail } from './ScrollRail';
import { TapTarget } from './TapTarget';
import styles from './controls.module.css';

type DollRailProps = {
  here: EnvironmentId;
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
 * Taking her out of the room is left to the drag that arrives with choosing
 * where she stands, which is how a garment already comes off.
 */
export const DollRail = ({ here }: DollRailProps): JSX.Element => {
  const { t } = useTranslation();
  const { world, dispatch } = useWorld();

  const isHere = (doll: number): boolean => world.placements[doll]?.at === here;
  const taken = DOLLS.filter(isHere).length;

  return (
    <div className={styles.column}>
      <ScrollRail>
        {DOLLS.map((doll) => (
          <li key={doll}>
            <TapTarget
              label={t('doll.put')}
              selected={isHere(doll)}
              onSelect={() => {
                if (isHere(doll)) dispatch({ type: 'dressDoll', doll });
                else dispatch({ type: 'place', doll, x: spotFor(taken) });
              }}
            >
              <Doll
                className={styles.thumb}
                look={world.dolls[doll]}
                lookup={findPart}
                body={BODY}
                label={t('doll.put')}
              />
            </TapTarget>
          </li>
        ))}
      </ScrollRail>
    </div>
  );
};

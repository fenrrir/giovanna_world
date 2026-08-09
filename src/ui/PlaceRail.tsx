import type { JSX } from 'react';

import { useTranslation } from '../i18n';
import { ENVIRONMENT_IDS } from '../model/places';
import { Thumb } from '../render/Thumb';
import { useWorld } from '../state/worldContext';
import { ENVIRONMENTS_BY_ID, PLACE_FOCUS } from '../world/registry';
import { ScrollRail } from './ScrollRail';
import { TapTarget } from './TapTarget';
import styles from './controls.module.css';

/**
 * Everywhere she can go, each shown as a picture of itself.
 *
 * It stands where the scenery tray used to, and it is the same gesture: tap a
 * room and she is in it. What changed is what the tap means — the room is no
 * longer something the doll wears, so it stays put when the doll changes and it
 * is not kept when an outfit is (SPEC section 4's rule, restated for a world:
 * every move is made by tapping a picture of the destination).
 *
 * Every environment there is, for now. Locations exist in the taxonomy but have
 * no meaning on screen until there is a map to pick one from, and a rail that
 * only showed the current location's rooms would strand her in the house.
 */
export const PlaceRail = (): JSX.Element => {
  const { t } = useTranslation();
  const { world, dispatch } = useWorld();

  return (
    <div className={styles.column}>
      <ScrollRail>
        {ENVIRONMENT_IDS.map((id) => {
          const environment = ENVIRONMENTS_BY_ID[id];

          return (
            <li key={id}>
              <TapTarget
                label={t('place.go')}
                selected={id === world.here}
                onSelect={() => {
                  dispatch({ type: 'goTo', here: id });
                }}
              >
                <Thumb
                  className={styles.thumb}
                  render={environment.render}
                  color={world.colors[id] ?? environment.defaultColor}
                  focus={PLACE_FOCUS}
                  label={t('place.go')}
                />
              </TapTarget>
            </li>
          );
        })}
      </ScrollRail>
    </div>
  );
};

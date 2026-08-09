import { useCallback, type JSX, type PointerEvent as ReactPointerEvent } from 'react';

import { useTranslation } from '../i18n';
import type { EnvironmentId } from '../model/places';
import { DOLLS, type DollIndex } from '../model/world';
import { BODY, findPart } from '../parts/registry';
import { Scene, type Standing } from '../render/Scene';
import { useWorld } from '../state/worldContext';
import { dollTransform } from '../world/placement';
import { findEnvironment } from '../world/registry';
import { DollRail } from './DollRail';
import { PlaceRail } from './PlaceRail';
import styles from '../App.module.css';

type PlaceViewProps = {
  here: EnvironmentId;
};

/**
 * A room, with whoever is standing in it.
 *
 * Tapping a doll starts dressing her, which is the only way into the wardrobe.
 * The hit test is the browser's own, so it is per-pixel: she has to touch
 * painted artwork rather than a doll's bounding box — the same decision the
 * drag that undresses already made, and for the same reason. Two dolls standing
 * close together overlap at the edges, and a box would give the wrong one.
 *
 * The one thing this has no keyboard path to, like the drag that undresses.
 * Recorded rather than hidden; the rail of dolls will be the way in.
 */
export const PlaceView = ({ here }: PlaceViewProps): JSX.Element => {
  const { t } = useTranslation();
  const { world, dispatch } = useWorld();

  const environment = findEnvironment(here);
  const color = world.colors[here] ?? environment.defaultColor;

  const standing: Standing[] = DOLLS.flatMap((doll) => {
    const placement = world.placements[doll];

    return placement?.at === here
      ? [
          {
            doll,
            look: world.dolls[doll],
            transform: dollTransform(environment.floor, placement.x),
          },
        ]
      : [];
  });

  /** Which doll a finger landed on, answered by the browser's own hit test. */
  const dollAt = useCallback((x: number, y: number): DollIndex | null => {
    const touched = document.elementFromPoint(x, y)?.closest('[data-doll]');
    const index = Number(touched?.getAttribute('data-doll'));

    return DOLLS.find((doll) => doll === index) ?? null;
  }, []);

  const onPointerDown = (event: ReactPointerEvent<HTMLElement>): void => {
    const doll = dollAt(event.clientX, event.clientY);

    if (doll !== null) dispatch({ type: 'dressDoll', doll });
  };

  return (
    <>
      <section className={styles.stage}>
        <div className={styles.doll} onPointerDown={onPointerDown}>
          <Scene
            environment={environment}
            color={color}
            standing={standing}
            lookup={findPart}
            body={BODY}
            label={t('place.here')}
          />
        </div>
      </section>

      <DollRail here={here} />
      <PlaceRail />
    </>
  );
};

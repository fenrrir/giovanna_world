import { useCallback, type JSX, type PointerEvent as ReactPointerEvent } from 'react';

import { useTranslation } from '../i18n';
import { LOCATION_IDS, type LocationId } from '../model/places';
import { useWorld } from '../state/worldContext';
import { WORLD_MAP, findLocation } from '../world/registry';
import { PlaceRail } from './PlaceRail';
import styles from '../App.module.css';

/**
 * The world from above, with the places she can go on it.
 *
 * Tapping a building takes her inside, to the first room of that location. The
 * hit test is the browser's own, so it is per-pixel — she has to touch the
 * house rather than a rectangle around it, which is what lets two places sit
 * near each other without either stealing the other's taps.
 *
 * The rail beside it holds the same places, and is the keyboard path in:
 * touching a drawing is a gesture with no key to press, so the way in cannot be
 * that gesture alone.
 */
export const MapView = (): JSX.Element => {
  const { t } = useTranslation();
  const { dispatch } = useWorld();

  /** Which location a finger landed on, answered by the browser's hit test. */
  const locationAt = useCallback((x: number, y: number): LocationId | null => {
    const touched = document.elementFromPoint(x, y)?.closest('[data-location]');
    const id = touched?.getAttribute('data-location');

    return LOCATION_IDS.find((candidate) => candidate === id) ?? null;
  }, []);

  const onPointerDown = (event: ReactPointerEvent<HTMLElement>): void => {
    const id = locationAt(event.clientX, event.clientY);

    if (id !== null) dispatch({ type: 'goTo', here: findLocation(id).entrance.id });
  };

  return (
    <>
      <section className={styles.stage}>
        <div className={styles.doll} onPointerDown={onPointerDown}>
          <svg
            viewBox="0 0 680 540"
            width="100%"
            preserveAspectRatio="xMidYMid meet"
            role="img"
            aria-label={t('place.map')}
          >
            {WORLD_MAP.render(WORLD_MAP.defaultColor)}
          </svg>
        </div>
      </section>

      <PlaceRail />
    </>
  );
};

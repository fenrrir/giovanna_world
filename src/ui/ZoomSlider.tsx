import type { ChangeEvent, JSX } from 'react';

import { useTranslation } from '../i18n';
import { MAX_ZOOM, MIN_ZOOM, ZOOM_STEP } from '../lib/zoom';
import styles from './controls.module.css';

type ZoomSliderProps = {
  zoom: number;
  onChange: (zoom: number) => void;
};

/**
 * How close the view sits to the doll.
 *
 * A native range input rather than a pair of buttons: it carries no word, it is
 * draggable with one finger, and it answers to the arrow keys for free — which
 * makes it the only continuous control here that a keyboard can reach without
 * anything extra being written for it.
 */
export const ZoomSlider = ({ zoom, onChange }: ZoomSliderProps): JSX.Element => {
  const { t } = useTranslation();

  return (
    <input
      className={styles.zoom}
      type="range"
      min={MIN_ZOOM}
      max={MAX_ZOOM}
      step={ZOOM_STEP}
      value={zoom}
      aria-label={t('zoom.label')}
      onChange={(event: ChangeEvent<HTMLInputElement>) => {
        onChange(Number(event.target.value));
      }}
    />
  );
};

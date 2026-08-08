import type { JSX } from 'react';

import { useTranslation } from '../i18n';
import { cx } from '../lib/cx';
import { dots } from '../lib/patterns';
import { PALETTES } from '../model/palettes';
import { useLook } from '../state/lookContext';
import { randomLook, type Rng } from './randomize';
import { useLongPress } from './useLongPress';
import styles from './controls.module.css';

type RandomButtonProps = {
  /** Injected in tests so the outcome can be pinned. */
  rng?: Rng;
};

const DIE = { x: 8, y: 8, width: 40, height: 40 };

/**
 * Dresses the doll at random, on a long press.
 *
 * It is the only control that throws away what the child made, so SPEC section 4
 * requires a hold rather than a tap. The button fills while held, which is the
 * whole feedback — a six-year-old needs to see that something is happening.
 *
 * The icon is a die drawn with the same dot generator the polka-dot dress uses.
 * No words anywhere, as everywhere else in the game.
 */
export const RandomButton = ({ rng = Math.random }: RandomButtonProps): JSX.Element => {
  const { t } = useTranslation();
  const { dispatch } = useLook();

  const { held, handlers } = useLongPress(() => {
    dispatch({ type: 'replaceLook', look: randomLook(rng) });
  });

  return (
    <button
      type="button"
      className={cx(styles.target, held && styles.held)}
      aria-label={t('look.randomise')}
      data-held={held ? 'true' : 'false'}
      {...handlers}
    >
      <svg className={styles.thumb} viewBox="0 0 56 56" role="img" aria-hidden="true">
        <rect x="2" y="2" width="52" height="52" rx="14" fill={PALETTES.fabric[0]} />
        {dots(DIE, '#FBFBF9', { radius: 5, spacing: 15 })}
      </svg>
    </button>
  );
};

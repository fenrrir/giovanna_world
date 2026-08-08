import type { ChangeEvent, JSX } from 'react';

import { useTranslation } from '../i18n';
import type { MessageKey } from '../i18n';
import styles from './controls.module.css';

type ColorPickerProps = {
  /** The colour the control currently stands for. */
  value: string;
  label: MessageKey;
  onPick: (color: string) => void;
};

/**
 * Any colour at all, next to the handful the palette offers.
 *
 * The palettes exist so that whatever the child picks looks right together, and
 * they stay first for that reason. This sits at the end of the row as the way
 * out of them — a six-year-old who wants a turquoise dress should get one.
 *
 * It is the platform's own picker rather than a wheel drawn here: it needs no
 * network, it is already the gesture the child's iPad teaches, and it is
 * reachable from a keyboard without anything being written for it.
 */
export const ColorPicker = ({ value, label, onPick }: ColorPickerProps): JSX.Element => {
  const { t } = useTranslation();

  return (
    <input
      type="color"
      className={styles.picker}
      value={value}
      aria-label={t(label)}
      onChange={(event: ChangeEvent<HTMLInputElement>) => {
        onPick(event.target.value);
      }}
    />
  );
};

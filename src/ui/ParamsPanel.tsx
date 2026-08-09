import type { ChangeEvent, JSX } from 'react';

import { useTranslation } from '../i18n';
import type { PartParams } from '../model/types';
import { useLook } from '../state/lookContext';
import type { ShapedFamily } from './shaped';
import styles from './controls.module.css';

type ParamsPanelProps = {
  family: ShapedFamily;
  /** The shape she is wearing, already repaired. */
  params: PartParams;
  /** The colour the piece keeps as its shape changes. */
  color: string;
};

/** Twenty stops. Fine enough to feel continuous, coarse enough to land on. */
const STEP = 0.05;

/**
 * The axes of a piece the child shapes herself.
 *
 * The one surface in the game that carries visible text, by decision recorded
 * in SPEC section 4: unlabelled sliders in a column are indistinguishable, so
 * she could only tell them apart by dragging each in turn.
 *
 * It knows a family only by its axis names, never by the shape of that family's
 * params. Typed to `HairParams` it could only ever have served hair, and the
 * jacket would have needed a second panel identical but for three words.
 *
 * It has no open state of its own. It is on screen exactly while the piece it
 * shapes is the one worn, so picking anything else puts it away — which is how
 * it stays inside the game's single level of navigation with no modal and no
 * way back to look for.
 *
 * Every change dispatches straight away; the 300 ms autosave in WorldProvider is
 * what absorbs a finger dragging an axis from end to end, exactly as it does
 * for the colour picker.
 */
export const ParamsPanel = ({ family, params, color }: ParamsPanelProps): JSX.Element => {
  const { t } = useTranslation();
  const { dispatch } = useLook();

  const shape = (next: PartParams): void => {
    dispatch(family.apply(next, color));
  };

  return (
    <div className={styles.params}>
      {family.axes.map((axis) => (
        <label key={axis.key} className={styles.axis}>
          {t(axis.label)}
          <input
            className={styles.slider}
            // Named again rather than left to the wrapping label: a range input
            // with no explicit name is announced as its own value, so several
            // axes in a column come out as "0,5", "0,5", "0,4".
            aria-label={t(axis.label)}
            type="range"
            min={0}
            max={1}
            step={STEP}
            value={Number(params[axis.key])}
            onChange={(event: ChangeEvent<HTMLInputElement>) => {
              shape({ ...params, [axis.key]: Number(event.target.value) });
            }}
          />
        </label>
      ))}

      <fieldset className={styles.fringes}>
        <legend>{t(family.choice.label)}</legend>

        {family.choice.options.map((option) => (
          <button
            key={option.value}
            type="button"
            className={styles.fringe}
            aria-pressed={option.value === params[family.choice.key]}
            onPointerDown={(event) => {
              event.preventDefault();
              shape({ ...params, [family.choice.key]: option.value });
            }}
            onClick={(event) => {
              // A real pointer already chose on the way down; this is the keyboard.
              if (event.detail === 0) shape({ ...params, [family.choice.key]: option.value });
            }}
          >
            {t(option.label)}
          </button>
        ))}
      </fieldset>
    </div>
  );
};

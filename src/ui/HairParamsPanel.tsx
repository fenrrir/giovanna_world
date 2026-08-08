import type { ChangeEvent, JSX } from 'react';

import { useTranslation, type MessageKey } from '../i18n';
import { customHair } from '../parts/hair/custom';
import {
  FRINGES,
  HAIR_AXES,
  toHairParams,
  type Fringe,
  type HairAxis,
  type HairParams,
} from '../parts/hair/custom/params';
import { useLook } from '../state/lookContext';
import { customHairParams } from './trays';
import styles from './controls.module.css';

type HairParamsPanelProps = {
  /** The colour the hairstyle keeps as its shape changes. */
  color: string;
};

const AXIS_LABEL: Record<HairAxis, MessageKey> = {
  length: 'hair.length',
  volume: 'hair.volume',
  wave: 'hair.wave',
};

const FRINGE_LABEL: Record<Fringe, MessageKey> = {
  none: 'hair.fringe.none',
  straight: 'hair.fringe.straight',
  side: 'hair.fringe.side',
  curtain: 'hair.fringe.curtain',
};

/** Twenty stops. Fine enough to feel continuous, coarse enough to land on. */
const STEP = 0.05;

/**
 * The axes of the hairstyle the child shapes herself.
 *
 * The one surface in the game that carries visible text, by decision recorded
 * in SPEC section 4: three unlabelled sliders are indistinguishable to a child
 * who cannot read, so she could only tell them apart by dragging each in turn.
 *
 * It has no open state of its own. It is on screen exactly while the generated
 * hairstyle is the one worn, so picking any other hairstyle puts it away —
 * which is how it stays inside the game's single level of navigation with no
 * modal and no way back to look for.
 *
 * Every change dispatches straight away; the 300 ms autosave in LookProvider is
 * what absorbs a finger dragging the length from end to end, exactly as it does
 * for the colour picker.
 */
export const HairParamsPanel = ({ color }: HairParamsPanelProps): JSX.Element => {
  const { look, dispatch } = useLook();
  const { t } = useTranslation();
  const params = toHairParams(customHairParams(look));

  const shape = (next: HairParams): void => {
    dispatch({ type: 'applyHair', hair: customHair(next), color, params: next });
  };

  return (
    <div className={styles.params}>
      {HAIR_AXES.map((axis) => (
        <label key={axis} className={styles.axis}>
          {t(AXIS_LABEL[axis])}
          <input
            className={styles.slider}
            // Named again rather than left to the wrapping label: a range input
            // with no explicit name is announced as its own value, so three
            // axes in a column come out as "0,5", "0,5", "0,4".
            aria-label={t(AXIS_LABEL[axis])}
            type="range"
            min={0}
            max={1}
            step={STEP}
            value={params[axis]}
            onChange={(event: ChangeEvent<HTMLInputElement>) => {
              shape({ ...params, [axis]: Number(event.target.value) });
            }}
          />
        </label>
      ))}

      <fieldset className={styles.fringes}>
        <legend>{t('hair.fringe')}</legend>

        {FRINGES.map((fringe) => (
          <button
            key={fringe}
            type="button"
            className={styles.fringe}
            aria-pressed={fringe === params.fringe}
            onPointerDown={(event) => {
              event.preventDefault();
              shape({ ...params, fringe });
            }}
            onClick={(event) => {
              // A real pointer already chose on the way down; this is the keyboard.
              if (event.detail === 0) shape({ ...params, fringe });
            }}
          >
            {t(FRINGE_LABEL[fringe])}
          </button>
        ))}
      </fieldset>
    </div>
  );
};

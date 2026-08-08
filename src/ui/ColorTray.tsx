import type { JSX } from 'react';

import { useTranslation } from '../i18n';
import { PALETTES } from '../model/palettes';
import { useLook } from '../state/lookContext';
import { TapTarget } from './TapTarget';
import { equippedIn, type TrayDefinition } from './trays';
import styles from './controls.module.css';

type ColorTrayProps = { tray: TrayDefinition };

/**
 * The colours for the open tray, plus the skin tones.
 *
 * Recolouring an empty slot would do nothing visible, so the garment palette
 * only appears once something is worn there. The skin row is always available,
 * because the body is always on screen.
 */
export const ColorTray = ({ tray }: ColorTrayProps): JSX.Element => {
  const { t } = useTranslation();
  const { look, dispatch } = useLook();
  const worn = equippedIn(look, tray);

  return (
    <div>
      <ul className={styles.row}>
        {PALETTES.skin.map((color) => (
          <li key={color}>
            <TapTarget
              label={t('skin.choose')}
              selected={color === look.skin}
              onSelect={() => {
                dispatch({ type: 'setSkin', color });
              }}
            >
              <span className={styles.swatch} style={{ background: color }} aria-hidden="true" />
            </TapTarget>
          </li>
        ))}
      </ul>

      {worn !== undefined && (
        <ul className={styles.row}>
          {PALETTES[tray.palette].map((color) => (
            <li key={color}>
              <TapTarget
                label={t('color.choose')}
                selected={color === look.equipped[tray.slot]?.color}
                onSelect={() => {
                  dispatch({ type: 'setSlotColor', slot: tray.slot, color });
                }}
              >
                <span className={styles.swatch} style={{ background: color }} aria-hidden="true" />
              </TapTarget>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

import type { JSX } from 'react';

import { useTranslation } from '../i18n';
import { PALETTES } from '../model/palettes';
import { Thumb } from '../render/Thumb';
import { useLook } from '../state/lookContext';
import { TapTarget } from './TapTarget';
import { equippedIn, trayItems, type TrayDefinition } from './trays';
import styles from './controls.module.css';

type PartTrayProps = { tray: TrayDefinition };

/**
 * The pieces available in the open tray.
 *
 * Choosing one keeps whatever colour that slot already had, so swapping a top
 * does not silently reset the child's colour choice.
 */
export const PartTray = ({ tray }: PartTrayProps): JSX.Element => {
  const { t } = useTranslation();
  const { look, dispatch } = useLook();
  const worn = equippedIn(look, tray);
  const currentColor = look.equipped[tray.slot]?.color ?? PALETTES[tray.palette][0];

  return (
    <ul className={styles.row}>
      {trayItems(tray).map((item) => (
        <li key={item.id}>
          <TapTarget
            label={t('part.choose', { tray: t(tray.label) })}
            selected={item.id === worn}
            onSelect={() => {
              dispatch(item.apply(currentColor));
            }}
          >
            <Thumb
              className={styles.thumb}
              render={item.render}
              color={currentColor}
              focus={tray.focus}
              label={t(tray.label)}
            />
          </TapTarget>
        </li>
      ))}
    </ul>
  );
};

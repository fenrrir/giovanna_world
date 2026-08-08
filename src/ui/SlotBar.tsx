import type { JSX } from 'react';

import { useTranslation } from '../i18n';
import { PALETTES } from '../model/palettes';
import type { TraySlot } from '../model/slots';
import { Thumb } from '../render/Thumb';
import { useLook } from '../state/lookContext';
import { ScrollRow } from './ScrollRow';
import { TapTarget } from './TapTarget';
import { TRAYS, equippedIn, trayIcon } from './trays';
import styles from './controls.module.css';

type SlotBarProps = {
  active: TraySlot;
  onSelect: (tray: TraySlot) => void;
};

/**
 * The trays the child can open.
 *
 * Each label is a thumbnail of the piece itself, never a word (SPEC section 4).
 * A tray shows what is currently worn, so the bar reads as a summary of the
 * doll rather than an abstract menu.
 */
export const SlotBar = ({ active, onSelect }: SlotBarProps): JSX.Element => {
  const { t } = useTranslation();
  const { look } = useLook();

  return (
    <ScrollRow>
      {TRAYS.map((tray) => {
        const icon = trayIcon(look, tray);
        const wornColor = look.equipped[tray.slot]?.color;

        return (
          <li key={tray.id}>
            <TapTarget
              label={t('tray.open', { tray: t(tray.label) })}
              selected={tray.id === active}
              onSelect={() => {
                onSelect(tray.id);
              }}
            >
              {icon ? (
                <Thumb
                  className={styles.thumb}
                  render={icon.render}
                  color={wornColor ?? PALETTES[tray.palette][0]}
                  focus={tray.focus}
                  label={t(tray.label)}
                  data-worn={equippedIn(look, tray) ?? ''}
                />
              ) : (
                <span className={styles.swatch} aria-hidden="true" />
              )}
            </TapTarget>
          </li>
        );
      })}
    </ScrollRow>
  );
};

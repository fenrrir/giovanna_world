import type { JSX } from 'react';

import { useTranslation } from '../i18n';
import { PALETTES } from '../model/palettes';
import type { TraySlot } from '../model/slots';
import { Thumb } from '../render/Thumb';
import { useLook } from '../state/lookContext';
import { ScrollRail } from './ScrollRail';
import { TapTarget } from './TapTarget';
import { TRAYS, equippedIn, trayIcon } from './trays';
import styles from './controls.module.css';

/** The album is not a slot, so it is named apart from the trays that are. */
export const SAVED_TRAY = 'saved';

export type ActiveTray = TraySlot | typeof SAVED_TRAY;

type SlotBarProps = {
  active: ActiveTray;
  onSelect: (tray: ActiveTray) => void;
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
    <ScrollRail>
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

      {/* Last, and a drawn star rather than a piece: the album holds outfits,
          not something she can wear on its own. */}
      <li>
        <TapTarget
          label={t('tray.open', { tray: t('tray.saved') })}
          selected={active === SAVED_TRAY}
          onSelect={() => {
            onSelect(SAVED_TRAY);
          }}
        >
          <svg viewBox="0 0 24 24" className={styles.thumb} aria-hidden="true" focusable="false">
            <path
              d="M 12 3 L 14.6 9.2 L 21.2 9.7 L 16.2 14.1 L 17.7 20.6 L 12 17.1 L 6.3 20.6 L 7.8 14.1 L 2.8 9.7 L 9.4 10.2 Z"
              fill="currentColor"
            />
          </svg>
        </TapTarget>
      </li>
    </ScrollRail>
  );
};

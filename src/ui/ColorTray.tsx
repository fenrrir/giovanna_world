import type { JSX } from 'react';

import { PALETTES } from '../model/palettes';
import { useLook } from '../state/lookContext';
import { ColorPicker } from './ColorPicker';
import { equippedIn, type TrayDefinition } from './trays';
import styles from './controls.module.css';

type ColorTrayProps = { tray: TrayDefinition };

/**
 * The skin tone, and the colour of whatever is worn in the open tray.
 *
 * Both are free pickers rather than rows of swatches: any colour at all, which
 * is what the child asked the app for. The palettes still exist behind them —
 * they are what a new piece arrives wearing and what the randomiser draws from
 * — but they are no longer the limit.
 *
 * Recolouring an empty slot would do nothing visible, so the second picker only
 * appears once something is worn there. The skin picker is always available,
 * because the body is always on screen.
 */
export const ColorTray = ({ tray }: ColorTrayProps): JSX.Element => {
  const { look, dispatch } = useLook();
  const worn = equippedIn(look, tray);

  return (
    <div className={styles.pickers}>
      <ColorPicker
        value={look.skin}
        label="skin.pick"
        onPick={(color) => {
          dispatch({ type: 'setSkin', color });
        }}
      />

      {worn !== undefined && (
        <ColorPicker
          value={look.equipped[tray.slot]?.color ?? PALETTES[tray.palette][0]}
          label="color.pick"
          onPick={(color) => {
            dispatch({ type: 'setSlotColor', slot: tray.slot, color });
          }}
        />
      )}
    </div>
  );
};

import type { JSX } from 'react';

import { PALETTES } from '../model/palettes';
import { useLook } from '../state/lookContext';
import { DraggablePart } from './DraggablePart';
import { ParamsPanel } from './ParamsPanel';
import { equippedIn, trayItems, trayParams, type TrayDefinition } from './trays';
import type { DragPoint } from './useDrag';
import styles from './controls.module.css';

type PartTrayProps = {
  tray: TrayDefinition;
  /** Where the doll is. Injected because only the layout knows the rectangle. */
  isInsideDropZone: (point: DragPoint) => boolean;
};

/**
 * The pieces available in the open tray.
 *
 * Choosing one keeps whatever colour that slot already had, so swapping a top
 * does not silently reset the child's colour choice.
 */
export const PartTray = ({ tray, isInsideDropZone }: PartTrayProps): JSX.Element => {
  const { look, dispatch } = useLook();
  const worn = equippedIn(look, tray);
  const currentColor = look.equipped[tray.slot]?.color ?? PALETTES[tray.palette][0];
  const items = trayItems(tray, look);
  const family = tray.shaped;

  return (
    <>
      <ul className={styles.row}>
        {items.map((item) => (
          <li key={item.id}>
            <DraggablePart
              tray={tray}
              item={item}
              color={currentColor}
              worn={item.id === worn}
              onChoose={() => {
                dispatch(item.apply(currentColor));
              }}
              isInsideDropZone={isInsideDropZone}
            />
          </li>
        ))}
      </ul>

      {/*
       * Below the row rather than instead of it, and with no open state of its
       * own: the axes are on screen exactly while the piece they shape is the
       * one worn. Picking any other piece puts them away, which is what keeps
       * the game at one level of navigation with nothing to go back from.
       */}
      {family && worn === family.id && (
        <ParamsPanel
          family={family}
          params={family.read(trayParams(look, tray))}
          color={currentColor}
        />
      )}
    </>
  );
};

import type { JSX } from 'react';

import { PALETTES } from '../model/palettes';
import { useLook } from '../state/lookContext';
import { DraggablePart } from './DraggablePart';
import { customHairParams, equippedIn, trayItems, type TrayDefinition } from './trays';
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

  return (
    <ul className={styles.row}>
      {trayItems(tray, customHairParams(look)).map((item) => (
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
  );
};

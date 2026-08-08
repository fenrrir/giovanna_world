import { useState, type JSX } from 'react';

import { PALETTES } from '../model/palettes';
import { useLook } from '../state/lookContext';
import { ColorTray } from './ColorTray';
import { DraggablePart } from './DraggablePart';
import { ParamsPanel } from './ParamsPanel';
import { ScrollRail } from './ScrollRail';
import { equippedIn, trayItems, trayParams, type TrayDefinition } from './trays';
import type { DragPoint } from './useDrag';
import styles from './controls.module.css';

type PartTrayProps = {
  tray: TrayDefinition;
  /** Where the doll is. Injected because only the layout knows the rectangle. */
  isInsideDropZone: (point: DragPoint) => boolean;
};

/**
 * The pieces available in the open tray, and the axes that shape one of them.
 *
 * Choosing a piece keeps whatever colour that slot already had, so swapping a
 * top does not silently reset the child's colour choice.
 *
 * It returns the two as a fragment rather than nesting them, because a fragment
 * puts no element between them and `App`'s grid: the axes and the pieces land
 * there as two columns of their own. That is what lets the axes retract by
 * simply not being rendered, and the scene take the width back.
 */
export const PartTray = ({ tray, isInsideDropZone }: PartTrayProps): JSX.Element => {
  const { look, dispatch } = useLook();
  const worn = equippedIn(look, tray);
  const currentColor = look.equipped[tray.slot]?.color ?? PALETTES[tray.palette][0];
  const items = trayItems(tray, look);
  const family = tray.shaped;

  /*
   * The axes open when she opens the tray on a shaped piece, or when she taps
   * one — never on a roll of the dice. The randomiser can land on a generated
   * piece now, and axes appearing over a doll she did not ask to edit are an
   * editor she never asked for.
   *
   * The initial value is enough because App keys this component by tray, so
   * opening a tray mounts it afresh while a roll of the dice does not.
   */
  const [shaping, setShaping] = useState(() => family !== undefined && worn === family.id);

  return (
    <>
      {/*
       * Beside the pieces rather than instead of them, and with no open state of
       * its own: the axes are on screen exactly while the piece they shape is
       * the one worn. Picking any other piece puts them away, which is what
       * keeps the game at one level of navigation with nothing to go back from.
       *
       * First, so that the order the child reads the columns in — axes, pieces,
       * trays — is also the order a keyboard walks them.
       */}
      {shaping && family && worn === family.id && (
        <aside className={styles.axes}>
          <ParamsPanel
            family={family}
            params={family.read(trayParams(look, tray))}
            color={currentColor}
          />
        </aside>
      )}

      <div className={styles.column}>
        <ScrollRail>
          {items.map((item) => (
            <li key={item.id}>
              <DraggablePart
                tray={tray}
                item={item}
                color={currentColor}
                worn={item.id === worn}
                onChoose={() => {
                  setShaping(item.shaped === true);
                  dispatch(item.apply(currentColor));
                }}
                isInsideDropZone={isInsideDropZone}
              />
            </li>
          ))}
        </ScrollRail>

        {/* At the foot of the pieces, because they paint whichever one is here. */}
        <ColorTray tray={tray} />
      </div>
    </>
  );
};

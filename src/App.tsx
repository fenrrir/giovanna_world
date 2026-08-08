import { useCallback, useRef, useState, type JSX } from 'react';

import { useTranslation } from './i18n';
import type { TraySlot } from './model/slots';
import { BODY, findPart } from './parts/registry';
import { Doll } from './render/Doll';
import { useLook } from './state/lookContext';
import { ColorTray } from './ui/ColorTray';
import { PartTray } from './ui/PartTray';
import { RandomButton } from './ui/RandomButton';
import { SlotBar } from './ui/SlotBar';
import { trayById } from './ui/trays';
import type { DragPoint } from './ui/useDrag';
import styles from './App.module.css';

/**
 * The dress-up surface.
 *
 * Everything the child needs is on one screen: the doll, the four trays, the
 * pieces in the open tray and the colours. Opening a tray swaps the middle row
 * in place — no modal, no back button (SPEC section 4).
 */
export const App = (): JSX.Element => {
  const { t } = useTranslation();
  const { look } = useLook();
  const [active, setActive] = useState<TraySlot>('hair');
  const tray = trayById(active);
  const stage = useRef<HTMLElement>(null);

  /**
   * SPEC section 13 asks for a generous drop target: the whole stage the doll
   * stands on, not the exact region of the piece. A six-year-old aiming a
   * sleeve at a shoulder would miss every time.
   */
  const isInsideDropZone = useCallback(({ x, y }: DragPoint): boolean => {
    const box = stage.current?.getBoundingClientRect();

    return box !== undefined && x >= box.left && x <= box.right && y >= box.top && y <= box.bottom;
  }, []);

  return (
    <main className={styles.app}>
      <section className={styles.stage} ref={stage}>
        <Doll
          className={styles.doll}
          look={look}
          lookup={findPart}
          body={BODY}
          label={t('doll.label')}
        />
      </section>

      <section className={styles.panel}>
        <div className={styles.top}>
          <SlotBar active={active} onSelect={setActive} />
          <RandomButton />
        </div>
        <div className={styles.parts}>
          <PartTray tray={tray} isInsideDropZone={isInsideDropZone} />
        </div>
        <ColorTray tray={tray} />
      </section>
    </main>
  );
};

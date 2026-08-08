import { useCallback, useRef, useState, type JSX } from 'react';

import { RENDER_ORDER, type Slot, type TraySlot } from './model/slots';
import { ColorTray } from './ui/ColorTray';
import { DraggableDoll } from './ui/DraggableDoll';
import { PartTray } from './ui/PartTray';
import { ZoomSlider } from './ui/ZoomSlider';
import { RandomButton } from './ui/RandomButton';
import { SlotBar } from './ui/SlotBar';
import { DEFAULT_ZOOM, zoomedViewBox } from './lib/zoom';
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
  const [active, setActive] = useState<TraySlot>('hair');
  const tray = trayById(active);
  const stage = useRef<HTMLElement>(null);
  const [zoom, setZoom] = useState(DEFAULT_ZOOM);

  /**
   * SPEC section 13 asks for a generous drop target: the whole stage the doll
   * stands on, not the exact region of the piece. A six-year-old aiming a
   * sleeve at a shoulder would miss every time.
   */
  const isInsideDropZone = useCallback(({ x, y }: DragPoint): boolean => {
    const box = stage.current?.getBoundingClientRect();

    return box !== undefined && x >= box.left && x <= box.right && y >= box.top && y <= box.bottom;
  }, []);

  /**
   * Which layer is under a point. The browser's own hit test answers it, which
   * is why it is injected rather than computed — the doll is SVG, and working
   * out what a finger is on top of is not something to reimplement.
   */
  const slotAt = useCallback(({ x, y }: DragPoint): Slot | null => {
    const painted = document.elementFromPoint(x, y)?.closest('[data-slot]');
    const slot = painted?.getAttribute('data-slot');

    return RENDER_ORDER.find((candidate) => candidate === slot) ?? null;
  }, []);

  return (
    <main className={styles.app}>
      <section className={styles.stage} ref={stage}>
        <DraggableDoll
          className={styles.doll}
          isInsideStage={isInsideDropZone}
          slotAt={slotAt}
          viewBox={zoomedViewBox(zoom)}
        />
        <ZoomSlider zoom={zoom} onChange={setZoom} />
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

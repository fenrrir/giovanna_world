import { useCallback, useRef, useState, type JSX } from 'react';

import { RENDER_ORDER, type Slot } from './model/slots';
import { DraggableDoll } from './ui/DraggableDoll';
import { PartTray } from './ui/PartTray';
import { ZoomSlider } from './ui/ZoomSlider';
import { RandomButton } from './ui/RandomButton';
import { SavedTray } from './ui/SavedTray';
import { SAVED_TRAY, SlotBar, type ActiveTray } from './ui/SlotBar';
import { DEFAULT_ZOOM, zoomedViewBox } from './lib/zoom';
import { trayById } from './ui/trays';
import type { DragPoint } from './ui/useDrag';
import styles from './App.module.css';

/**
 * The dress-up surface.
 *
 * Everything the child needs is on one screen: the doll on her stage, the trays
 * down the right-hand edge, the pieces in the open tray beside them, and the
 * axes of a piece she shapes beside those. Opening a tray swaps a column in
 * place — no modal, no back button (SPEC section 4).
 *
 * The stage is the only column with a size of its own; every rail is as narrow
 * as its own content. A column that is not rendered therefore costs nothing at
 * all, which is what lets the scene take back the width of the axes panel the
 * moment she stops shaping something.
 */
export const App = (): JSX.Element => {
  const [active, setActive] = useState<ActiveTray>('hair');
  /* The album is not a slot: it has no piece to recolour and no layer of its
     own, so the colour row goes away with it. */
  const tray = active === SAVED_TRAY ? null : trayById(active);
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

      {/* Keyed by tray: opening one mounts it afresh, which is how the axes
          panel tells her own tap from a roll of the dice. It puts its own two
          columns straight into this grid. */}
      {tray ? (
        <PartTray key={active} tray={tray} isInsideDropZone={isInsideDropZone} />
      ) : (
        <SavedTray />
      )}

      {/* Last, and outermost: the die sits under the trays because it replaces
          the whole outfit rather than the piece any one tray holds. */}
      <nav className={styles.trays}>
        <SlotBar active={active} onSelect={setActive} />
        <RandomButton />
      </nav>
    </main>
  );
};

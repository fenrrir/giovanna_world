import { useCallback, useRef, useState, type JSX } from 'react';

import { DEFAULT_ZOOM, zoomedViewBox } from '../lib/zoom';
import type { EnvironmentId } from '../model/places';
import { RENDER_ORDER, type Slot } from '../model/slots';
import type { DollIndex } from '../model/world';
import { useWorld } from '../state/worldContext';
import { findEnvironment } from '../world/registry';
import { DraggableDoll } from './DraggableDoll';
import { PartTray } from './PartTray';
import { RandomButton } from './RandomButton';
import { SavedTray } from './SavedTray';
import { SAVED_TRAY, SlotBar, type ActiveTray } from './SlotBar';
import { ZoomSlider } from './ZoomSlider';
import { trayById } from './trays';
import type { DragPoint } from './useDrag';
import styles from '../App.module.css';

type DressViewProps = {
  here: EnvironmentId;
  doll: DollIndex;
};

/**
 * The wardrobe: one doll at her full size, in the room she is standing in.
 *
 * She comes back to full size rather than being dressed where she stands. A
 * doll drawn at a room's scale is too small to drop a hat on, and this way the
 * whole dress-up surface — trays, colours, axes, zoom, the drag that undresses
 * — is the one that was already there. The room behind her is what says where
 * she will be put back.
 *
 * The way out is the room at the head of the tray rail, or tapping her again.
 * Neither is a back button: both are a picture of where she is going.
 */
export const DressView = ({ here, doll }: DressViewProps): JSX.Element => {
  const { world, dispatch } = useWorld();
  const [active, setActive] = useState<ActiveTray>('hair');
  /* The album is not a slot: it has no piece to recolour and no layer of its
     own, so the colour row goes away with it. */
  const tray = active === SAVED_TRAY ? null : trayById(active);
  const stage = useRef<HTMLElement>(null);
  const [zoom, setZoom] = useState(DEFAULT_ZOOM);

  const environment = findEnvironment(here);
  const color = world.colors[here] ?? environment.defaultColor;

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
    <>
      <section className={styles.stage} ref={stage}>
        <DraggableDoll
          className={styles.doll}
          doll={doll}
          environment={environment}
          color={color}
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
        <SlotBar
          active={active}
          onSelect={setActive}
          place={{
            environment,
            color,
            onLeave: () => {
              dispatch({ type: 'dressDoll', doll: null });
            },
          }}
        />
        <RandomButton />
      </nav>
    </>
  );
};

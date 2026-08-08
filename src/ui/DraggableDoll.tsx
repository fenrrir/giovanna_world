import {
  useCallback,
  useMemo,
  useState,
  type JSX,
  type PointerEvent as ReactPointerEvent,
} from 'react';

import { useTranslation } from '../i18n';
import { isPainted, type Slot } from '../model/slots';
import { BODY, findPart } from '../parts/registry';
import { Doll } from '../render/Doll';
import { useLook } from '../state/lookContext';
import { DragGhost } from './DragGhost';
import { trayForSlot } from './trays';
import { useDrag, type DragPoint } from './useDrag';

type DraggableDollProps = {
  className?: string | undefined;
  /** Where the doll's stage is. Only the layout knows the rectangle. */
  isInsideStage: (point: DragPoint) => boolean;
  /** The visible region of the canvas, set by the zoom slider. */
  viewBox?: string | undefined;
  /** Which layer is under a point. Injected because it is a hit test. */
  slotAt: (point: DragPoint) => Slot | null;
};

/**
 * The doll, with a piece removable by dragging it off.
 *
 * There is no other way to undress: every tray swaps one piece for another, so
 * without this a shoe once put on could only ever be exchanged for a different
 * shoe.
 *
 * The same drag hook the trays use, with the zones swapped — here a release
 * *outside* the stage is what completes the gesture. Releasing back on the doll
 * puts the piece down again.
 */
export const DraggableDoll = ({
  className,
  isInsideStage,
  slotAt,
  viewBox,
}: DraggableDollProps): JSX.Element => {
  const { t } = useTranslation();
  const { look, dispatch } = useLook();
  const [grabbed, setGrabbed] = useState<Slot | null>(null);

  const isOutsideStage = useCallback((point: DragPoint) => !isInsideStage(point), [isInsideStage]);

  const { at, handlers } = useDrag({
    onDrop: () => {
      if (grabbed) dispatch({ type: 'removeSlot', slot: grabbed });
      setGrabbed(null);
    },
    onTap: () => {
      setGrabbed(null);
    },
    isInsideDropZone: isOutsideStage,
  });

  const onPointerDown = (event: ReactPointerEvent<HTMLElement>): void => {
    const slot = slotAt({ x: event.clientX, y: event.clientY });

    // A painted slot is the doll rather than something worn on it, and an empty
    // slot has nothing to pull off.
    if (slot === null || isPainted(slot) || !look.equipped[slot]) return;

    setGrabbed(slot);
    handlers.onPointerDown(event);
  };

  const dragged = useMemo(() => {
    if (grabbed === null) return null;

    const worn = look.equipped[grabbed];
    const tray = trayForSlot(grabbed);
    const part = worn && findPart(grabbed, worn.partId);

    return worn && tray && part ? { worn, tray, part } : null;
  }, [grabbed, look]);

  // Handlers sit on the wrapper: pointer events bubble up from the svg, so the
  // renderer keeps its narrow interface.
  return (
    <div
      className={className}
      data-removing={at && grabbed ? grabbed : ''}
      {...handlers}
      onPointerDown={onPointerDown}
    >
      <Doll look={look} lookup={findPart} body={BODY} label={t('doll.label')} viewBox={viewBox} />

      {at && dragged && (
        <DragGhost
          at={at}
          render={dragged.part.render}
          color={dragged.worn.color}
          focus={dragged.tray.focus}
          label={t(dragged.tray.label)}
        />
      )}
    </div>
  );
};

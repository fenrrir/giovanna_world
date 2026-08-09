import { useCallback, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';

/** Movement below this is a tap, not a drag. */
export const DRAG_THRESHOLD_PX = 8;

/** SPEC section 4: nothing here may run longer than 120 ms. */
export const RETURN_MS = 120;

export type DragPoint = { x: number; y: number };

export type Drag = {
  /** Where the pointer is while dragging, or null when idle. */
  at: DragPoint | null;
  /** True while the piece is travelling back after a miss. */
  returning: boolean;
  handlers: {
    onPointerDown: (event: ReactPointerEvent<HTMLElement>) => void;
    onPointerMove: (event: ReactPointerEvent<HTMLElement>) => void;
    onPointerUp: (event: ReactPointerEvent<HTMLElement>) => void;
    onPointerCancel: (event: ReactPointerEvent<HTMLElement>) => void;
  };
};

type DragOptions = {
  /**
   * Called when the piece is released over the drop zone, with where it was
   * let go. Most callers ignore it — a garment lands on the doll wherever it is
   * dropped — but a doll put down in a room stands exactly there.
   */
  onDrop: (point: DragPoint) => void;
  /** Called when the press never became a drag, so it was a tap. */
  onTap: () => void;
  /** Injected, because the zone is a laid-out rectangle the hook cannot know. */
  isInsideDropZone: (point: DragPoint) => boolean;
  returnMs?: number;
};

const distance = (a: DragPoint, b: DragPoint): number => Math.hypot(a.x - b.x, a.y - b.y);

/**
 * Drag a piece from the tray onto the doll, with a tap as the fallback.
 *
 * The pointer is captured on the way down (SPEC section 13), so the piece keeps
 * following the finger even once it has left the button it started on.
 *
 * The piece is applied on release, not on press. Applying on press would make
 * the drag decorative — the piece would already be on the doll before the
 * child had moved it anywhere.
 */
export const useDrag = ({
  onDrop,
  onTap,
  isInsideDropZone,
  returnMs = RETURN_MS,
}: DragOptions): Drag => {
  const [at, setAt] = useState<DragPoint | null>(null);
  const [returning, setReturning] = useState(false);
  const origin = useRef<DragPoint | null>(null);
  const dragging = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const reset = useCallback(() => {
    origin.current = null;
    dragging.current = false;
    setAt(null);
  }, []);

  const onPointerDown = useCallback((event: ReactPointerEvent<HTMLElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    origin.current = { x: event.clientX, y: event.clientY };
    dragging.current = false;
  }, []);

  const onPointerMove = useCallback((event: ReactPointerEvent<HTMLElement>) => {
    const start = origin.current;

    if (!start) return;

    const point = { x: event.clientX, y: event.clientY };

    if (!dragging.current && distance(start, point) < DRAG_THRESHOLD_PX) return;

    dragging.current = true;
    setAt(point);
  }, []);

  const onPointerUp = useCallback(
    (event: ReactPointerEvent<HTMLElement>) => {
      const wasDragging = dragging.current;
      const point = { x: event.clientX, y: event.clientY };

      if (origin.current === null) return;

      reset();

      if (!wasDragging) {
        onTap();
        return;
      }

      if (isInsideDropZone(point)) {
        onDrop(point);
        return;
      }

      // Dropped short of the doll: the piece travels back rather than vanishing.
      setReturning(true);
      timer.current = setTimeout(() => {
        setReturning(false);
      }, returnMs);
    },
    [isInsideDropZone, onDrop, onTap, reset, returnMs],
  );

  const onPointerCancel = useCallback(() => {
    if (timer.current !== undefined) clearTimeout(timer.current);
    setReturning(false);
    reset();
  }, [reset]);

  return {
    at,
    returning,
    handlers: { onPointerDown, onPointerMove, onPointerUp, onPointerCancel },
  };
};

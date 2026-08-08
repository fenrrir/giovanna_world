import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * SPEC section 4: the one control that throws the whole outfit away is confirmed
 * by holding, not by a tap. A six-year-old brushing the screen must not lose
 * what she made.
 */
export const LONG_PRESS_MS = 700;

export type LongPress = {
  /** True while the press is being held, so the control can show it. */
  held: boolean;
  handlers: {
    onPointerDown: () => void;
    onPointerUp: () => void;
    onPointerLeave: () => void;
    onPointerCancel: () => void;
  };
};

/**
 * Fires `onHold` once the pointer has been down for `ms` without being released.
 *
 * Pointer Events only, never Touch Events, so the same code answers a finger
 * and a mouse (SPEC section 13).
 *
 * On a touchscreen the browser captures the pointer to the element that took
 * the press, so sliding a finger off does not raise leave until release — the
 * child has to hold for the full duration, but may wander while doing it.
 * Lifting early always abandons it, which is the guarantee that matters.
 */
export const useLongPress = (onHold: () => void, ms: number = LONG_PRESS_MS): LongPress => {
  const [held, setHeld] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const onHoldRef = useRef(onHold);

  // Kept current in an effect: writing a ref during render is not allowed, and
  // reading a stale callback when the timer fires would be worse.
  useEffect(() => {
    onHoldRef.current = onHold;
  }, [onHold]);

  const cancel = useCallback(() => {
    if (timer.current !== undefined) clearTimeout(timer.current);
    timer.current = undefined;
    setHeld(false);
  }, []);

  const start = useCallback(() => {
    setHeld(true);
    timer.current = setTimeout(() => {
      timer.current = undefined;
      setHeld(false);
      onHoldRef.current();
    }, ms);
  }, [ms]);

  // A press left running past unmount would fire into a dead component.
  useEffect(() => cancel, [cancel]);

  return {
    held,
    handlers: {
      onPointerDown: start,
      onPointerUp: cancel,
      onPointerLeave: cancel,
      onPointerCancel: cancel,
    },
  };
};

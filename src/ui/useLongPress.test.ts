import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { LONG_PRESS_MS, useLongPress } from './useLongPress';

describe('useLongPress', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('does not fire on a tap', () => {
    const onHold = vi.fn();
    const { result } = renderHook(() => useLongPress(onHold));

    act(() => {
      result.current.handlers.onPointerDown();
    });
    act(() => {
      result.current.handlers.onPointerUp();
    });
    act(() => {
      vi.advanceTimersByTime(LONG_PRESS_MS * 2);
    });

    expect(onHold).not.toHaveBeenCalled();
  });

  it('does not fire before the hold is complete', () => {
    const onHold = vi.fn();
    const { result } = renderHook(() => useLongPress(onHold));

    act(() => {
      result.current.handlers.onPointerDown();
    });
    act(() => {
      vi.advanceTimersByTime(LONG_PRESS_MS - 1);
    });

    expect(onHold).not.toHaveBeenCalled();
  });

  it('fires once the hold is complete', () => {
    const onHold = vi.fn();
    const { result } = renderHook(() => useLongPress(onHold));

    act(() => {
      result.current.handlers.onPointerDown();
    });
    act(() => {
      vi.advanceTimersByTime(LONG_PRESS_MS);
    });

    expect(onHold).toHaveBeenCalledOnce();
  });

  it('reports that the press is being held, so the control can show it', () => {
    const { result } = renderHook(() => useLongPress(vi.fn()));

    expect(result.current.held).toBe(false);

    act(() => {
      result.current.handlers.onPointerDown();
    });

    expect(result.current.held).toBe(true);

    act(() => {
      vi.advanceTimersByTime(LONG_PRESS_MS);
    });

    expect(result.current.held).toBe(false);
  });

  it.each(['onPointerUp', 'onPointerLeave', 'onPointerCancel'] as const)(
    'abandons the press on %s',
    (event) => {
      const onHold = vi.fn();
      const { result } = renderHook(() => useLongPress(onHold));

      act(() => {
        result.current.handlers.onPointerDown();
      });
      act(() => {
        result.current.handlers[event]();
      });

      expect(result.current.held).toBe(false);

      act(() => {
        vi.advanceTimersByTime(LONG_PRESS_MS * 2);
      });

      expect(onHold).not.toHaveBeenCalled();
    },
  );

  it('honours a shorter hold when one is given', () => {
    const onHold = vi.fn();
    const { result } = renderHook(() => useLongPress(onHold, 100));

    act(() => {
      result.current.handlers.onPointerDown();
    });
    act(() => {
      vi.advanceTimersByTime(100);
    });

    expect(onHold).toHaveBeenCalledOnce();
  });

  it('never fires into a component that has gone away', () => {
    const onHold = vi.fn();
    const { result, unmount } = renderHook(() => useLongPress(onHold));

    act(() => {
      result.current.handlers.onPointerDown();
    });
    unmount();
    act(() => {
      vi.advanceTimersByTime(LONG_PRESS_MS * 2);
    });

    expect(onHold).not.toHaveBeenCalled();
  });
});

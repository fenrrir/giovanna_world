import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { DRAG_THRESHOLD_PX, RETURN_MS, useDrag, type DragPoint } from './useDrag';

/** The drop zone for these tests: everything at x >= 500. */
const isInsideDropZone = (point: DragPoint): boolean => point.x >= 500;

const pointerEvent = (x: number, y: number) =>
  ({
    clientX: x,
    clientY: y,
    pointerId: 1,
    currentTarget: {
      setPointerCapture: vi.fn(),
    },
  }) as unknown as React.PointerEvent<HTMLElement>;

const setup = (overrides: Partial<Parameters<typeof useDrag>[0]> = {}) => {
  const onDrop = vi.fn();
  const onTap = vi.fn();
  const hook = renderHook(() => useDrag({ onDrop, onTap, isInsideDropZone, ...overrides }));

  const down = (x: number, y: number) => {
    act(() => {
      hook.result.current.handlers.onPointerDown(pointerEvent(x, y));
    });
  };
  const move = (x: number, y: number) => {
    act(() => {
      hook.result.current.handlers.onPointerMove(pointerEvent(x, y));
    });
  };
  const up = (x: number, y: number) => {
    act(() => {
      hook.result.current.handlers.onPointerUp(pointerEvent(x, y));
    });
  };

  return { ...hook, onDrop, onTap, down, move, up };
};

describe('useDrag', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('captures the pointer so the piece follows the finger off the button', () => {
    const { result } = setup();
    const setPointerCapture = vi.fn();
    const event = {
      clientX: 10,
      clientY: 10,
      pointerId: 1,
      currentTarget: { setPointerCapture },
    } as unknown as React.PointerEvent<HTMLElement>;

    act(() => {
      result.current.handlers.onPointerDown(event);
    });

    expect(setPointerCapture).toHaveBeenCalledWith(1);
  });

  it('treats a press and release with no movement as a tap', () => {
    const { onTap, onDrop, down, up } = setup();

    down(10, 10);
    up(10, 10);

    expect(onTap).toHaveBeenCalledOnce();
    expect(onDrop).not.toHaveBeenCalled();
  });

  it('still counts as a tap when the finger barely moves', () => {
    const { onTap, down, move, up } = setup();

    down(10, 10);
    move(10 + DRAG_THRESHOLD_PX - 1, 10);
    up(10 + DRAG_THRESHOLD_PX - 1, 10);

    expect(onTap).toHaveBeenCalledOnce();
  });

  it('reports nothing while the press is still a tap', () => {
    const { result, down, move } = setup();

    down(10, 10);
    move(12, 10);

    expect(result.current.at).toBeNull();
  });

  it('starts dragging once the finger passes the threshold', () => {
    const { result, down, move } = setup();

    down(10, 10);
    move(10 + DRAG_THRESHOLD_PX, 10);

    expect(result.current.at).toStrictEqual({ x: 10 + DRAG_THRESHOLD_PX, y: 10 });
  });

  it('follows the finger once dragging has begun', () => {
    const { result, down, move } = setup();

    down(10, 10);
    move(100, 100);
    move(140, 160);

    expect(result.current.at).toStrictEqual({ x: 140, y: 160 });
  });

  it('drops the piece when released over the zone', () => {
    const { onDrop, onTap, down, move, up } = setup();

    down(10, 10);
    move(520, 200);
    up(520, 200);

    expect(onDrop).toHaveBeenCalledOnce();
    expect(onTap).not.toHaveBeenCalled();
  });

  it('sends the piece back when released short of the zone', () => {
    const { result, onDrop, down, move, up } = setup();

    down(10, 10);
    move(200, 200);
    up(200, 200);

    expect(onDrop).not.toHaveBeenCalled();
    expect(result.current.returning).toBe(true);

    act(() => {
      vi.advanceTimersByTime(RETURN_MS);
    });

    expect(result.current.returning).toBe(false);
  });

  it('stops following the finger the moment it is released', () => {
    const { result, down, move, up } = setup();

    down(10, 10);
    move(520, 200);
    up(520, 200);

    expect(result.current.at).toBeNull();
  });

  it('ignores a release that never had a press', () => {
    const { onTap, onDrop, up } = setup();

    up(10, 10);

    expect(onTap).not.toHaveBeenCalled();
    expect(onDrop).not.toHaveBeenCalled();
  });

  it('ignores movement that never had a press', () => {
    const { result, move } = setup();

    move(300, 300);

    expect(result.current.at).toBeNull();
  });

  it('abandons everything when the browser cancels the pointer', () => {
    const { result, onDrop, down, move } = setup();

    down(10, 10);
    move(200, 200);

    act(() => {
      result.current.handlers.onPointerCancel(pointerEvent(200, 200));
    });

    expect(result.current.at).toBeNull();
    expect(result.current.returning).toBe(false);
    expect(onDrop).not.toHaveBeenCalled();
  });

  it('cuts a return short if the pointer is cancelled mid-flight', () => {
    const { result, down, move, up } = setup();

    down(10, 10);
    move(200, 200);
    up(200, 200);

    expect(result.current.returning).toBe(true);

    act(() => {
      result.current.handlers.onPointerCancel(pointerEvent(200, 200));
    });

    expect(result.current.returning).toBe(false);
  });

  it('honours a shorter return when one is given', () => {
    const { result, down, move, up } = setup({ returnMs: 40 });

    down(10, 10);
    move(200, 200);
    up(200, 200);

    act(() => {
      vi.advanceTimersByTime(40);
    });

    expect(result.current.returning).toBe(false);
  });

  it('keeps the return inside the 120 ms the spec allows', () => {
    expect(RETURN_MS).toBeLessThanOrEqual(120);
  });
});

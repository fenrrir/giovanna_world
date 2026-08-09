import { act, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { App } from '../../src/App';
import { PAINTED_SLOTS } from '../../src/model/slots';
import { I18nProvider, ptBR } from '../../src/i18n';
import { WorldProvider } from '../../src/state/WorldProvider';
import { DRESSING } from '../doubles';
import { DRAG_THRESHOLD_PX, RETURN_MS } from '../../src/ui/useDrag';

/**
 * jsdom lays nothing out, so every rectangle is zero. The drop zone is the
 * doll's stage, which the App measures with getBoundingClientRect — stubbed
 * here to a known rectangle so a drop can be aimed at it.
 */
const STAGE = { left: 0, top: 0, right: 400, bottom: 800 };

const ZERO_RECT = { left: 0, top: 0, right: 0, bottom: 0 };

const rect = (box: typeof STAGE): DOMRect => ({
  ...box,
  width: box.right - box.left,
  height: box.bottom - box.top,
  x: box.left,
  y: box.top,
  toJSON: () => ({}),
});

const stubStageRect = (): void => {
  // Everything else keeps jsdom's own answer, which is a zero rectangle.
  vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(function (this: Element) {
    const isStage = this.tagName === 'SECTION' && this.querySelector('svg[role="img"]') !== null;

    return rect(isStage ? STAGE : ZERO_RECT);
  });
};

const mount = () =>
  render(
    <I18nProvider>
      <WorldProvider world={DRESSING}>
        <App />
      </WorldProvider>
    </I18nProvider>,
  );

const firstPart = (): HTMLElement =>
  screen.getAllByRole('button', { name: /^Vestir esta peça/ })[0]!;

const doll = (): SVGSVGElement =>
  screen.getByRole('img', { name: ptBR['doll.label'] }) as unknown as SVGSVGElement;

const paintedSlots = (): string[] =>
  [...doll().querySelectorAll('g[data-slot]')].map(
    (group) => group.getAttribute('data-slot') ?? '',
  );

/** Only what she is wearing: the body and its painted-on face are always there. */
const PAINTED: readonly string[] = PAINTED_SLOTS;
const worn = (): string[] => paintedSlots().filter((slot) => !PAINTED.includes(slot));

const pointer = (type: string, x: number, y: number): PointerEvent =>
  new PointerEvent(type, { bubbles: true, clientX: x, clientY: y, pointerId: 1, isPrimary: true });

const drag = (from: HTMLElement, path: [number, number][]): void => {
  const [start, ...rest] = path;

  act(() => {
    from.dispatchEvent(pointer('pointerdown', start![0], start![1]));
  });

  for (const [x, y] of rest) {
    act(() => {
      from.dispatchEvent(pointer('pointermove', x, y));
    });
  }
};

const release = (from: HTMLElement, x: number, y: number): void => {
  act(() => {
    from.dispatchEvent(pointer('pointerup', x, y));
  });
};

describe('dragging a piece onto the doll', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    localStorage.clear();
    stubStageRect();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('dresses the doll when the piece is released over the stage', () => {
    mount();
    const part = firstPart();

    expect(worn()).toStrictEqual([]);

    drag(part, [
      [700, 400],
      [500, 400],
      [200, 400],
    ]);
    release(part, 200, 400);

    expect(paintedSlots()).toContain('hairFront');
  });

  it('anywhere on the stage will do, not just the exact spot', () => {
    mount();
    const part = firstPart();

    // The far bottom corner of the stage, nowhere near the head.
    drag(part, [
      [700, 400],
      [20, 780],
    ]);
    release(part, 20, 780);

    expect(paintedSlots()).toContain('hairFront');
  });

  it('leaves the doll alone when the piece is dropped short', () => {
    mount();
    const part = firstPart();

    drag(part, [
      [700, 400],
      [650, 400],
    ]);
    release(part, 650, 400);

    expect(worn()).toStrictEqual([]);
  });

  it('sends the piece back to the tray after a miss', () => {
    mount();
    const part = firstPart();

    drag(part, [
      [700, 400],
      [650, 400],
    ]);
    release(part, 650, 400);

    expect(part.className).toContain('returning');

    act(() => {
      vi.advanceTimersByTime(RETURN_MS);
    });

    expect(part.className).not.toContain('returning');
  });

  it('still dresses the doll on a plain tap', () => {
    mount();
    const part = firstPart();

    drag(part, [[700, 400]]);
    release(part, 700, 400);

    expect(paintedSlots()).toContain('hairFront');
  });

  it('treats a wobble under the threshold as a tap, not a miss', () => {
    mount();
    const part = firstPart();

    drag(part, [
      [700, 400],
      [700 + DRAG_THRESHOLD_PX - 1, 400],
    ]);
    release(part, 700 + DRAG_THRESHOLD_PX - 1, 400);

    expect(paintedSlots()).toContain('hairFront');
  });

  it('shows the piece under the finger while it travels', () => {
    const { container } = mount();
    const part = firstPart();

    drag(part, [
      [700, 400],
      [500, 400],
    ]);

    expect(part).toHaveAttribute('data-dragging', 'true');
    expect(document.body.querySelectorAll('[aria-hidden="true"]').length).toBeGreaterThan(0);

    release(part, 200, 400);

    expect(part).toHaveAttribute('data-dragging', 'false');
    expect(container.textContent.trim()).toBe('');
  });
});

import { act, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { App } from '../../src/App';
import { I18nProvider, ptBR } from '../../src/i18n';
import { LookProvider } from '../../src/state/LookProvider';

/**
 * jsdom lays nothing out and implements no hit testing, so both are stubbed:
 * the stage gets a known rectangle, and elementFromPoint answers with whichever
 * layer the test says the finger is on.
 */
const STAGE = { left: 0, top: 0, right: 400, bottom: 800 };

const rect = (box: typeof STAGE): DOMRect => ({
  ...box,
  width: box.right - box.left,
  height: box.bottom - box.top,
  x: box.left,
  y: box.top,
  toJSON: () => ({}),
});

const stubLayout = (): void => {
  vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(function (this: Element) {
    const isStage = this.tagName === 'SECTION' && this.querySelector('svg[role="img"]') !== null;

    return rect(isStage ? STAGE : { left: 0, top: 0, right: 0, bottom: 0 });
  });
};

/** Points the hit test at a given painted layer, or at nothing. */
const pointAt = (slot: string | null): void => {
  vi.spyOn(document, 'elementFromPoint').mockImplementation(() =>
    slot === null ? null : document.querySelector(`g[data-slot="${slot}"] *`),
  );
};

const mount = () =>
  render(
    <I18nProvider>
      <LookProvider>
        <App />
      </LookProvider>
    </I18nProvider>,
  );

const doll = (): SVGSVGElement =>
  screen.getByRole('img', { name: ptBR['doll.label'] }) as unknown as SVGSVGElement;

const paintedSlots = (): string[] =>
  [...doll().querySelectorAll('g[data-slot]')].map(
    (group) => group.getAttribute('data-slot') ?? '',
  );

const pointer = (type: string, x: number, y: number): PointerEvent =>
  new PointerEvent(type, { bubbles: true, clientX: x, clientY: y, pointerId: 1, isPrimary: true });

const stage = (): HTMLElement => doll().closest('div')!;

/** Drags from inside the stage to a release point. */
const dragOff = (to: [number, number]): void => {
  const from = stage();

  act(() => {
    from.dispatchEvent(pointer('pointerdown', 200, 400));
  });
  act(() => {
    from.dispatchEvent(pointer('pointermove', to[0], to[1]));
  });
  act(() => {
    from.dispatchEvent(pointer('pointerup', to[0], to[1]));
  });
};

const dressUp = async (tray: keyof typeof ptBR): Promise<void> => {
  const trayButton = screen.getByRole('button', {
    name: ptBR['tray.open'].replace('{tray}', ptBR[tray]),
  });

  act(() => {
    trayButton.dispatchEvent(pointer('pointerdown', 700, 100));
  });
  act(() => {
    trayButton.dispatchEvent(pointer('pointerup', 700, 100));
  });

  const part = screen.getAllByRole('button', { name: /^Vestir esta peça/ })[0]!;

  act(() => {
    part.dispatchEvent(pointer('pointerdown', 700, 300));
  });
  act(() => {
    part.dispatchEvent(pointer('pointerup', 700, 300));
  });

  await Promise.resolve();
};

describe('taking a piece off', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    localStorage.clear();
    stubLayout();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('removes the piece when it is pulled off the stage', async () => {
    mount();
    await dressUp('tray.top');

    expect(paintedSlots()).toContain('top');

    pointAt('top');
    dragOff([900, 400]);

    expect(paintedSlots()).not.toContain('top');
  });

  it('keeps the piece when it is let go back on the doll', async () => {
    mount();
    await dressUp('tray.top');

    pointAt('top');
    dragOff([100, 600]);

    expect(paintedSlots()).toContain('top');
  });

  it('takes the whole hairstyle off, both halves at once', async () => {
    mount();
    await dressUp('tray.hair');

    expect(paintedSlots()).toEqual(expect.arrayContaining(['hairBack', 'hairFront']));

    pointAt('hairFront');
    dragOff([900, 400]);

    expect(paintedSlots()).toStrictEqual(['body']);
  });

  it('keeps everything on when the doll is simply tapped', async () => {
    mount();
    await dressUp('tray.top');

    pointAt('top');

    const from = stage();

    act(() => {
      from.dispatchEvent(pointer('pointerdown', 200, 400));
    });
    act(() => {
      from.dispatchEvent(pointer('pointerup', 200, 400));
    });

    expect(paintedSlots()).toContain('top');
  });

  it('takes the hair off when pulled by the length behind the shoulders', async () => {
    mount();
    await dressUp('tray.hair');

    pointAt('hairBack');
    dragOff([900, 400]);

    expect(paintedSlots()).toStrictEqual(['body']);
  });

  it('never lets the body be pulled off', async () => {
    mount();
    await dressUp('tray.top');

    pointAt('body');
    dragOff([900, 400]);

    expect(paintedSlots()).toContain('body');
    expect(paintedSlots()).toContain('top');
  });

  it('does nothing when the finger starts on no layer at all', async () => {
    mount();
    await dressUp('tray.top');

    pointAt(null);
    dragOff([900, 400]);

    expect(paintedSlots()).toContain('top');
  });

  it('leaves the rest of the outfit alone', async () => {
    mount();
    await dressUp('tray.top');
    await dressUp('tray.shoes');

    pointAt('top');
    dragOff([900, 400]);

    expect(paintedSlots()).not.toContain('top');
    expect(paintedSlots()).toContain('shoes');
  });

  it('adds no words to the interface', async () => {
    const { container } = mount();
    await dressUp('tray.top');

    pointAt('top');
    dragOff([900, 400]);

    expect(container.textContent.trim()).toBe('');
  });
});

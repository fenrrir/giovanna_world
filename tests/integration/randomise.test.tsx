import { act, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { App } from '../../src/App';
import { I18nProvider, ptBR } from '../../src/i18n';
import { CURRENT_LOOK_KEY } from '../../src/lib/storage';
import type { Look } from '../../src/model/types';
import { AUTOSAVE_DELAY_MS, LookProvider } from '../../src/state/LookProvider';
import { LONG_PRESS_MS } from '../../src/ui/useLongPress';

const mount = () => {
  const view = render(
    <I18nProvider>
      <LookProvider>
        <App />
      </LookProvider>
    </I18nProvider>,
  );

  return { ...view, button: screen.getByRole('button', { name: ptBR['look.randomise'] }) };
};

const doll = (): SVGSVGElement =>
  screen.getByRole('img', { name: ptBR['doll.label'] }) as unknown as SVGSVGElement;

const paintedSlots = (): string[] =>
  [...doll().querySelectorAll('g[data-slot]')].map(
    (group) => group.getAttribute('data-slot') ?? '',
  );

const press = (button: HTMLElement, ms: number): void => {
  act(() => {
    button.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
  });
  act(() => {
    vi.advanceTimersByTime(ms);
  });
};

const release = (button: HTMLElement): void => {
  act(() => {
    button.dispatchEvent(new PointerEvent('pointerup', { bubbles: true }));
  });
};

describe('randomising the outfit', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    localStorage.clear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('leaves the doll undressed on a tap', () => {
    const { button } = mount();

    press(button, 50);
    release(button);
    act(() => {
      vi.advanceTimersByTime(LONG_PRESS_MS * 2);
    });

    expect(paintedSlots()).toStrictEqual(['body']);
  });

  /*
   * Asserted against the stored look rather than the painted layers. The
   * randomiser picks for real, and if it lands on the polka-dot dress that
   * declares `hides: ['bottom']` the bottom layer is correctly absent from the
   * render — so a fixed list of painted slots is flaky by construction.
   */
  it('fills every tray once the press is held', () => {
    const { button } = mount();

    press(button, LONG_PRESS_MS);
    act(() => {
      vi.advanceTimersByTime(AUTOSAVE_DELAY_MS);
    });

    const saved = JSON.parse(localStorage.getItem(CURRENT_LOOK_KEY) ?? 'null') as Look | null;

    expect(Object.keys(saved?.equipped ?? {}).sort()).toStrictEqual([
      'bottom',
      'hairBack',
      'hairFront',
      'shoes',
      'top',
    ]);
  });

  it('puts the new outfit on the doll', () => {
    const { button } = mount();

    expect(paintedSlots()).toStrictEqual(['body']);

    press(button, LONG_PRESS_MS);

    // The bottom may be hidden by a dress; everything else is always painted.
    expect(paintedSlots()).toEqual(
      expect.arrayContaining(['hairBack', 'body', 'shoes', 'top', 'hairFront']),
    );
  });

  it('shows the child that the hold is registering', () => {
    const { button } = mount();

    expect(button).toHaveAttribute('data-held', 'false');

    press(button, 100);

    expect(button).toHaveAttribute('data-held', 'true');

    release(button);

    expect(button).toHaveAttribute('data-held', 'false');
  });

  it('abandons the press if the pointer leaves the button', () => {
    const { button } = mount();

    press(button, 100);
    act(() => {
      // React derives onPointerLeave from pointerout; pointerleave does not bubble.
      button.dispatchEvent(
        new PointerEvent('pointerout', { bubbles: true, relatedTarget: document.body }),
      );
    });
    act(() => {
      vi.advanceTimersByTime(LONG_PRESS_MS * 2);
    });

    expect(paintedSlots()).toStrictEqual(['body']);
  });

  it('autosaves the outfit it produced', () => {
    const { button } = mount();

    press(button, LONG_PRESS_MS);
    act(() => {
      vi.advanceTimersByTime(AUTOSAVE_DELAY_MS);
    });

    const saved = JSON.parse(localStorage.getItem(CURRENT_LOOK_KEY) ?? 'null') as Look | null;

    expect(saved?.equipped.top).toBeDefined();
    expect(saved?.equipped.shoes).toBeDefined();
  });

  it('adds no words to the interface', () => {
    const { container, button } = mount();

    press(button, LONG_PRESS_MS);

    expect(container.textContent.trim()).toBe('');
    expect(button.getAttribute('aria-label')).toBe(ptBR['look.randomise']);
  });
});

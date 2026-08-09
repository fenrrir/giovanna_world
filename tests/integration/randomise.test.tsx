import { act, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { App } from '../../src/App';
import { PAINTED_SLOTS } from '../../src/model/slots';
import { I18nProvider, ptBR } from '../../src/i18n';
import { CURRENT_WORLD_KEY } from '../../src/lib/storage';
import type { Look } from '../../src/model/types';
import type { World } from '../../src/model/world';
import { AUTOSAVE_DELAY_MS, WorldProvider } from '../../src/state/WorldProvider';
import { DRESSING } from '../doubles';
import { DEFAULT_LOOK } from '../../src/model/defaults';
import { RANDOM_TRAYS } from '../../src/ui/trays';
import { LONG_PRESS_MS } from '../../src/ui/useLongPress';

const mount = () => {
  const view = render(
    <I18nProvider>
      <WorldProvider world={DRESSING}>
        <App />
      </WorldProvider>
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

/** Only what she is wearing: the body and its painted-on face are always there. */
const PAINTED: readonly string[] = PAINTED_SLOTS;
const worn = (): string[] => paintedSlots().filter((slot) => !PAINTED.includes(slot));

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

/** The doll she is dressing, as the autosave wrote her down. */
const dressedDoll = (): Look | null => {
  const raw = localStorage.getItem(CURRENT_WORLD_KEY);

  return raw === null ? null : (JSON.parse(raw) as World).dolls[0];
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

    expect(worn()).toStrictEqual([]);
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

    const saved = dressedDoll();

    /*
     * The outfit and the face, derived rather than listed so a tray added later
     * is covered here instead of quietly escaping. hairBack joins them because
     * the one hair tray writes into both hair slots; the face because it is
     * painted on and the dice never touch it.
     *
     * The optional trays are a real coin flip, so they are asserted as "may or
     * may not" rather than pinned — a fixed list would be flaky by construction.
     */
    const always = [
      'hairBack',
      ...RANDOM_TRAYS.filter((tray) => tray.randomised === 'always').map((tray) => tray.slot),
      ...Object.keys(DEFAULT_LOOK.equipped),
    ].sort();

    const optional = RANDOM_TRAYS.filter((tray) => tray.randomised === 'sometimes').map(
      (tray) => tray.slot,
    );

    const worn = Object.keys(saved?.equipped ?? {});

    expect(worn.filter((slot) => !optional.includes(slot as never)).sort()).toStrictEqual(always);
  });

  it('puts the new outfit on the doll', () => {
    const { button } = mount();

    expect(worn()).toStrictEqual([]);

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

    expect(worn()).toStrictEqual([]);
  });

  it('autosaves the outfit it produced', () => {
    const { button } = mount();

    press(button, LONG_PRESS_MS);
    act(() => {
      vi.advanceTimersByTime(AUTOSAVE_DELAY_MS);
    });

    const saved = dressedDoll();

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

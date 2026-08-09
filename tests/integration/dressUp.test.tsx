import { act, fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { App } from '../../src/App';
import { PAINTED_SLOTS } from '../../src/model/slots';
import { I18nProvider, ptBR } from '../../src/i18n';
import { CURRENT_WORLD_KEY } from '../../src/lib/storage';
import type { Look } from '../../src/model/types';
import type { World } from '../../src/model/world';
import { AUTOSAVE_DELAY_MS, WorldProvider } from '../../src/state/WorldProvider';
import { DRESSING } from '../doubles';

const fakeStorage = (): Storage => {
  const entries = new Map<string, string>();

  return {
    get length() {
      return entries.size;
    },
    clear: () => {
      entries.clear();
    },
    getItem: (key) => entries.get(key) ?? null,
    key: (index) => [...entries.keys()][index] ?? null,
    removeItem: (key) => {
      entries.delete(key);
    },
    setItem: (key, value) => {
      entries.set(key, value);
    },
  };
};

const mount = (storage: Storage = fakeStorage()) => {
  const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
  const view = render(
    <I18nProvider>
      <WorldProvider world={DRESSING} storage={storage}>
        <App />
      </WorldProvider>
    </I18nProvider>,
  );

  return { ...view, user, storage };
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

/** The tray buttons in the top bar, one per tray. */
const trayButton = (tray: keyof typeof ptBR): HTMLElement =>
  screen.getByRole('button', {
    name: ptBR['tray.open'].replace('{tray}', ptBR[tray]),
  });

/** The free picker for whatever is worn in the open tray. */
const colorPicker = (): HTMLElement => screen.getByLabelText(ptBR['color.pick']);

const partButtons = (): HTMLElement[] =>
  screen.getAllByRole('button', { name: /^Vestir esta peça/ });

/** The doll she is dressing, as the autosave wrote her down. */
const storedLook = (storage: Storage): Look | null => {
  const raw = storage.getItem(CURRENT_WORLD_KEY);

  return raw === null ? null : (JSON.parse(raw) as World).dolls[0];
};

describe('dressing the doll', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('starts with just the body on the canvas', () => {
    mount();

    expect(doll().getAttribute('viewBox')).toBe('0 0 680 540');
    expect(worn()).toStrictEqual([]);
  });

  it('puts on a hairstyle, filling both hair slots from one tap', async () => {
    const { user } = mount();

    await user.click(trayButton('tray.hair'));
    await user.click(partButtons()[0]!);

    expect(paintedSlots()).toStrictEqual([
      'hairBack',
      'body',
      'blush',
      'brows',
      'lips',
      'hairFront',
    ]);
  });

  it('recolours the hairstyle, keeping both halves in step', async () => {
    const { user, storage } = mount();

    await user.click(trayButton('tray.hair'));
    await user.click(partButtons()[0]!);

    fireEvent.change(colorPicker(), { target: { value: '#111111' } });

    act(() => {
      vi.advanceTimersByTime(AUTOSAVE_DELAY_MS);
    });

    const saved = storedLook(storage);

    expect(saved?.equipped.hairBack?.color).toBe(saved?.equipped.hairFront?.color);
    expect(saved?.equipped.hairFront?.color).toBe('#111111');
  });

  it('puts on a top, painted above the body', async () => {
    const { user } = mount();

    await user.click(trayButton('tray.top'));
    await user.click(partButtons()[0]!);

    expect(paintedSlots()).toStrictEqual(['body', 'blush', 'brows', 'lips', 'top']);
  });

  it('dresses the doll from every tray', async () => {
    const { user } = mount();

    for (const tray of ['tray.hair', 'tray.top', 'tray.bottom', 'tray.shoes'] as const) {
      await user.click(trayButton(tray));
      await user.click(partButtons()[0]!);
    }

    expect(paintedSlots()).toStrictEqual([
      'hairBack',
      'body',
      'blush',
      'brows',
      'lips',
      'shoes',
      'bottom',
      'top',
      'hairFront',
    ]);
  });

  it('changes the skin tone without touching the clothes', async () => {
    const { user } = mount();

    await user.click(trayButton('tray.top'));
    await user.click(partButtons()[0]!);

    const before = doll().querySelector('g[data-slot="top"] path')?.getAttribute('fill');

    fireEvent.change(screen.getByLabelText(ptBR['skin.pick']), { target: { value: '#8a5a38' } });

    expect(doll().querySelector('g[data-slot="top"] path')?.getAttribute('fill')).toBe(before);
  });

  it('offers no garment colours until something is worn there', async () => {
    const { user } = mount();

    await user.click(trayButton('tray.shoes'));

    expect(screen.queryByLabelText(ptBR['color.pick'])).toBeNull();

    await user.click(partButtons()[0]!);

    expect(colorPicker()).toBeInTheDocument();
  });

  it('keeps the chosen colour when swapping a piece in the same tray', async () => {
    const { user, storage } = mount();

    await user.click(trayButton('tray.top'));
    await user.click(partButtons()[0]!);

    fireEvent.change(colorPicker(), { target: { value: '#378add' } });
    await user.click(partButtons()[0]!);

    act(() => {
      vi.advanceTimersByTime(AUTOSAVE_DELAY_MS);
    });

    expect(storedLook(storage)?.equipped.top?.color).toBe('#378add');
  });

  it('autosaves the assembled look after the debounce', async () => {
    const { user, storage } = mount();

    await user.click(trayButton('tray.top'));
    await user.click(partButtons()[0]!);

    act(() => {
      vi.advanceTimersByTime(AUTOSAVE_DELAY_MS);
    });

    expect(storedLook(storage)?.equipped.top?.partId).toBe('top.t-shirt');
  });

  it('marks the open tray and the worn piece as pressed', async () => {
    const { user } = mount();

    await user.click(trayButton('tray.top'));

    expect(trayButton('tray.top')).toHaveAttribute('aria-pressed', 'true');
    expect(trayButton('tray.hair')).toHaveAttribute('aria-pressed', 'false');

    await user.click(partButtons()[0]!);

    expect(partButtons()[0]).toHaveAttribute('aria-pressed', 'true');
  });
});

describe('the interface itself', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  /** SPEC section 17: not a single word in the game's interface. */
  it('shows the child no words at all', async () => {
    const { user, container } = mount();

    for (const tray of ['tray.hair', 'tray.top', 'tray.bottom', 'tray.shoes'] as const) {
      await user.click(trayButton(tray));
      await user.click(partButtons()[0]!);
    }

    expect(container.textContent.trim()).toBe('');
  });

  it('names every control for assistive technology instead', () => {
    const { container } = mount();

    for (const button of container.querySelectorAll('button')) {
      expect(button.getAttribute('aria-label')?.trim()).toBeTruthy();
      expect(button.textContent.trim()).toBe('');
    }
  });

  it('reaches every control by keyboard', async () => {
    const { user } = mount();

    // The columns run stage, pieces, trays from left to right, and the keyboard
    // walks them in that order: the zoom slider under the doll, then the pieces
    // of the open tray, then the trays themselves out at the edge.
    await user.tab();

    expect(document.activeElement).toBe(screen.getByRole('slider', { name: ptBR['zoom.label'] }));

    await user.tab();

    expect(document.activeElement).toBe(partButtons()[0]);
  });

  it('reaches the trays out at the edge, after the pieces', async () => {
    const { user } = mount();

    const [stage, pieces] = [...screen.getByRole('main').children];
    const inside = (): boolean =>
      [stage, pieces].some((column) => column?.contains(document.activeElement) === true);

    // Every control of the stage and of the piece column comes first, however
    // many pieces the open tray happens to hold. Bounded so a tab order that
    // never leaves them fails here rather than hanging.
    for (let step = 0; step < 20 && (step === 0 || inside()); step += 1) await user.tab();

    /* The head of the tray rail is the room she is standing in — the way back
       out of the wardrobe, and the first thing a keyboard reaches after the
       stage and the pieces. */
    expect(document.activeElement).toBe(screen.getByRole('button', { name: ptBR['place.leave'] }));
  });

  it('chooses a piece from the keyboard as well as by tap', async () => {
    const { user } = mount();

    await user.click(trayButton('tray.top'));
    const first = partButtons()[0]!;
    first.focus();
    await user.keyboard('{Enter}');

    expect(paintedSlots()).toContain('top');
  });

  it('opens a tray from the keyboard too', async () => {
    const { user } = mount();

    trayButton('tray.shoes').focus();
    await user.keyboard('{Enter}');

    expect(trayButton('tray.shoes')).toHaveAttribute('aria-pressed', 'true');
  });

  it("puts the colour picker in the keyboard's reach too", async () => {
    const { user } = mount();

    await user.click(trayButton('tray.top'));
    await user.click(partButtons()[0]!);

    colorPicker().focus();

    // Opening the picker from there is the platform's job, not this app's.
    expect(document.activeElement).toBe(colorPicker());
  });

  it('keeps the doll and the trays on one screen, with no dialog', () => {
    const { container } = mount();

    expect(within(container).queryByRole('dialog')).toBeNull();
    expect(doll()).toBeInTheDocument();
    expect(partButtons().length).toBeGreaterThan(0);
  });
});

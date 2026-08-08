import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { App } from '../../src/App';
import { I18nProvider, ptBR } from '../../src/i18n';
import { CURRENT_LOOK_KEY } from '../../src/lib/storage';
import type { Look } from '../../src/model/types';
import { AUTOSAVE_DELAY_MS, LookProvider } from '../../src/state/LookProvider';

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
      <LookProvider storage={storage}>
        <App />
      </LookProvider>
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

/** The tray buttons in the top bar, one per tray. */
const trayButton = (tray: keyof typeof ptBR): HTMLElement =>
  screen.getByRole('button', {
    name: ptBR['tray.open'].replace('{tray}', ptBR[tray]),
  });

const partButtons = (): HTMLElement[] =>
  screen.getAllByRole('button', { name: /^Vestir esta peça/ });

const storedLook = (storage: Storage): Look | null => {
  const raw = storage.getItem(CURRENT_LOOK_KEY);

  return raw === null ? null : (JSON.parse(raw) as Look);
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
    expect(paintedSlots()).toStrictEqual(['body']);
  });

  it('puts on a hairstyle, filling both hair slots from one tap', async () => {
    const { user } = mount();

    await user.click(trayButton('tray.hair'));
    await user.click(partButtons()[0]!);

    expect(paintedSlots()).toStrictEqual(['hairBack', 'body', 'hairFront']);
  });

  it('recolours the hairstyle, keeping both halves in step', async () => {
    const { user, storage } = mount();

    await user.click(trayButton('tray.hair'));
    await user.click(partButtons()[0]!);

    const swatches = screen.getAllByRole('button', { name: ptBR['color.choose'] });
    await user.click(swatches[1]!);

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

    expect(paintedSlots()).toStrictEqual(['body', 'top']);
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

    const skins = screen.getAllByRole('button', { name: ptBR['skin.choose'] });
    await user.click(skins[3]!);

    expect(doll().querySelector('g[data-slot="top"] path')?.getAttribute('fill')).toBe(before);
  });

  it('offers no garment colours until something is worn there', async () => {
    const { user } = mount();

    await user.click(trayButton('tray.shoes'));

    expect(screen.queryAllByRole('button', { name: ptBR['color.choose'] })).toHaveLength(0);

    await user.click(partButtons()[0]!);

    expect(screen.getAllByRole('button', { name: ptBR['color.choose'] }).length).toBeGreaterThan(0);
  });

  it('keeps the chosen colour when swapping a piece in the same tray', async () => {
    const { user, storage } = mount();

    await user.click(trayButton('tray.top'));
    await user.click(partButtons()[0]!);

    const swatches = screen.getAllByRole('button', { name: ptBR['color.choose'] });
    await user.click(swatches[4]!);
    await user.click(partButtons()[0]!);

    act(() => {
      vi.advanceTimersByTime(AUTOSAVE_DELAY_MS);
    });

    expect(storedLook(storage)?.equipped.top?.color).toBe('#378ADD');
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

    // The stage comes before the panel, so the zoom slider is reached first and
    // the trays follow it.
    await user.tab();

    expect(document.activeElement).toBe(screen.getByRole('slider', { name: ptBR['zoom.label'] }));

    await user.tab();

    expect(document.activeElement).toBe(trayButton('tray.hair'));
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

  it('recolours from the keyboard too', async () => {
    const { user } = mount();

    await user.click(trayButton('tray.top'));
    await user.click(partButtons()[0]!);

    const swatches = screen.getAllByRole('button', { name: ptBR['color.choose'] });
    swatches[3]!.focus();
    await user.keyboard('{Enter}');

    expect(swatches[3]).toHaveAttribute('aria-pressed', 'true');
  });

  it('keeps the doll and the trays on one screen, with no dialog', () => {
    const { container } = mount();

    expect(within(container).queryByRole('dialog')).toBeNull();
    expect(doll()).toBeInTheDocument();
    expect(partButtons().length).toBeGreaterThan(0);
  });
});

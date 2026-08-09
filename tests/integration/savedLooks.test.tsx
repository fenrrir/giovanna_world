import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';

import { App } from '../../src/App';
import { I18nProvider, ptBR } from '../../src/i18n';
import { SAVED_LOOKS_KEY } from '../../src/lib/storage';
import { DEFAULT_LOOK } from '../../src/model/defaults';
import type { Look } from '../../src/model/types';
import { WorldProvider } from '../../src/state/WorldProvider';

const mount = () =>
  render(
    <I18nProvider>
      <WorldProvider>
        <App />
      </WorldProvider>
    </I18nProvider>,
  );

const tap = (element: HTMLElement): void => {
  fireEvent.pointerDown(element);
  fireEvent.pointerUp(element);
};

const openTray = (tray: keyof typeof ptBR): void => {
  tap(screen.getByRole('button', { name: ptBR['tray.open'].replace('{tray}', ptBR[tray]) }));
};

const keep = (): void => {
  tap(screen.getByRole('button', { name: ptBR['saved.keep'] }));
};

const kept = (): HTMLElement[] => screen.queryAllByRole('button', { name: ptBR['saved.wear'] });

const pieces = (): HTMLElement[] => screen.getAllByRole('button', { name: /^Vestir esta peça/ });

const wearSomething = (tray: keyof typeof ptBR, which = 0): void => {
  openTray(tray);
  tap(pieces()[which]!);
};

/** Which piece of the open tray is marked as the one she is wearing. */
const wornPiece = (): number => pieces().findIndex((piece) => piece.ariaPressed === 'true');

const stored = (): unknown => JSON.parse(localStorage.getItem(SAVED_LOOKS_KEY) ?? 'null');

const storedAlbum = (): Look[] => (stored() ?? []) as Look[];

describe('the album of looks she keeps', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('starts empty, with only the star to press', () => {
    mount();
    openTray('tray.saved');

    expect(screen.getByRole('button', { name: ptBR['saved.keep'] })).toBeInTheDocument();
    expect(kept()).toHaveLength(0);
  });

  it('keeps the doll as she stands', () => {
    mount();
    wearSomething('tray.top');
    openTray('tray.saved');
    keep();

    expect(kept()).toHaveLength(1);
  });

  it('writes it down, so it is still there next time', () => {
    mount();
    openTray('tray.saved');
    keep();

    expect(stored()).toHaveLength(1);
  });

  it('reads back what she kept before', () => {
    const first = mount();

    openTray('tray.saved');
    keep();
    first.unmount();

    mount();
    openTray('tray.saved');

    expect(kept()).toHaveLength(1);
  });

  /* Twelve slots are too few to spend two on one outfit. */
  it('keeps the same outfit once, however often she presses', () => {
    mount();
    openTray('tray.saved');
    keep();
    keep();
    keep();

    expect(kept()).toHaveLength(1);
  });

  it('puts a kept outfit back on when she taps it', () => {
    mount();
    wearSomething('tray.top');
    openTray('tray.saved');
    keep();

    // Change the doll, then ask for the kept one back.
    wearSomething('tray.shoes');
    openTray('tray.saved');
    tap(kept()[0]!);

    expect(kept()[0]).toHaveAttribute('aria-pressed', 'true');
  });

  it('marks the one she is wearing and no other', () => {
    mount();
    openTray('tray.saved');
    keep();
    wearSomething('tray.top');
    openTray('tray.saved');
    keep();

    expect(kept().filter((item) => item.getAttribute('aria-pressed') === 'true')).toHaveLength(1);
  });

  /* It swaps into the same row the pieces use: one level, nothing to go back
   * from, and no colours because an outfit has no slot to recolour. */
  it('offers no colours while the album is open', () => {
    mount();
    wearSomething('tray.top');
    openTray('tray.saved');

    expect(screen.queryByLabelText(ptBR['color.pick'])).toBeNull();
    expect(screen.getByRole('img', { name: ptBR['doll.label'] })).toBeInTheDocument();
  });

  /*
   * The star means "I want to find this outfit again", not "I want this
   * afternoon again". Where she is standing belongs to the stage rather than to
   * the doll, so keeping her cannot keep the meadow with her.
   */
  it('keeps the doll and leaves the place she was standing in', () => {
    mount();
    wearSomething('tray.scene');
    wearSomething('tray.top');
    openTray('tray.saved');
    keep();

    expect(storedAlbum()[0]?.equipped.top).toBeDefined();
    expect(storedAlbum()[0]?.equipped.scene).toBeUndefined();
  });

  it('does not move her when she puts a kept outfit back on', () => {
    mount();
    wearSomething('tray.scene');
    openTray('tray.saved');
    keep();

    // A different backdrop, then the kept outfit back: she stays in the second.
    wearSomething('tray.scene', 1);
    openTray('tray.saved');
    tap(kept()[0]!);
    openTray('tray.scene');

    expect(wornPiece()).toBe(1);
  });

  /* An entry kept before the album knew the difference still carries a place,
     and it must not drag her back there. */
  it('ignores the place an older entry remembers', () => {
    const older: Look = {
      ...DEFAULT_LOOK,
      equipped: { ...DEFAULT_LOOK.equipped, scene: { partId: 'scene.meadow', color: '#1D9E75' } },
    };

    localStorage.setItem(SAVED_LOOKS_KEY, JSON.stringify([older]));
    mount();
    wearSomething('tray.scene', 1);
    openTray('tray.saved');
    tap(kept()[0]!);
    openTray('tray.scene');

    expect(wornPiece()).toBe(1);
  });

  it('adds no words to the interface', () => {
    const { container } = mount();
    openTray('tray.saved');
    keep();

    expect(container.textContent.trim()).toBe('');
  });
});

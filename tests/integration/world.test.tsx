import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { App } from '../../src/App';
import { I18nProvider, ptBR } from '../../src/i18n';
import { DEFAULT_WORLD, type World } from '../../src/model/world';
import { WorldProvider } from '../../src/state/WorldProvider';

const mount = (world: World = DEFAULT_WORLD) =>
  render(
    <I18nProvider>
      <WorldProvider world={world}>
        <App />
      </WorldProvider>
    </I18nProvider>,
  );

const tap = (element: HTMLElement): void => {
  fireEvent.pointerDown(element);
  fireEvent.pointerUp(element);
};

const stage = (): HTMLElement => screen.getByRole('img', { name: ptBR['place.here'] });

const leaveWardrobe = (): void => {
  tap(screen.getAllByRole('button', { name: ptBR['place.leave'] })[0]!);
};

const places = (): HTMLElement[] => screen.getAllByRole('button', { name: ptBR['place.go'] });
const dolls = (): HTMLElement[] => screen.getAllByRole('button', { name: ptBR['doll.put'] });

const inTheWardrobe = (): boolean =>
  screen.queryByRole('img', { name: ptBR['doll.label'] }) !== null;

/** Who is painted on the stage, by the marker a tap is hit-tested against. */
const standing = (): string[] =>
  [...stage().querySelectorAll('[data-doll]')].map((one) => one.getAttribute('data-doll') ?? '');

describe('the world she moves around in', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('opens in the wardrobe, dressing the first of them', () => {
    mount();

    expect(inTheWardrobe()).toBe(true);
  });

  /* Not a back button: a picture of the room she is going to, which is what
     SPEC section 4's one-level rule becomes once there is more than one room. */
  it('leaves the wardrobe by the room at the head of the tray rail', () => {
    mount();
    leaveWardrobe();

    expect(inTheWardrobe()).toBe(false);
    expect(stage()).toBeInTheDocument();
  });

  it('shows both of them standing in the room they start in', () => {
    mount();
    leaveWardrobe();

    expect(standing()).toStrictEqual(['0', '1']);
  });

  it('goes to another room, and finds it empty until she puts somebody in it', () => {
    mount();
    leaveWardrobe();
    tap(places()[1]!);

    expect(standing()).toStrictEqual([]);
  });

  it('stands a doll in the room she is looking at', () => {
    mount();
    leaveWardrobe();
    tap(places()[1]!);
    tap(dolls()[0]!);

    expect(standing()).toStrictEqual(['0']);
  });

  /* The keyboard path into the wardrobe: tapping her on the stage is a
     per-pixel hit test, and there is no key for that. */
  it('dresses a doll who is already in the room when her rail item is tapped again', () => {
    mount();
    leaveWardrobe();
    tap(dolls()[1]!);

    expect(inTheWardrobe()).toBe(true);
  });

  it('dresses the doll a finger lands on, on the stage itself', () => {
    mount();
    leaveWardrobe();

    const painted = stage().querySelector('[data-doll="1"]')!;

    vi.spyOn(document, 'elementFromPoint').mockReturnValue(painted);
    fireEvent.pointerDown(stage(), { clientX: 10, clientY: 10 });

    expect(inTheWardrobe()).toBe(true);
  });

  it('does nothing when the finger lands on the room rather than on anybody', () => {
    mount();
    leaveWardrobe();

    vi.spyOn(document, 'elementFromPoint').mockReturnValue(null);
    fireEvent.pointerDown(stage(), { clientX: 10, clientY: 10 });

    expect(inTheWardrobe()).toBe(false);
  });

  /* Where the map lands. Until it is drawn there is nothing to show for being
     nowhere in particular, and showing a room instead would be a guess. */
  it('shows an empty stage when she is nowhere, rather than guessing at a room', () => {
    const { container } = mount({ ...DEFAULT_WORLD, here: null });

    expect(container.querySelector('main')?.children).toHaveLength(0);
  });

  it('adds no words to the interface', () => {
    const { container } = mount();
    leaveWardrobe();

    expect(container.textContent.trim()).toBe('');
  });
});

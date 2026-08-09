import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { App } from '../../src/App';
import { I18nProvider, ptBR } from '../../src/i18n';
import { DEFAULT_WORLD, type World } from '../../src/model/world';
import { WorldProvider } from '../../src/state/WorldProvider';
import { DRESSING } from '../doubles';

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

const map = (): HTMLElement => screen.getByRole('img', { name: ptBR['place.map'] });
const room = (): HTMLElement => screen.getByRole('img', { name: ptBR['place.here'] });

const ways = (): HTMLElement[] => screen.getAllByRole('button', { name: ptBR['place.enter'] });
const rooms = (): HTMLElement[] => screen.getAllByRole('button', { name: ptBR['place.go'] });
const dolls = (): HTMLElement[] => screen.getAllByRole('button', { name: ptBR['doll.put'] });

const leaveWardrobe = (): void => {
  tap(screen.getAllByRole('button', { name: ptBR['place.leave'] })[0]!);
};

const inTheWardrobe = (): boolean =>
  screen.queryByRole('img', { name: ptBR['doll.label'] }) !== null;

/** Who is painted in the room, by the marker a tap is hit-tested against. */
const standing = (): string[] =>
  [...room().querySelectorAll('[data-doll]')].map((one) => one.getAttribute('data-doll') ?? '');

describe('the world she moves around in', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  /*
   * She picks a place before she is in one. It costs two taps before the
   * wardrobe on the very first open — every open after that resumes where she
   * left off — and it is what makes the world hers rather than a room she was
   * put in. Worth watching on the iPad against SPEC section 17's last criterion.
   */
  it('opens on the map, in no place in particular', () => {
    mount();

    expect(map()).toBeInTheDocument();
    expect(inTheWardrobe()).toBe(false);
  });

  it('offers a way into every place the world has', () => {
    mount();

    expect(ways()).toHaveLength(2);
  });

  it('goes inside when she taps a way in', () => {
    mount();
    tap(ways()[0]!);

    expect(room()).toBeInTheDocument();
  });

  /* Per-pixel, so two places can sit near each other without either stealing
     the other's taps. */
  it('goes inside the building a finger lands on, on the map itself', () => {
    mount();

    const drawn = map().querySelector('[data-location="park"]')!;

    vi.spyOn(document, 'elementFromPoint').mockReturnValue(drawn);
    fireEvent.pointerDown(map(), { clientX: 10, clientY: 10 });

    expect(rooms()).toHaveLength(1);
  });

  it('does nothing when the finger lands on the land rather than on a place', () => {
    mount();

    vi.spyOn(document, 'elementFromPoint').mockReturnValue(null);
    fireEvent.pointerDown(map(), { clientX: 10, clientY: 10 });

    expect(map()).toBeInTheDocument();
  });

  /* What a location means on screen: the rail narrows to the rooms of the one
     she is in, with the map always one tap away. */
  it('shows the way back to the map and the rooms of this place, and no others', () => {
    mount();
    tap(ways()[0]!);

    expect(screen.getByRole('button', { name: ptBR['place.map'] })).toBeInTheDocument();
    expect(rooms()).toHaveLength(1);
  });

  it('goes back out to the map', () => {
    mount();
    tap(ways()[0]!);
    tap(screen.getByRole('button', { name: ptBR['place.map'] }));

    expect(map()).toBeInTheDocument();
  });

  it('shows both of them standing in the room they start in', () => {
    mount();
    tap(ways()[0]!);

    expect(standing()).toStrictEqual(['0', '1']);
  });

  it('finds a place empty until she puts somebody in it', () => {
    mount();
    tap(ways()[1]!);

    expect(standing()).toStrictEqual([]);
  });

  it('stands a doll in the place she is looking at', () => {
    mount();
    tap(ways()[1]!);
    tap(dolls()[0]!);

    expect(standing()).toStrictEqual(['0']);
  });

  /* The keyboard path into the wardrobe: tapping her on the stage is a
     per-pixel hit test, and there is no key for that. */
  it('dresses a doll already in the room when her rail item is tapped again', () => {
    mount();
    tap(ways()[0]!);
    tap(dolls()[1]!);

    expect(inTheWardrobe()).toBe(true);
  });

  it('dresses the doll a finger lands on, on the stage itself', () => {
    mount();
    tap(ways()[0]!);

    const painted = room().querySelector('[data-doll="1"]')!;

    vi.spyOn(document, 'elementFromPoint').mockReturnValue(painted);
    fireEvent.pointerDown(room(), { clientX: 10, clientY: 10 });

    expect(inTheWardrobe()).toBe(true);
  });

  it('does nothing when the finger lands on the room rather than on anybody', () => {
    mount();
    tap(ways()[0]!);

    vi.spyOn(document, 'elementFromPoint').mockReturnValue(null);
    fireEvent.pointerDown(room(), { clientX: 10, clientY: 10 });

    expect(inTheWardrobe()).toBe(false);
  });

  /* Not a back button: a picture of the room she is going to, which is what
     SPEC section 4's one-level rule becomes once there is more than one room. */
  it('leaves the wardrobe by the room at the head of the tray rail', () => {
    mount(DRESSING);
    leaveWardrobe();

    expect(inTheWardrobe()).toBe(false);
    expect(room()).toBeInTheDocument();
  });

  it('adds no words to the interface', () => {
    const { container } = mount();

    expect(container.textContent.trim()).toBe('');

    tap(ways()[0]!);

    expect(container.textContent.trim()).toBe('');
  });
});

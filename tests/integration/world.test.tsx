import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { App } from '../../src/App';
import { I18nProvider, ptBR } from '../../src/i18n';
import { DEFAULT_WORLD, type World } from '../../src/model/world';
import { WorldProvider } from '../../src/state/WorldProvider';
import { dollTransform } from '../../src/world/placement';
import { findEnvironment } from '../../src/world/registry';
import { DRESSING } from '../doubles';

const mount = (world: World = DEFAULT_WORLD) =>
  render(
    <I18nProvider>
      <WorldProvider world={world}>
        <App />
      </WorldProvider>
    </I18nProvider>,
  );

const mountWithUser = () => ({ ...mount(), user: userEvent.setup() });

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

/** Where in the room each doll is drawn, as the transform that put her there. */
const placedAt = (doll: number): string =>
  room()
    .querySelector(`[data-doll="${String(doll)}"]`)
    ?.getAttribute('transform') ?? '';

const STAGE = { left: 200, top: 0, right: 880, bottom: 540, width: 680, height: 540 };

/** The room laid out at exactly canvas size, so a drop lands where it reads. */
const stubStageRect = (): void => {
  vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(function (
    this: Element,
  ): DOMRect {
    const onStage = this.tagName === 'SECTION' || this.querySelector('svg[role="img"]') !== null;

    return {
      ...(onStage ? STAGE : { left: 0, top: 0, right: 0, bottom: 0, width: 0, height: 0 }),
      x: 0,
      y: 0,
      toJSON: () => ({}),
    };
  });
};

type Point = { x: number; y: number };

const drag = (on: HTMLElement, from: Point, to: Point): void => {
  fireEvent.pointerDown(on, { clientX: from.x, clientY: from.y });
  fireEvent.pointerMove(on, { clientX: to.x, clientY: to.y });
  fireEvent.pointerUp(on, { clientX: to.x, clientY: to.y });
};

/** Down and up in the same place: a tap, whatever else is watching for a drag. */
const tapAt = (on: HTMLElement, at: Point): void => {
  fireEvent.pointerDown(on, { clientX: at.x, clientY: at.y });
  fireEvent.pointerUp(on, { clientX: at.x, clientY: at.y });
};

const INSIDE = { x: 300, y: 300 };
const OUTSIDE = { x: 0, y: 0 };

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
    tapAt(room(), INSIDE);

    expect(inTheWardrobe()).toBe(true);
  });

  it('does nothing when the finger lands on the room rather than on anybody', () => {
    mount();
    tap(ways()[0]!);

    vi.spyOn(document, 'elementFromPoint').mockReturnValue(null);
    tapAt(room(), INSIDE);

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

  /*
   * The whole point of carrying her rather than tapping her: a tap stands her
   * at the next free spot, and this stands her where the finger let go.
   */
  it('stands a doll exactly where she is carried to', () => {
    mount();
    tap(ways()[1]!);
    stubStageRect();

    // Two thirds across the room, measured against the canvas the stub lays out.
    drag(dolls()[0]!, OUTSIDE, { x: STAGE.left + STAGE.width * 0.66, y: 300 });

    const near = placedAt(0);

    tap(dolls()[1]!);

    expect(near).not.toBe(placedAt(1));
    expect(standing()).toStrictEqual(['0', '1']);
  });

  it('keeps her in the room when she is carried past its edge', () => {
    mount();
    tap(ways()[1]!);
    stubStageRect();

    drag(dolls()[0]!, OUTSIDE, { x: STAGE.left + 4, y: 300 });

    expect(placedAt(0)).toBe(dollTransform(findEnvironment('park.meadow').floor, 0));
  });

  /* The mirror of the drag that undresses, on the room instead of the doll:
     drag her off the stage and she is out of it. */
  it('takes a doll out of the room when she is dragged off it', () => {
    mount();
    tap(ways()[0]!);
    stubStageRect();

    const painted = room().querySelector('[data-doll="0"]')!;

    vi.spyOn(document, 'elementFromPoint').mockReturnValue(painted);
    drag(room(), INSIDE, OUTSIDE);

    expect(standing()).toStrictEqual(['1']);
  });

  it('leaves her where she was when the drag stops back inside the room', () => {
    mount();
    tap(ways()[0]!);
    stubStageRect();

    const painted = room().querySelector('[data-doll="0"]')!;

    vi.spyOn(document, 'elementFromPoint').mockReturnValue(painted);
    drag(room(), INSIDE, { x: STAGE.left + 100, y: 320 });

    expect(standing()).toStrictEqual(['0', '1']);
  });

  /* The rail is where both ways in live, and this is the half of it a finger
     cannot reach: no gesture in this game may be pointer-only. */
  it('stands a doll in the room from the keyboard', async () => {
    const { user } = mountWithUser();

    await user.click(ways()[1]!);
    await user.tab();
    await user.keyboard('{Enter}');

    expect(standing()).toStrictEqual(['0']);
  });

  it('adds no words to the interface', () => {
    const { container } = mount();

    expect(container.textContent.trim()).toBe('');

    tap(ways()[0]!);

    expect(container.textContent.trim()).toBe('');
  });
});

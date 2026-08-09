import { describe, expect, it } from 'vitest';

import { PALETTES } from './palettes';
import {
  DEFAULT_WORLD,
  awayFrom,
  dressedDoll,
  lookingAt,
  modeOf,
  nowDressing,
  painted,
  repairWorld,
  standing,
  withDressedDoll,
  type StoredWorld,
  type World,
} from './world';

const inTheBedroom: World = { ...DEFAULT_WORLD, here: 'house.bedroom', dressing: null };
const onTheMap: World = { ...DEFAULT_WORLD, here: null, dressing: null };

const stored = (over: Partial<StoredWorld>): StoredWorld => ({
  ...DEFAULT_WORLD,
  colors: {},
  ...over,
});

describe('DEFAULT_WORLD', () => {
  /* Identical, they would read as one doll drawn twice, and the first thing she
     does with a friend is tell them apart. */
  it('stands two of them on different skin tones', () => {
    expect(DEFAULT_WORLD.dolls[0].skin).not.toBe(DEFAULT_WORLD.dolls[1].skin);
  });

  it('starts with nobody put anywhere and nothing painted', () => {
    expect(DEFAULT_WORLD.placements).toStrictEqual([null, null]);
    expect(DEFAULT_WORLD.colors).toStrictEqual({});
  });
});

describe('modeOf', () => {
  it('is the map when she is looking at nowhere in particular', () => {
    expect(modeOf(onTheMap)).toBe('map');
  });

  it('is a place when she is in one and dressing nobody', () => {
    expect(modeOf(inTheBedroom)).toBe('place');
  });

  it('is dressing when she has picked a doll', () => {
    expect(modeOf({ ...inTheBedroom, dressing: 1 })).toBe('dress');
  });
});

describe('the doll she is dressing', () => {
  it('is nobody until she picks one', () => {
    expect(dressedDoll(inTheBedroom)).toBeNull();
  });

  it('is the one her taps reach', () => {
    expect(dressedDoll({ ...inTheBedroom, dressing: 1 })).toBe(DEFAULT_WORLD.dolls[1]);
  });

  it('replaces the dressed doll and moves no one else', () => {
    const world = { ...inTheBedroom, dressing: 1 } as const;
    const changed = { ...DEFAULT_WORLD.dolls[1], skin: PALETTES.skin[3] };
    const next = withDressedDoll(world, changed);

    expect(next.dolls[1]).toBe(changed);
    expect(next.dolls[0]).toBe(DEFAULT_WORLD.dolls[0]);
  });

  /* Reachable only by a wiring mistake, and it must be a no-op rather than a
     doll dressed at random. */
  it('changes nothing when she is dressing nobody', () => {
    expect(withDressedDoll(inTheBedroom, DEFAULT_WORLD.dolls[0])).toBe(inTheBedroom);
  });

  it('turns her attention to another doll, and to none', () => {
    expect(nowDressing(inTheBedroom, 1).dressing).toBe(1);
    expect(nowDressing({ ...inTheBedroom, dressing: 1 }, null).dressing).toBeNull();
  });

  /* Same reference, so the autosave effect does not fire on a tap that changed
     nothing. */
  it('hands back the same world when she taps the doll she is already dressing', () => {
    const world = { ...inTheBedroom, dressing: 0 } as const;

    expect(nowDressing(world, 0)).toBe(world);
  });
});

describe('where she is looking', () => {
  it('goes to a room, and back out to the map', () => {
    expect(lookingAt(onTheMap, 'park.meadow').here).toBe('park.meadow');
    expect(lookingAt(inTheBedroom, null).here).toBeNull();
  });

  /* She cannot be dressing a doll in a room she has left, so the room
     thumbnail is also the way out of dressing one. */
  it('stops dressing whoever she was dressing', () => {
    expect(lookingAt({ ...inTheBedroom, dressing: 0 }, 'park.meadow').dressing).toBeNull();
  });

  it('hands back the same world when she is already there and dressing nobody', () => {
    expect(lookingAt(inTheBedroom, 'house.bedroom')).toBe(inTheBedroom);
  });
});

describe('putting a doll somewhere', () => {
  it('stands her in the room in view, where she was dropped', () => {
    expect(standing(inTheBedroom, 0, 0.25).placements[0]).toStrictEqual({
      at: 'house.bedroom',
      x: 0.25,
    });
  });

  it('leaves the other doll where she was', () => {
    expect(standing(inTheBedroom, 1, 0.5).placements[0]).toBeNull();
  });

  /* A six-year-old aims past the edge, and half a doll outside the canvas is
     not a placement she meant. */
  it('keeps her inside the canvas however wide she is dropped', () => {
    expect(standing(inTheBedroom, 0, -3).placements[0]?.x).toBe(0);
    expect(standing(inTheBedroom, 0, 4).placements[0]?.x).toBe(1);
  });

  it('moves her rather than standing her in two rooms at once', () => {
    const bedroom = standing(inTheBedroom, 0, 0.5);
    const meadow = standing({ ...bedroom, here: 'park.meadow' }, 0, 0.5);

    expect(meadow.placements[0]?.at).toBe('park.meadow');
  });

  it('puts nobody anywhere from the map, where there is no floor', () => {
    expect(standing(onTheMap, 0, 0.5)).toBe(onTheMap);
  });

  it('takes her away again', () => {
    expect(awayFrom(standing(inTheBedroom, 0, 0.5), 0).placements[0]).toBeNull();
  });
});

describe('painting a place', () => {
  it('paints the room in view and no other', () => {
    expect(painted(inTheBedroom, '#1D9E75').colors).toStrictEqual({ 'house.bedroom': '#1D9E75' });
  });

  it('paints nothing from the map, where there is no wall', () => {
    expect(painted(onTheMap, '#1D9E75')).toBe(onTheMap);
  });

  it('remembers the colour of every room she has painted', () => {
    const bedroom = painted(inTheBedroom, '#1D9E75');
    const both = painted({ ...bedroom, here: 'park.meadow' }, '#EF9F27');

    expect(both.colors).toStrictEqual({ 'house.bedroom': '#1D9E75', 'park.meadow': '#EF9F27' });
  });
});

/*
 * A world written by a later version can name rooms this one has never had, and
 * every one of those names ends up in a lookup keyed by environment. Losing the
 * room costs her a backdrop; letting it through costs her the app.
 */
describe('repairWorld', () => {
  it('leaves a world naming only rooms it knows exactly as it is', () => {
    const world = painted(standing(inTheBedroom, 0, 0.5), '#1D9E75');

    expect(repairWorld(world)).toStrictEqual(world);
  });

  it('puts her on the map when she was looking at a room that is gone', () => {
    expect(repairWorld(stored({ here: 'house.attic' })).here).toBeNull();
  });

  it('takes a doll off the floor of a room that is gone', () => {
    const placements = [{ at: 'house.attic', x: 0.5 }, null] as const;

    expect(repairWorld(stored({ placements })).placements).toStrictEqual([null, null]);
  });

  it('keeps a doll standing in a room that is still there', () => {
    const placements = [{ at: 'park.meadow', x: 0.5 }, null] as const;

    expect(repairWorld(stored({ placements })).placements[0]).toStrictEqual({
      at: 'park.meadow',
      x: 0.5,
    });
  });

  it('forgets the colour of a room that is gone, and keeps the rest', () => {
    const colors = { 'house.attic': '#1D9E75', 'park.meadow': '#EF9F27' };

    expect(repairWorld(stored({ colors })).colors).toStrictEqual({ 'park.meadow': '#EF9F27' });
  });

  it('brings a doll dropped outside the canvas back inside it', () => {
    const placements = [{ at: 'park.meadow', x: 9 }, null] as const;

    expect(repairWorld(stored({ placements })).placements[0]?.x).toBe(1);
  });
});

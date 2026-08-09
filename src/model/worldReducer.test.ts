import { describe, expect, it } from 'vitest';

import { stubPart } from '../../tests/doubles';
import { PALETTES } from './palettes';
import { DEFAULT_WORLD, type World } from './world';
import { worldReducer } from './worldReducer';

const tShirt = stubPart('top', 'top.t-shirt');

const dressingSecond: World = { ...DEFAULT_WORLD, here: 'house.bedroom', dressing: 1 };
const playing: World = { ...DEFAULT_WORLD, here: 'house.bedroom', dressing: null };

describe('worldReducer', () => {
  /*
   * The whole point of the wrapper: the reducer that knows about hair pairs and
   * hidden slots never learns there are two dolls, and neither does anything
   * that dispatches to it.
   */
  it('hands a dress action straight to the look reducer, against the doll she is dressing', () => {
    const next = worldReducer(dressingSecond, {
      type: 'dress',
      action: { type: 'applyPart', part: tShirt, color: PALETTES.fabric[0] },
    });

    expect(next.dolls[1].equipped.top).toStrictEqual({
      partId: 'top.t-shirt',
      color: PALETTES.fabric[0],
    });
  });

  it('leaves the other doll exactly as she was', () => {
    const next = worldReducer(dressingSecond, {
      type: 'dress',
      action: { type: 'setSkin', color: PALETTES.skin[3] },
    });

    expect(next.dolls[0]).toBe(DEFAULT_WORLD.dolls[0]);
  });

  /* Reachable only by a wiring mistake — a tray on screen with nobody being
     dressed — and it must change nothing rather than dress someone at random. */
  it('changes nothing when a dress action arrives with nobody being dressed', () => {
    const next = worldReducer(playing, {
      type: 'dress',
      action: { type: 'setSkin', color: PALETTES.skin[3] },
    });

    expect(next).toBe(playing);
  });

  it('turns her attention to another doll, and to none', () => {
    expect(worldReducer(playing, { type: 'dressDoll', doll: 1 }).dressing).toBe(1);
    expect(worldReducer(dressingSecond, { type: 'dressDoll', doll: null }).dressing).toBeNull();
  });

  it('takes her to another room, and out to the map', () => {
    expect(worldReducer(playing, { type: 'goTo', here: 'park.meadow' }).here).toBe('park.meadow');
    expect(worldReducer(playing, { type: 'goTo', here: null }).here).toBeNull();
  });

  it('stands a doll where she was dropped, and takes her away again', () => {
    const placed = worldReducer(playing, { type: 'place', doll: 0, x: 0.75 });

    expect(placed.placements[0]).toStrictEqual({ at: 'house.bedroom', x: 0.75 });
    expect(worldReducer(placed, { type: 'takeAway', doll: 0 }).placements[0]).toBeNull();
  });

  it('paints the room she is looking at', () => {
    expect(worldReducer(playing, { type: 'paint', color: '#1D9E75' }).colors).toStrictEqual({
      'house.bedroom': '#1D9E75',
    });
  });
});

import { describe, expect, it } from 'vitest';

import { COLLARS, DEFAULT_OUTER_PARAMS, OUTER_AXES, toOuterParams } from './params';

describe('toOuterParams', () => {
  it('gives the defaults when nothing was stored', () => {
    expect(toOuterParams()).toStrictEqual(DEFAULT_OUTER_PARAMS);
  });

  it('keeps what she chose', () => {
    expect(toOuterParams({ length: 0.2, sleeve: 0.9, collar: 'hood' })).toStrictEqual({
      length: 0.2,
      sleeve: 0.9,
      collar: 'hood',
    });
  });

  it.each([
    ['above the range', 4, 1],
    ['below the range', -2, 0],
  ])('clamps a value %s', (_name, stored, expected) => {
    expect(toOuterParams({ length: stored }).length).toBe(expected);
  });

  it.each([
    ['a string', 'long'],
    ['nothing', undefined],
    ['not a number', Number.NaN],
  ])('falls back when an axis holds %s', (_name, stored) => {
    expect(toOuterParams({ sleeve: stored as number }).sleeve).toBe(DEFAULT_OUTER_PARAMS.sleeve);
  });

  it('falls back on a collar it does not know', () => {
    expect(toOuterParams({ collar: 'fur' }).collar).toBe(DEFAULT_OUTER_PARAMS.collar);
  });

  /*
   * The two repairs are not the same. A number out of range is a position she
   * could have meant, so it is pulled to the nearest end; a value of the wrong
   * type carries no intent at all, so it goes back to the default.
   */
  it('repairs every axis at once rather than giving up on the garment', () => {
    expect(toOuterParams({ length: 9, sleeve: 'x', collar: 7 })).toStrictEqual({
      length: 1,
      sleeve: DEFAULT_OUTER_PARAMS.sleeve,
      collar: DEFAULT_OUTER_PARAMS.collar,
    });
  });

  it('starts on a collar and axes that are all inside their own range', () => {
    for (const axis of OUTER_AXES) {
      expect(DEFAULT_OUTER_PARAMS[axis]).toBeGreaterThanOrEqual(0);
      expect(DEFAULT_OUTER_PARAMS[axis]).toBeLessThanOrEqual(1);
    }

    expect(COLLARS).toContain(DEFAULT_OUTER_PARAMS.collar);
  });
});

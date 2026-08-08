import { describe, expect, it } from 'vitest';

import { DEFAULT_HAIR_PARAMS, FRINGES, toHairParams } from './params';

describe('toHairParams', () => {
  it('gives the default hairstyle when there is nothing stored', () => {
    expect(toHairParams()).toStrictEqual(DEFAULT_HAIR_PARAMS);
  });

  it('keeps a set of valid axes exactly as they are', () => {
    const params = { length: 0.25, volume: 0.75, wave: 0, fringe: 'curtain' };

    expect(toHairParams(params)).toStrictEqual(params);
  });

  it.each(['length', 'volume', 'wave'])('clamps %s above one back down to one', (axis) => {
    expect(toHairParams({ [axis]: 7.5 })[axis as 'length']).toBe(1);
  });

  it.each(['length', 'volume', 'wave'])('clamps %s below zero back up to zero', (axis) => {
    expect(toHairParams({ [axis]: -3 })[axis as 'length']).toBe(0);
  });

  it('falls back to the default when an axis was stored as a word', () => {
    expect(toHairParams({ length: 'muito comprido' }).length).toBe(DEFAULT_HAIR_PARAMS.length);
  });

  it.each([Number.NaN, Number.POSITIVE_INFINITY])(
    'falls back on %p rather than emitting it',
    (value) => {
      expect(toHairParams({ volume: value }).volume).toBe(DEFAULT_HAIR_PARAMS.volume);
    },
  );

  it('falls back to the default fringe when the stored one is unknown', () => {
    expect(toHairParams({ fringe: 'moicano' }).fringe).toBe(DEFAULT_HAIR_PARAMS.fringe);
  });

  it.each(FRINGES)('accepts the %s fringe', (fringe) => {
    expect(toHairParams({ fringe }).fringe).toBe(fringe);
  });

  it('repairs one axis without disturbing the others', () => {
    expect(toHairParams({ length: 2, volume: 0.3, wave: 0.1, fringe: 'side' })).toStrictEqual({
      length: 1,
      volume: 0.3,
      wave: 0.1,
      fringe: 'side',
    });
  });
});

describe('DEFAULT_HAIR_PARAMS', () => {
  it('is itself a valid set, so the repair is a fixed point', () => {
    expect(toHairParams(DEFAULT_HAIR_PARAMS)).toStrictEqual(DEFAULT_HAIR_PARAMS);
  });

  it('lists every fringe exactly once, so the panel can show them all', () => {
    expect(new Set(FRINGES).size).toBe(FRINGES.length);
    expect(FRINGES).toContain(DEFAULT_HAIR_PARAMS.fringe);
  });
});

import { describe, expect, it } from 'vitest';

import { edgesOf, scrollStep } from './scrollEdges';

describe('edgesOf', () => {
  it('offers neither way when everything fits', () => {
    expect(edgesOf({ scrollLeft: 0, clientWidth: 400, scrollWidth: 400 })).toStrictEqual({
      start: false,
      end: false,
    });
  });

  it('offers the way forward at the start of a long row', () => {
    expect(edgesOf({ scrollLeft: 0, clientWidth: 400, scrollWidth: 900 })).toStrictEqual({
      start: false,
      end: true,
    });
  });

  it('offers both ways in the middle', () => {
    expect(edgesOf({ scrollLeft: 250, clientWidth: 400, scrollWidth: 900 })).toStrictEqual({
      start: true,
      end: true,
    });
  });

  it('offers only the way back at the end', () => {
    expect(edgesOf({ scrollLeft: 500, clientWidth: 400, scrollWidth: 900 })).toStrictEqual({
      start: true,
      end: false,
    });
  });

  it('points nowhere when the row is a fraction short of its end', () => {
    expect(edgesOf({ scrollLeft: 499.4, clientWidth: 400, scrollWidth: 900 }).end).toBe(false);
  });

  it('ignores a fraction of scroll at the very start', () => {
    expect(edgesOf({ scrollLeft: 0.6, clientWidth: 400, scrollWidth: 900 }).start).toBe(false);
  });
});

describe('scrollStep', () => {
  it('moves most of a screenful, leaving an overlap', () => {
    expect(scrollStep(400)).toBe(320);
  });

  it('always lands on a whole pixel', () => {
    expect(Number.isInteger(scrollStep(333))).toBe(true);
  });
});

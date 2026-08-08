import { describe, expect, it } from 'vitest';

import { edgesOf, scrollStep } from './scrollEdges';

describe('edgesOf', () => {
  it('offers neither way when everything fits', () => {
    expect(edgesOf({ offset: 0, viewport: 400, content: 400 })).toStrictEqual({
      start: false,
      end: false,
    });
  });

  it('offers the way forward at the start of a long rail', () => {
    expect(edgesOf({ offset: 0, viewport: 400, content: 900 })).toStrictEqual({
      start: false,
      end: true,
    });
  });

  it('offers both ways in the middle', () => {
    expect(edgesOf({ offset: 250, viewport: 400, content: 900 })).toStrictEqual({
      start: true,
      end: true,
    });
  });

  it('offers only the way back at the end', () => {
    expect(edgesOf({ offset: 500, viewport: 400, content: 900 })).toStrictEqual({
      start: true,
      end: false,
    });
  });

  it('points nowhere when the rail is a fraction short of its end', () => {
    expect(edgesOf({ offset: 499.4, viewport: 400, content: 900 }).end).toBe(false);
  });

  it('ignores a fraction of scroll at the very start', () => {
    expect(edgesOf({ offset: 0.6, viewport: 400, content: 900 }).start).toBe(false);
  });
});

describe('scrollStep', () => {
  it('moves most of a railful, leaving an overlap', () => {
    expect(scrollStep(400)).toBe(320);
  });

  it('always lands on a whole pixel', () => {
    expect(Number.isInteger(scrollStep(333))).toBe(true);
  });
});

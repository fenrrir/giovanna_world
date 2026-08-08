import { describe, expect, it } from 'vitest';

import { ANCHORS, VIEW_BOX, VIEW_BOX_ATTR } from './anchors';

/** Every number in the anchor table, tagged with the axis it belongs to. */
const coordinates = (): { path: string; axis: 'x' | 'y'; value: number }[] => {
  const result: { path: string; axis: 'x' | 'y'; value: number }[] = [];

  for (const [name, anchor] of Object.entries(ANCHORS)) {
    for (const [key, value] of Object.entries(anchor)) {
      if (key.startsWith('x')) result.push({ path: `${name}.${key}`, axis: 'x', value });
      if (key.startsWith('y')) result.push({ path: `${name}.${key}`, axis: 'y', value });
    }
  }

  return result;
};

describe('VIEW_BOX', () => {
  it('is the contractual 680 by 540 canvas', () => {
    expect(VIEW_BOX).toStrictEqual({ width: 680, height: 540 });
    expect(VIEW_BOX_ATTR).toBe('0 0 680 540');
  });
});

describe('ANCHORS', () => {
  it('keeps every coordinate inside the viewBox', () => {
    for (const { path, axis, value } of coordinates()) {
      const limit = axis === 'x' ? VIEW_BOX.width : VIEW_BOX.height;

      expect(value, `${path} is outside the viewBox`).toBeGreaterThanOrEqual(0);
      expect(value, `${path} is outside the viewBox`).toBeLessThanOrEqual(limit);
    }
  });

  it('reserves the lateral margin the spec asks for', () => {
    expect(ANCHORS.dollBounds).toStrictEqual({ x1: 234, x2: 446 });
  });

  it('places the head anchors where the spec puts them', () => {
    expect(ANCHORS.skullTop).toStrictEqual({ x: 340, y: 68 });
    expect(ANCHORS.headCenter).toStrictEqual({ x: 340, y: 130, r: 62 });
    expect(ANCHORS.chin).toStrictEqual({ x: 340, y: 192 });
    expect(ANCHORS.eyeLine).toStrictEqual({ y: 136, xLeft: 318, xRight: 362 });
  });

  it('places the body anchors where the spec puts them', () => {
    expect(ANCHORS.shoulderLeft).toStrictEqual({ x: 282, y: 216 });
    expect(ANCHORS.shoulderRight).toStrictEqual({ x: 398, y: 216 });
    expect(ANCHORS.torso).toStrictEqual({ x1: 288, x2: 392, y1: 194, y2: 334, rx: 30 });
    expect(ANCHORS.waist).toStrictEqual({ y: 280, x1: 284, x2: 396, height: 18 });
    expect(ANCHORS.hip).toStrictEqual({ y: 330 });
    expect(ANCHORS.ankle).toStrictEqual({ y: 440 });
    expect(ANCHORS.sole).toStrictEqual({ y: 494 });
  });

  it('runs the doll top to bottom in the order the spec describes', () => {
    expect(ANCHORS.skullTop.y).toBeLessThan(ANCHORS.headCenter.y);
    expect(ANCHORS.headCenter.y).toBeLessThan(ANCHORS.chin.y);
    expect(ANCHORS.chin.y).toBeLessThan(ANCHORS.neckBase.y);
    expect(ANCHORS.neckBase.y).toBeLessThan(ANCHORS.shoulderLeft.y);
    expect(ANCHORS.shoulderLeft.y).toBeLessThan(ANCHORS.waist.y);
    expect(ANCHORS.waist.y).toBeLessThan(ANCHORS.hip.y);
    expect(ANCHORS.hip.y).toBeLessThan(ANCHORS.ankle.y);
    expect(ANCHORS.ankle.y).toBeLessThan(ANCHORS.sole.y);
  });

  it('keeps the doll within its declared lateral bounds', () => {
    for (const { path, axis, value } of coordinates()) {
      if (axis !== 'x' || path.startsWith('dollBounds')) continue;

      expect(value, `${path} escapes the doll bounds`).toBeGreaterThanOrEqual(
        ANCHORS.dollBounds.x1,
      );
      expect(value, `${path} escapes the doll bounds`).toBeLessThanOrEqual(ANCHORS.dollBounds.x2);
    }
  });
});

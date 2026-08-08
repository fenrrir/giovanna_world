import { describe, expect, it } from 'vitest';

import { VIEW_BOX_ATTR } from '../anchors';
import { DEFAULT_ZOOM, MAX_ZOOM, MIN_ZOOM, zoomedViewBox } from './zoom';

describe('zoomedViewBox', () => {
  it('shows the whole canvas at the default zoom', () => {
    expect(zoomedViewBox(DEFAULT_ZOOM)).toBe(VIEW_BOX_ATTR);
  });

  it('frames exactly the doll at the closest zoom', () => {
    expect(zoomedViewBox(MAX_ZOOM)).toBe('234 0 212 540');
  });

  it('keeps the doll centred as the canvas narrows', () => {
    const [x, , width] = zoomedViewBox(2).split(' ').map(Number);

    expect(x! + width! / 2).toBe(340);
  });

  it('keeps the full height at every zoom, so the doll is never cropped', () => {
    for (const zoom of [MIN_ZOOM, 1.5, 2, 2.5, MAX_ZOOM]) {
      const [, y, , height] = zoomedViewBox(zoom).split(' ').map(Number);

      expect([y, height]).toStrictEqual([0, 540]);
    }
  });

  it('narrows as the zoom rises', () => {
    const widthAt = (zoom: number): number => Number(zoomedViewBox(zoom).split(' ')[2]);

    expect(widthAt(2)).toBeLessThan(widthAt(1));
    expect(widthAt(3)).toBeLessThan(widthAt(2));
  });

  it('clamps a value below the minimum', () => {
    expect(zoomedViewBox(0)).toBe(zoomedViewBox(MIN_ZOOM));
  });

  it('clamps a value beyond the maximum, so no zoom shows less than the doll', () => {
    expect(zoomedViewBox(99)).toBe(zoomedViewBox(MAX_ZOOM));
  });
});

import { describe, expect, it } from 'vitest';

import { VIEW_BOX_ATTR } from '../anchors';
import { DEFAULT_ZOOM, MAX_ZOOM, MIN_ZOOM, zoomedViewBox } from './zoom';

describe('zoomedViewBox', () => {
  it('shows the whole canvas at the default zoom', () => {
    expect(zoomedViewBox(DEFAULT_ZOOM)).toBe(VIEW_BOX_ATTR);
  });

  it('frames exactly the doll’s width at the closest zoom', () => {
    expect(zoomedViewBox(MAX_ZOOM)).toBe('234 185.83 212 168.35');
  });

  it('keeps the doll centred as the canvas narrows', () => {
    const [x, , width] = zoomedViewBox(2).split(' ').map(Number);

    expect(x! + width! / 2).toBe(340);
  });

  /*
   * Both ways, and it has to be both. Cropping width alone stops doing anything
   * the moment the viewBox is as tall-and-narrow as the stage — past that the
   * drawing is bound by height and the rest of the slider changes nothing.
   */
  it('crops height along with width, so every stop on the slider does something', () => {
    let last = Infinity;

    for (const zoom of [MIN_ZOOM, 1.5, 2, 2.5, MAX_ZOOM]) {
      const height = Number(zoomedViewBox(zoom).split(' ')[3]);

      expect(height).toBeLessThan(last);
      last = height;
    }
  });

  it('keeps the same centre at every zoom, so the view does not drift', () => {
    for (const zoom of [MIN_ZOOM, 2, MAX_ZOOM]) {
      const [x, y, width, height] = zoomedViewBox(zoom).split(' ').map(Number);

      // Rounded to hundredths, so the halves may miss each other by less than a
      // hundredth of a unit — far below a pixel on any screen this runs on.
      expect(x! + width! / 2).toBeCloseTo(340, 1);
      expect(y! + height! / 2).toBeCloseTo(270, 1);
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

import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { ANCHORS } from '../../../anchors';
import { customSocks } from '.';
import { printBox, sockBox, sockPath, type SocksAnchors } from './geometry';
import { DEFAULT_SOCKS_PARAMS, PATTERNS, toSocksParams, type SocksParams } from './params';

const at = (params: Partial<SocksParams> = {}): SocksParams => ({
  ...DEFAULT_SOCKS_PARAMS,
  ...params,
});

describe('toSocksParams', () => {
  it('gives the defaults when nothing was stored', () => {
    expect(toSocksParams()).toStrictEqual(DEFAULT_SOCKS_PARAMS);
  });

  it('keeps what she chose', () => {
    expect(toSocksParams({ height: 0.9, pattern: 'dots' })).toStrictEqual({
      height: 0.9,
      pattern: 'dots',
    });
  });

  it.each([
    ['above the range', 3, 1],
    ['below the range', -1, 0],
  ])('clamps a height %s', (_name, stored, expected) => {
    expect(toSocksParams({ height: stored }).height).toBe(expected);
  });

  it('falls back when the height holds something that is not a number', () => {
    expect(toSocksParams({ height: 'tall' }).height).toBe(DEFAULT_SOCKS_PARAMS.height);
  });

  it('falls back when the height is not there at all', () => {
    expect(toSocksParams({ pattern: 'dots' }).height).toBe(DEFAULT_SOCKS_PARAMS.height);
  });

  it('falls back on a pattern it does not know', () => {
    expect(toSocksParams({ pattern: 'tartan' }).pattern).toBe(DEFAULT_SOCKS_PARAMS.pattern);
  });
});

describe('the socks geometry', () => {
  /*
   * They paint at z 20, under the shoes. The foot has to be covered even though
   * none of it shows, or a bare ankle appears the moment the shoes come off.
   */
  it.each([0, 0.5, 1])('reaches the sole at height %s', (height) => {
    for (const side of [-1, 1] as const) {
      const box = sockBox(side, at({ height }));

      expect(box.y + box.height).toBe(ANCHORS.sole.y);
    }
  });

  it('rises up the leg as the axis does, and clears the shoe even at its shortest', () => {
    const low = sockBox(-1, at({ height: 0 })).y;
    const high = sockBox(-1, at({ height: 1 })).y;

    expect(low).toBeLessThan(ANCHORS.shoeLeft.y1);
    expect(high).toBeLessThan(low);
    expect(high).toBeGreaterThan(ANCHORS.hip.y);
  });

  it('covers the leg it sits on', () => {
    for (const [side, leg] of [
      [-1, ANCHORS.legLeft],
      [1, ANCHORS.legRight],
    ] as const) {
      const box = sockBox(side, at());

      expect(box.x).toBeLessThanOrEqual(leg.x1);
      expect(box.x + box.width).toBeGreaterThanOrEqual(leg.x2);
    }
  });

  it('never prints below the top of the shoe', () => {
    for (const height of [0, 0.4, 1]) {
      const box = printBox(-1, at({ height }));

      expect(box.y + box.height).toBeLessThanOrEqual(ANCHORS.shoeLeft.y1);
    }
  });

  it('uses absolute commands only', () => {
    expect(sockPath(-1, at())).toMatch(/^[MLHVCSQTAZ0-9\s.,-]+$/);
  });

  it('reads the anchors rather than repeating them', () => {
    const SHIFT = 20;
    const shifted: SocksAnchors = {
      legLeft: ANCHORS.legLeft,
      legRight: ANCHORS.legRight,
      ankle: { y: ANCHORS.ankle.y + SHIFT },
      sole: { y: ANCHORS.sole.y + SHIFT },
      shoeLeft: { y1: ANCHORS.shoeLeft.y1 + SHIFT },
      hip: { y: ANCHORS.hip.y + SHIFT },
    };

    expect(sockBox(-1, at(), shifted).y).toBe(sockBox(-1, at(), ANCHORS).y + SHIFT);
  });
});

describe('the socks artwork', () => {
  it.each(PATTERNS)('draws the %s print', (pattern) => {
    const { container } = render(<svg>{customSocks({ ...at(), pattern }).render('#7F77DD')}</svg>);

    expect(container.querySelectorAll('path').length).toBeGreaterThan(0);
  });

  it('prints something on a patterned sock and nothing on a plain one', () => {
    const shapes = (pattern: string): number => {
      const { container } = render(
        <svg>{customSocks({ ...at(), pattern }).render('#7F77DD')}</svg>,
      );

      return container.querySelectorAll('rect, circle').length;
    };

    expect(shapes('plain')).toBe(0);
    expect(shapes('stripes')).toBeGreaterThan(0);
    expect(shapes('dots')).toBeGreaterThan(0);
  });
});

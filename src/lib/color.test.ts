import { describe, expect, it } from 'vitest';

import { FOLD, HIGHLIGHT, shade } from './color';

describe('shade', () => {
  it('returns the same colour for a factor of 1', () => {
    expect(shade('#7F77DD', 1)).toBe('#7F77DD');
  });

  it('darkens each channel by the factor', () => {
    // 0x80 * 0.5 = 0x40
    expect(shade('#808080', 0.5)).toBe('#404040');
  });

  it('brightens each channel by the factor', () => {
    expect(shade('#404040', 2)).toBe('#808080');
  });

  it('clamps above 255', () => {
    expect(shade('#F0F0F0', 2)).toBe('#FFFFFF');
  });

  it('clamps below 0', () => {
    expect(shade('#101010', -1)).toBe('#000000');
  });

  it('expands three-digit hex', () => {
    expect(shade('#FA0', 1)).toBe('#FFAA00');
  });

  it('normalises lowercase input to uppercase output', () => {
    expect(shade('#7f77dd', 1)).toBe('#7F77DD');
  });

  it('pads a channel that rounds below 0x10', () => {
    expect(shade('#FFFFFF', 0.02)).toBe('#050505');
  });

  it.each(['rebeccapurple', '7F77DD', '#7F77D', '#GGGGGG', ''])(
    'rejects the malformed colour %o',
    (input) => {
      expect(() => shade(input, 1)).toThrow(/invalid hex colour/i);
    },
  );

  it('exposes the fold and highlight factors from the spec', () => {
    expect(FOLD).toBe(0.78);
    expect(HIGHLIGHT).toBe(1.1);
  });

  it('derives a fold darker than the base and a highlight lighter than it', () => {
    const base = '#7F77DD';

    expect(shade(base, FOLD) < base).toBe(true);
    expect(shade(base, HIGHLIGHT) > base).toBe(true);
  });
});

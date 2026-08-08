import { describe, expect, it } from 'vitest';

import { BLUSH_OPACITY, FIXED_COLORS, PALETTES } from './palettes';
import type { Palette } from './types';

const HEX = /^#[0-9A-F]{6}$/;

describe('PALETTES', () => {
  it.each([
    ['skin', 4],
    ['hair', 6],
    ['fabric', 6],
  ] as const)('offers %s in %i colours', (palette: Palette, expected: number) => {
    expect(PALETTES[palette]).toHaveLength(expected);
  });

  it.each(['skin', 'hair', 'fabric'] as const)(
    'states every %s colour as uppercase hex',
    (name) => {
      for (const color of PALETTES[name]) {
        expect(color).toMatch(HEX);
      }
    },
  );

  it.each(['skin', 'hair', 'fabric'] as const)('repeats no colour within %s', (name) => {
    expect(new Set(PALETTES[name]).size).toBe(PALETTES[name].length);
  });

  it('uses the exact skin tones from the spec', () => {
    expect(PALETTES.skin).toStrictEqual(['#F7DCC3', '#F2C9A8', '#C68A5E', '#8A5A38']);
  });

  it('uses the exact fabric colours from the spec', () => {
    expect(PALETTES.fabric).toStrictEqual([
      '#7F77DD',
      '#1D9E75',
      '#D4537E',
      '#EF9F27',
      '#378ADD',
      '#E24B4A',
    ]);
  });
});

describe('FIXED_COLORS', () => {
  it('holds the five non-recolourable colours from the spec', () => {
    expect(FIXED_COLORS).toStrictEqual({
      eye: '#3B2418',
      eyeHighlight: '#FBFBF9',
      mouth: '#C24A6B',
      blush: '#F0997B',
      collarWhite: '#FBFBF9',
    });
  });

  it('renders blush through opacity rather than a new colour', () => {
    expect(BLUSH_OPACITY).toBe(0.45);
  });
});

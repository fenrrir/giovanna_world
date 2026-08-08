import type { Palette } from './types';

/** The colours a child may pick, per palette (SPEC section 9). */
export const PALETTES: Record<Palette, readonly string[]> = {
  skin: ['#F7DCC3', '#F2C9A8', '#C68A5E', '#8A5A38'],
  hair: ['#6B3A1F', '#111111', '#C97B2E', '#8A3A2A', '#4A2C1A', '#D4537E'],
  fabric: ['#7F77DD', '#1D9E75', '#D4537E', '#EF9F27', '#378ADD', '#E24B4A'],
};

/**
 * Colours that are never recoloured by the child (SPEC section 9). The contract
 * test uses this set to tell a deliberate constant from a hardcoded tone.
 */
export const FIXED_COLORS = {
  eye: '#3B2418',
  eyeHighlight: '#FBFBF9',
  mouth: '#C24A6B',
  blush: '#F0997B',
  collarWhite: '#FBFBF9',
} as const;

/** Blush is applied through opacity, never through a new colour. */
export const BLUSH_OPACITY = 0.45;

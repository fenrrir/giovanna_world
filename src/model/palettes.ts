import type { Palette } from './types';

/**
 * The colours a child may pick, per palette (SPEC section 9).
 *
 * `as const` keeps each entry a literal tuple, so indexing a known position
 * yields a string rather than `string | undefined` and callers need no
 * defensive fallback.
 */
export const PALETTES = {
  skin: ['#F7DCC3', '#F2C9A8', '#C68A5E', '#8A5A38'],
  hair: ['#6B3A1F', '#111111', '#C97B2E', '#8A3A2A', '#4A2C1A', '#D4537E'],
  fabric: ['#7F77DD', '#1D9E75', '#D4537E', '#EF9F27', '#378ADD', '#E24B4A'],
  makeup: ['#E8899B', '#DE5C7E', '#C63F5A', '#9E3B5C', '#E5A183', '#B5566E'],
} as const satisfies Record<Palette, readonly string[]>;

/**
 * Colours that are never recoloured by the child (SPEC section 9). The contract
 * test uses this set to tell a deliberate constant from a hardcoded tone.
 */
export const FIXED_COLORS = {
  eye: '#3B2418',
  eyeHighlight: '#FBFBF9',
  collarWhite: '#FBFBF9',
} as const;

/** Blush is applied through opacity, never through a new colour. */
export const BLUSH_OPACITY = 0.45;

/**
 * The colours a place paints with that the child does not choose.
 *
 * The counterpart of `FIXED_COLORS`, for the world rather than the face, and
 * granted for the same reason: a house derived from the colour of the grass is
 * a green house. She still picks one colour per place — the land, the wall, the
 * sky — and everything that has to be recognisable regardless is drawn.
 *
 * Kept as small as it can be. A trunk and a door are the same brown on purpose:
 * a second brown would be a colour nobody could tell from the first.
 */
export const WORLD_COLORS = {
  wall: '#F5E9DA',
  roof: '#C4553F',
  wood: '#8A5A38',
  pane: '#BBD9F2',
  leaf: '#3E8E5A',
} as const;

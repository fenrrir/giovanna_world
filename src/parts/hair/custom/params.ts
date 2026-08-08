import type { PartParams } from '../../../model/types';

/**
 * The axes of the hairstyle the child builds for herself.
 *
 * Continuous axes are normalised 0..1 so the panel never has to know what a
 * value means in user units, and the geometry stays free to reinterpret the
 * range without touching a stored look. Colour is deliberately not an axis: it
 * is passed to the component instead, which multiplies the catalogue without
 * duplicating a single parameter.
 */
export type HairParams = {
  length: number;
  volume: number;
  wave: number;
  fringe: Fringe;
};

/** Where the fringe falls. English symbols; the words she reads live in ptBR. */
export type Fringe = 'none' | 'straight' | 'side' | 'curtain';

export const FRINGES: readonly Fringe[] = ['none', 'straight', 'side', 'curtain'];

/** The continuous axes, in the order the panel shows them. */
export const HAIR_AXES = ['length', 'volume', 'wave'] as const;

export type HairAxis = (typeof HAIR_AXES)[number];

export const DEFAULT_HAIR_PARAMS: HairParams = {
  length: 0.5,
  volume: 0.5,
  wave: 0.4,
  fringe: 'straight',
};

/** What `localStorage` can hand back for one axis: anything, or nothing. */
type Stored = number | string | undefined;

const clamp01 = (value: Stored, fallback: number): number =>
  typeof value === 'number' && Number.isFinite(value) ? Math.min(1, Math.max(value, 0)) : fallback;

const toFringe = (value: Stored): Fringe =>
  FRINGES.find((fringe) => fringe === value) ?? DEFAULT_HAIR_PARAMS.fringe;

/**
 * Stored axes, repaired.
 *
 * Total by construction — it has no failing branch. A value out of range or of
 * the wrong type costs the child a slider position, never her hairstyle, which
 * is the same silent repair every other read performs (SPEC section 14). It is
 * also the only guard the geometry has: every builder can then assume 0..1 and
 * emit no `NaN`.
 */
export const toHairParams = (raw?: PartParams): HairParams => ({
  length: clamp01(raw?.length, DEFAULT_HAIR_PARAMS.length),
  volume: clamp01(raw?.volume, DEFAULT_HAIR_PARAMS.volume),
  wave: clamp01(raw?.wave, DEFAULT_HAIR_PARAMS.wave),
  fringe: toFringe(raw?.fringe),
});

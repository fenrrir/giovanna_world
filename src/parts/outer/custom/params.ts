import type { PartParams } from '../../../model/types';

/**
 * The axes of the jacket the child builds for herself.
 *
 * Same shape as the hairstyle's axes, and deliberately not sharing a type with
 * them: two slots agreeing by coincidence is not yet an abstraction, and the
 * one thing they genuinely share — repairing whatever localStorage hands back —
 * is four lines either side (PROGRESS: the second slot is what reveals it).
 *
 * Continuous axes are normalised 0..1 so the panel never has to know what a
 * value means in user units, and the geometry stays free to reinterpret the
 * range without touching a stored look.
 */
export type OuterParams = {
  length: number;
  sleeve: number;
  collar: Collar;
};

/** How the jacket finishes at the neck. English symbols; her words live in ptBR. */
export type Collar = 'none' | 'round' | 'hood';

export const COLLARS: readonly Collar[] = ['none', 'round', 'hood'];

/** The continuous axes, in the order the panel shows them. */
export const OUTER_AXES = ['length', 'sleeve'] as const;

export type OuterAxis = (typeof OUTER_AXES)[number];

export const DEFAULT_OUTER_PARAMS: OuterParams = {
  length: 0.45,
  sleeve: 0.8,
  collar: 'round',
};

/** What `localStorage` can hand back for one axis: anything, or nothing. */
type Stored = number | string | undefined;

const clamp01 = (value: Stored, fallback: number): number =>
  typeof value === 'number' && Number.isFinite(value) ? Math.min(1, Math.max(value, 0)) : fallback;

const toCollar = (value: Stored): Collar =>
  COLLARS.find((collar) => collar === value) ?? DEFAULT_OUTER_PARAMS.collar;

/**
 * Stored axes, repaired.
 *
 * Total by construction — it has no failing branch. A value out of range or of
 * the wrong type costs the child a slider position, never her jacket, which is
 * the same silent repair every other read performs (SPEC section 14). It is
 * also the only guard the geometry has: every builder can then assume 0..1 and
 * emit no `NaN`.
 */
export const toOuterParams = (raw?: PartParams): OuterParams => ({
  length: clamp01(raw?.length, DEFAULT_OUTER_PARAMS.length),
  sleeve: clamp01(raw?.sleeve, DEFAULT_OUTER_PARAMS.sleeve),
  collar: toCollar(raw?.collar),
});

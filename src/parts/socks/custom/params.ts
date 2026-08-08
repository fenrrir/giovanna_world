import type { PartParams } from '../../../model/types';

/**
 * The axes of the socks the child builds for herself.
 *
 * One continuous axis and one discrete choice, the third family to come out
 * that shape. The pattern is a choice rather than an axis because there is no
 * order to walk along between dots and stripes — a slider between them would
 * have to stop somewhere in the middle and draw nothing.
 */
export type SocksParams = {
  height: number;
  pattern: Pattern;
};

/** What is printed on them. English symbols; her words live in ptBR. */
export type Pattern = 'plain' | 'stripes' | 'dots';

export const PATTERNS: readonly Pattern[] = ['plain', 'stripes', 'dots'];

/** The continuous axes, in the order the panel shows them. */
export const SOCKS_AXES = ['height'] as const;

export const DEFAULT_SOCKS_PARAMS: SocksParams = {
  height: 0.3,
  pattern: 'stripes',
};

/** What `localStorage` can hand back for one axis: anything, or nothing. */
type Stored = number | string | undefined;

const clamp01 = (value: Stored, fallback: number): number =>
  typeof value === 'number' && Number.isFinite(value) ? Math.min(1, Math.max(value, 0)) : fallback;

const toPattern = (value: Stored): Pattern =>
  PATTERNS.find((pattern) => pattern === value) ?? DEFAULT_SOCKS_PARAMS.pattern;

/**
 * Stored axes, repaired.
 *
 * Total by construction, like every other family's: a value out of range or of
 * the wrong type costs the child a slider position, never her socks (SPEC
 * section 14). It is also the only guard the geometry has.
 */
export const toSocksParams = (raw?: PartParams): SocksParams => ({
  height: clamp01(raw?.height, DEFAULT_SOCKS_PARAMS.height),
  pattern: toPattern(raw?.pattern),
});

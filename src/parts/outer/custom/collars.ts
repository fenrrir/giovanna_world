import type { Collar } from './params';

/**
 * How the jacket finishes at the neck.
 *
 * Each collar starts a little below the neckline rather than level with it.
 * The panel's own top edge slopes away from the neck towards the shoulder, so
 * ends drawn level with it stand a few pixels clear of the jacket and read as
 * two horns — visible only on sight.
 *
 * Each collar is a closed path below the chin. None of them may rise above the
 * jaw: `outer` paints at z 60, over the body, so anything drawn across the head
 * would cover her face rather than sit behind it. The hood is a roll lying back
 * on the shoulders for the same reason — a hood over the head is not available
 * to a layer painted this late.
 */

export type CollarFrame = {
  cx: number;
  /** The neckline: where the collar meets the jacket. */
  top: number;
  neckLeft: number;
  neckRight: number;
};

const p = (...values: number[]): string =>
  values.map((value) => String(Math.round(value))).join(' ');

/** A band following the neckline, a little wider than the neck itself. */
/** How far below the neckline a collar's ends tuck under the panel. */
const TUCK = 6;

const round = ({ top, neckLeft, neckRight }: CollarFrame): string => {
  const out = 8;
  const deep = 18;
  const y = top + TUCK;

  return [
    `M ${p(neckLeft - out, y)}`,
    `C ${p(neckLeft - out, y + deep, neckRight + out, y + deep, neckRight + out, y)}`,
    `C ${p(neckRight, y + deep - 7, neckLeft, y + deep - 7, neckLeft - out, y)}`,
    'Z',
  ].join(' ');
};

/** A hood pushed back, resting across the shoulders behind the neck. */
const hood = ({ cx, top, neckLeft, neckRight }: CollarFrame): string => {
  const out = 22;
  const deep = 26;
  const y = top + TUCK;

  return [
    `M ${p(neckLeft - out, y)}`,
    `C ${p(neckLeft - out, y + deep, cx - 22, y + deep + 4, cx, y + deep + 4)}`,
    `C ${p(cx + 22, y + deep + 4, neckRight + out, y + deep, neckRight + out, y)}`,
    `C ${p(neckRight, y + 10, neckLeft, y + 10, neckLeft - out, y)}`,
    'Z',
  ].join(' ');
};

const SHAPES: Record<Collar, ((frame: CollarFrame) => string) | null> = {
  none: null,
  round,
  hood,
};

/** The collar's outline, or nothing at all when she has chosen none. */
export const collarPath = (collar: Collar, frame: CollarFrame): string | null =>
  SHAPES[collar]?.(frame) ?? null;

import { ANCHORS, type Box } from '../../../anchors';
import type { SocksParams } from './params';

/**
 * The anchors the socks read, and the only geometry the builders are given.
 *
 * A structural subset rather than the whole of ANCHORS, so the builders declare
 * exactly what they depend on and a test can hand them a shifted body to prove
 * nothing was retyped (CLAUDE.md: import the anchors, never a coordinate).
 */
export type SocksAnchors = {
  legLeft: { x1: number; x2: number };
  legRight: { x1: number; x2: number };
  ankle: { y: number };
  sole: { y: number };
  shoeLeft: { y1: number };
  hip: { y: number };
};

/*
 * Style constants. Every one is a relative offset or a proportion — never a
 * position — so they may live here rather than in the anchors module.
 */

/** How far past the leg a sock sits, so no skin shows down its edge. */
const COVER = 2;
/** How far above the ankle even the shortest setting reaches. */
const CUFF_MIN = 12;
/** Where the tallest setting stops, as a share of the way from hip to ankle. */
const KNEE_SHARE = 0.18;
/** The band at the top, one tone down, so a sock has a cuff. */
const CUFF = 8;
/**
 * How far up the toe curves.
 *
 * The body's own foot is rounded here and so is the shoe's sole. A sock ending
 * in a square corner escapes past both of them along the bottom edge — a green
 * hairline under the shoe, which no assertion sees and sight catches at once.
 */
const TOE = 8;

/** +1 draws the doll's right sock, -1 its left. */
export type Side = 1 | -1;

const p = (...values: number[]): string =>
  values.map((value) => String(Math.round(value))).join(' ');

/**
 * The box a sock occupies, which is also the box its pattern is generated into.
 *
 * The bottom is the sole rather than the top of the shoe: socks paint at z 20,
 * under the shoes at z 30, so the foot has to be covered even though nothing of
 * it will show. Cut at the shoe instead, a bare ankle appears the moment she
 * takes the shoes off.
 */
export const sockBox = (side: Side, { height }: SocksParams, a: SocksAnchors = ANCHORS): Box => {
  const leg = side < 0 ? a.legLeft : a.legRight;
  const shortest = a.ankle.y + CUFF_MIN;
  const tallest = a.hip.y + (a.ankle.y - a.hip.y) * KNEE_SHARE;
  const top = shortest - height * (shortest - tallest);

  return {
    x: leg.x1 - COVER,
    y: top,
    width: leg.x2 - leg.x1 + COVER * 2,
    height: a.sole.y - top,
  };
};

export const sockPath = (side: Side, params: SocksParams, a: SocksAnchors = ANCHORS): string => {
  const box = sockBox(side, params, a);
  const x2 = box.x + box.width;
  const foot = box.y + box.height;

  return [
    `M ${p(box.x, box.y)}`,
    `L ${p(x2, box.y)}`,
    `L ${p(x2, foot - TOE)}`,
    `C ${p(x2, foot, box.x, foot, box.x, foot - TOE)}`,
    'Z',
  ].join(' ');
};

/** The cuff at the top, so the sock ends on the leg rather than just stopping. */
export const cuffPath = (side: Side, params: SocksParams, a: SocksAnchors = ANCHORS): string => {
  const box = sockBox(side, params, a);

  return [
    `M ${p(box.x, box.y)}`,
    `L ${p(box.x + box.width, box.y)}`,
    `L ${p(box.x + box.width, box.y + CUFF)}`,
    `L ${p(box.x, box.y + CUFF)}`,
    'Z',
  ].join(' ');
};

/** The band of a sock the pattern is printed on: below the cuff, above the shoe. */
export const printBox = (side: Side, params: SocksParams, a: SocksAnchors = ANCHORS): Box => {
  const box = sockBox(side, params, a);
  const top = box.y + CUFF;

  return { x: box.x, y: top, width: box.width, height: Math.max(a.shoeLeft.y1 - top, 0) };
};

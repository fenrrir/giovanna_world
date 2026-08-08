import { ANCHORS } from '../../../anchors';
import { collarPath } from './collars';
import type { OuterParams } from './params';

/**
 * The anchors the jacket reads, and the only geometry the builders are given.
 *
 * A structural subset rather than the whole of ANCHORS, so the builders declare
 * exactly what they depend on and a test can hand them a shifted body to prove
 * nothing was retyped (CLAUDE.md: import the anchors, never a coordinate).
 */
export type OuterAnchors = {
  shoulderLeft: { y: number };
  torso: { x1: number; x2: number; y1: number };
  waist: { y: number };
  hip: { y: number };
  armLeft: { x1: number; x2: number; y1: number; y2: number };
  armRight: { x1: number; x2: number; y1: number; y2: number };
  neckBase: { x1: number; x2: number };
};

/*
 * Style constants. Every one is a relative offset or a proportion — never a
 * position — so they may live here rather than in the anchors module.
 */

/** How far past the hip the longest setting falls. */
const HEM_GAIN = 34;
/** How far below the shoulder even the shortest sleeve reaches: a cap. */
const SLEEVE_MIN = 20;
/**
 * How far past the arm a sleeve sits, and past the torso a panel sits.
 *
 * A jacket is worn over a top, so it has to be wider than what it covers or the
 * layer beneath shows at the seam — the same rule that cost the first shoes a
 * strip of bare foot (CLAUDE.md: derive the edge from the limb's anchor).
 */
const OVERHANG = 5;
const SIDE_COVER = 4;
/** Half the opening down the front, where the top underneath shows through. */
const PANEL_GAP = 9;
/** How far the jacket rides above the shoulder line. */
const SHOULDER_RISE = 4;
/** How far down the opening the lapel cuts back towards the neck. */
const LAPEL = 16;
/**
 * How deep the shoulder cap runs before the panel steps back to the torso.
 *
 * The cap has to reach the outer edge of the arm. Cut at the torso instead, the
 * panel meets a sloped shoulder with a square one and the top underneath shows
 * through the triangle between them — invisible to every assertion in the
 * contract, and the first thing sight catches.
 */
const CAP = 12;
/** The band at the cuff and the hem, in the fold tone. */
const BAND = 7;

const p = (...values: number[]): string =>
  values.map((value) => String(Math.round(value))).join(' ');

/** What every builder derives before drawing anything. */
export type OuterFrame = {
  cx: number;
  shoulderY: number;
  hemY: number;
  sleeveEnd: number;
  top: number;
};

export const frameOf = ({ length, sleeve }: OuterParams, a: OuterAnchors): OuterFrame => ({
  cx: (a.torso.x1 + a.torso.x2) / 2,
  shoulderY: a.shoulderLeft.y - SHOULDER_RISE,
  hemY: a.waist.y + length * (a.hip.y + HEM_GAIN - a.waist.y),
  sleeveEnd: a.armLeft.y1 + SLEEVE_MIN + sleeve * (a.armLeft.y2 - a.armLeft.y1 - SLEEVE_MIN),
  top: a.torso.y1,
});

/** +1 draws the doll's right side, -1 its left. */
export type Side = 1 | -1;

/**
 * One front panel, shoulder to hem, stopping short of the centre.
 *
 * The gap is the whole point of the slot: closed across the front it would be
 * another top, and the child would have dressed the doll twice in the same
 * thing.
 */
export const panelPath = (side: Side, params: OuterParams, a: OuterAnchors = ANCHORS): string => {
  const f = frameOf(params, a);
  const arm = side < 0 ? a.armLeft : a.armRight;
  const shoulderEdge = side < 0 ? arm.x1 - OVERHANG : arm.x2 + OVERHANG;
  const outer = side < 0 ? a.torso.x1 - SIDE_COVER : a.torso.x2 + SIDE_COVER;
  const neck = side < 0 ? a.neckBase.x1 : a.neckBase.x2;
  const inner = f.cx + side * PANEL_GAP;

  return [
    `M ${p(neck, f.top)}`,
    `L ${p(shoulderEdge, f.shoulderY)}`,
    `L ${p(shoulderEdge, f.shoulderY + CAP)}`,
    `L ${p(outer, f.shoulderY + CAP)}`,
    `L ${p(outer, f.hemY)}`,
    `L ${p(inner, f.hemY)}`,
    `L ${p(inner, f.top + LAPEL)}`,
    'Z',
  ].join(' ');
};

/** One sleeve, covering the arm from the shoulder to wherever it ends. */
export const sleevePath = (side: Side, params: OuterParams, a: OuterAnchors = ANCHORS): string => {
  const f = frameOf(params, a);
  const arm = side < 0 ? a.armLeft : a.armRight;
  const x1 = arm.x1 - OVERHANG;
  const x2 = arm.x2 + OVERHANG;

  return [
    `M ${p(x1, f.shoulderY)}`,
    `L ${p(x2, f.shoulderY)}`,
    `L ${p(x2, f.sleeveEnd - BAND)}`,
    `L ${p(x1, f.sleeveEnd - BAND)}`,
    'Z',
  ].join(' ');
};

/** The cuff, rounded at the bottom because a sleeve ends on an arm. */
export const cuffPath = (side: Side, params: OuterParams, a: OuterAnchors = ANCHORS): string => {
  const f = frameOf(params, a);
  const arm = side < 0 ? a.armLeft : a.armRight;
  const x1 = arm.x1 - OVERHANG;
  const x2 = arm.x2 + OVERHANG;
  const topY = f.sleeveEnd - BAND;

  return [
    `M ${p(x1, topY)}`,
    `L ${p(x2, topY)}`,
    `L ${p(x2, f.sleeveEnd - 4)}`,
    `C ${p(x2, f.sleeveEnd + 3, x1, f.sleeveEnd + 3, x1, f.sleeveEnd - 4)}`,
    'Z',
  ].join(' ');
};

/** The band along the hem, one tone down, so the jacket has a bottom edge. */
export const hemPath = (side: Side, params: OuterParams, a: OuterAnchors = ANCHORS): string => {
  const f = frameOf(params, a);
  const outer = side < 0 ? a.torso.x1 - SIDE_COVER : a.torso.x2 + SIDE_COVER;
  const inner = f.cx + side * PANEL_GAP;

  return [
    `M ${p(outer, f.hemY - BAND)}`,
    `L ${p(inner, f.hemY - BAND)}`,
    `L ${p(inner, f.hemY)}`,
    `L ${p(outer, f.hemY)}`,
    'Z',
  ].join(' ');
};

/** The collar, or nothing at all when she has chosen none. */
export const collarShape = (params: OuterParams, a: OuterAnchors = ANCHORS): string | null => {
  const f = frameOf(params, a);

  return collarPath(params.collar, {
    cx: f.cx,
    top: f.top,
    neckLeft: a.neckBase.x1,
    neckRight: a.neckBase.x2,
  });
};

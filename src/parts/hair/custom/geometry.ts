import { ANCHORS } from '../../../anchors';
import { fringeEdge } from './fringes';
import type { HairParams } from './params';

/**
 * The anchors the hair reads, and the only geometry the builders are given.
 *
 * A structural subset rather than the whole of ANCHORS, so the builders declare
 * exactly what they depend on and a test can hand them a shifted body to prove
 * nothing was retyped (CLAUDE.md: import the anchors, never a coordinate).
 */
export type HairAnchors = {
  skullTop: { x: number; y: number };
  headCenter: { x: number; y: number; r: number };
  eyeLine: { y: number };
  chin: { y: number };
  neckBase: { y: number };
  hip: { y: number };
};

/*
 * Style constants. Every one is a relative offset or a proportion — never a
 * position — so they may live here rather than in the anchors module.
 */

/** How far above the skull the crown of the hair sits. */
const CROWN_LIFT = 10;
/** How much wider than the head the back mass gets at full volume. */
const VOLUME_GAIN = 26;
/** How much wider than the head the front layer gets at full volume. */
const FRONT_GAIN = 8;
/** How far past the hip the longest setting falls. */
const LENGTH_GAIN = 40;
/** How deep the hem scallops at full wave. */
const WAVE_DEPTH = 26;
/** The band of hair that frames the face, temple to face edge. */
const TEMPLE = 18;
/** How far below the chin the front layer runs down the sides of the face. */
const JAW_DROP = 10;

const round = (value: number): number => Math.round(value);

const move = (x: number, y: number): string => `M ${String(round(x))} ${String(round(y))}`;

const line = (x: number, y: number): string => `L ${String(round(x))} ${String(round(y))}`;

const curve = (...points: number[]): string =>
  `C ${points.map((value) => String(round(value))).join(' ')}`;

/** What every builder derives before drawing anything. */
type Frame = {
  cx: number;
  crown: number;
  temple: number;
  hemY: number;
  w: number;
  wh: number;
  dip: number;
  corner: number;
};

const frameOf = ({ length, volume, wave }: HairParams, a: HairAnchors): Frame => {
  const w = a.headCenter.r + round(volume * VOLUME_GAIN);
  /*
   * Narrows towards the hem, and the further it falls the more it narrows.
   * Held at full width all the way down, long hair at full volume stops
   * reading as hair: it becomes a slab wider than the shoulders with the doll
   * sitting inside it.
   */
  const wh = w - round(w * (0.12 + length * 0.22));

  return {
    cx: a.headCenter.x,
    crown: a.skullTop.y - CROWN_LIFT,
    temple: a.headCenter.y,
    hemY: a.neckBase.y + round(length * (a.hip.y - a.neckBase.y + LENGTH_GAIN)),
    w,
    wh,
    dip: round(wave * WAVE_DEPTH),
    corner: round(wh * 0.3),
  };
};

/**
 * The scalloped hem, right edge to left, entered and left at `hemY - corner`.
 *
 * The corners are rounded here rather than at the side edges, so the silhouette
 * and the fold band cannot round them differently and part company.
 */
const hem = ({ cx, hemY, wh, dip, corner }: Frame): string =>
  [
    curve(cx + wh, hemY - corner * 0.45, cx + wh - corner * 0.45, hemY, cx + wh - corner, hemY),
    curve(cx + wh * 0.45, hemY + dip, cx + wh * 0.2, hemY + dip, cx, hemY + dip * 0.55),
    curve(cx - wh * 0.2, hemY + dip, cx - wh * 0.45, hemY + dip, cx - wh + corner, hemY),
    curve(cx - wh + corner * 0.45, hemY, cx - wh, hemY - corner * 0.45, cx - wh, hemY - corner),
  ].join(' ');

/**
 * The mass of hair behind the head.
 *
 * Solid: it renders behind the doll, so the body already occludes whatever
 * should be hidden and cutting a notch for the neck would only risk a hole.
 */
export const hairBackPath = (params: HairParams, a: HairAnchors = ANCHORS): string => {
  const frame = frameOf(params, a);
  const { cx, crown, temple, hemY, w, wh, corner } = frame;
  const drop = round((hemY - temple) * 0.4);

  return [
    move(cx - w, temple),
    curve(cx - w, crown + 20, cx - w * 0.62, crown, cx, crown),
    curve(cx + w * 0.62, crown, cx + w, crown + 20, cx + w, temple),
    curve(cx + w, temple + drop, cx + wh, hemY - drop, cx + wh, hemY - corner),
    hem(frame),
    curve(cx - wh, hemY - drop, cx - w, temple + drop, cx - w, temple),
    'Z',
  ].join(' ');
};

/**
 * The lower band of the back mass, painted one tone down.
 *
 * It shares the hem and the side edges with the silhouette exactly, so the two
 * cannot part company and leave a sliver of background between them.
 */
export const hairFoldPath = (params: HairParams, a: HairAnchors = ANCHORS): string => {
  const frame = frameOf(params, a);
  const { cx, temple, hemY, wh, corner } = frame;
  const foldY = temple + round((hemY - temple) * 0.55);
  const arc = round((hemY - foldY) * 0.18);
  const q = round((hemY - foldY) * 0.3);

  return [
    move(cx - wh, foldY),
    curve(cx - wh * 0.45, foldY + arc, cx + wh * 0.45, foldY + arc, cx + wh, foldY),
    curve(cx + wh, foldY + q, cx + wh, hemY - q, cx + wh, hemY - corner),
    hem(frame),
    curve(cx - wh, hemY - q, cx - wh, foldY + q, cx - wh, foldY),
    'Z',
  ].join(' ');
};

/** The front layer: one shape framing the face, with the fringe as its inner edge. */
export const hairFrontPath = (params: HairParams, a: HairAnchors = ANCHORS): string => {
  const cx = a.headCenter.x;
  const crown = a.skullTop.y - CROWN_LIFT;
  const sideY = a.chin.y + JAW_DROP;
  const h = sideY - crown;
  const wf = a.headCenter.r + round(params.volume * FRONT_GAIN);
  const wi = wf - TEMPLE - round(params.volume * 4);
  const { right, left, across } = fringeEdge(params.fringe, {
    cx,
    wi,
    crown,
    h,
    eyeY: a.eyeLine.y,
  });

  return [
    move(cx - wf, sideY),
    curve(
      cx - wf - 4,
      crown + h * 0.7,
      cx - wf + 2,
      crown + h * 0.26,
      cx - wf * 0.86,
      crown + h * 0.15,
    ),
    curve(cx - wf * 0.63, crown + h * 0.03, cx - wf * 0.34, crown, cx, crown),
    curve(
      cx + wf * 0.34,
      crown,
      cx + wf * 0.63,
      crown + h * 0.03,
      cx + wf * 0.86,
      crown + h * 0.15,
    ),
    curve(cx + wf - 2, crown + h * 0.26, cx + wf + 4, crown + h * 0.7, cx + wf, sideY),
    /*
     * The inner edge comes back down to the same height as the outer one, so
     * each side ends as a strand of its own width with a flat foot. Running it
     * back to the outer edge instead closes the shape across the jaw: the chin
     * and both cheeks disappear under the hair, and because a single Z can only
     * shut one of the two feet the strands come out different shapes — the
     * mirror has to be written out on both sides (CLAUDE.md).
     */
    line(cx + wi, sideY),
    curve(cx + wi + 2, right + h * 0.35, cx + wi + 4, right + h * 0.12, cx + wi, right),
    across,
    curve(cx - wi - 4, left + h * 0.12, cx - wi - 2, left + h * 0.35, cx - wi, sideY),
    'Z',
  ].join(' ');
};

/**
 * A single lit strand over the crown (SPEC section 9).
 *
 * Drawn as a stroke rather than a fill, which is why it alone is left open.
 */
export const hairStrandPath = (params: HairParams, a: HairAnchors = ANCHORS): string => {
  const cx = a.headCenter.x;
  const crown = a.skullTop.y - CROWN_LIFT;
  const h = a.chin.y + JAW_DROP - crown;
  const wf = a.headCenter.r + round(params.volume * FRONT_GAIN);

  return [
    move(cx - wf * 0.4, crown + h * 0.11),
    curve(
      cx - wf * 0.1,
      crown + h * 0.03,
      cx + wf * 0.16,
      crown + h * 0.05,
      cx + wf * 0.34,
      crown + h * 0.15,
    ),
  ].join(' ');
};

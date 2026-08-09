import { ANCHORS, VIEW_BOX } from '../anchors';

/**
 * Where a doll stands in a room, as a transform on her own canvas.
 *
 * A room and a doll are drawn on the same 680×540 contract, so putting one
 * inside the other is a translate and a scale rather than a second coordinate
 * system. Pure and string-returning for the same reason the part builders are:
 * it can be checked without a DOM, and the preview tool can use it too.
 */

/** Where her feet rest in a room, and how tall she stands in it. */
export type Floor = { y: number; scale: number };

/**
 * Only what the maths needs, so the anchors can be injected.
 *
 * The whole doll is not the dependency — her feet and her width are. Declaring
 * that is what lets the anchor test hand in a body drawn somewhere else.
 */
type BodyAnchors = {
  sole: { y: number };
  dollBounds: { x1: number; x2: number };
};

/** Two decimals is finer than a pixel here, and keeps float noise out of the DOM. */
const round = (value: number): number => Math.round(value * 100) / 100;

const across = (x: number): number => Math.min(Math.max(x, 0), 1);

/**
 * Her transform in a room, from how far across it she was put.
 *
 * `x` runs over where her *centre* may be rather than over the canvas, so 0 is
 * as far left as she fits and 1 as far right. That is what keeps the clamp
 * honest at any scale: a plain 0..1 across the canvas would leave half of her
 * outside it at either end, and the room would have to know how wide she is.
 */
export const dollTransform = (floor: Floor, x: number, anchors: BodyAnchors = ANCHORS): string => {
  const half = (anchors.dollBounds.x2 - anchors.dollBounds.x1) / 2;
  const middle = (anchors.dollBounds.x1 + anchors.dollBounds.x2) / 2;

  const centre = half * floor.scale + across(x) * (VIEW_BOX.width - 2 * half * floor.scale);
  const dx = round(centre - middle * floor.scale);
  const dy = round(floor.y - anchors.sole.y * floor.scale);

  return `translate(${String(dx)} ${String(dy)}) scale(${String(round(floor.scale))})`;
};

/** The rectangle a laid-out canvas occupies on screen. */
export type Box = { left: number; top: number; width: number; height: number };

/**
 * Where a finger is, in canvas units.
 *
 * `preserveAspectRatio="xMidYMid meet"` letterboxes the drawing inside its box,
 * so the element's own rectangle is not the canvas: measuring against it would
 * put her a little further right than the child let go, by however much empty
 * space is down the side. This is the same fit the browser does, undone.
 */
export const canvasX = (clientX: number, box: Box): number => {
  const fit = Math.min(box.width / VIEW_BOX.width, box.height / VIEW_BOX.height);
  const empty = (box.width - VIEW_BOX.width * fit) / 2;

  return (clientX - box.left - empty) / fit;
};

/**
 * How far across a floor a point is, as the model stores it.
 *
 * The exact inverse of the placement `dollTransform` reads, so a doll dropped
 * somewhere is drawn back under the finger that dropped her. It runs over where
 * her centre may be rather than across the canvas, which is what keeps the ends
 * meaning "as far left as she fits" at any size.
 */
export const acrossFloor = (floor: Floor, at: number, anchors: BodyAnchors = ANCHORS): number => {
  const half = (anchors.dollBounds.x2 - anchors.dollBounds.x1) / 2;
  const band = VIEW_BOX.width - 2 * half * floor.scale;

  return across((at - half * floor.scale) / band);
};

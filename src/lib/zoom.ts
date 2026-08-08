import { ANCHORS, VIEW_BOX } from '../anchors';

/**
 * How close the child can pull the view in.
 *
 * The canvas is much wider than the doll — the lateral margin is deliberate
 * (SPEC section 8) — so on a tall stage the doll ends up small with empty space
 * either side. Zooming crops that margin away rather than scaling the drawing:
 * the height never changes, so the doll can never be cut off at the head or the
 * feet however far the slider is pushed.
 *
 * Working in the viewBox rather than a CSS transform also keeps the browser's
 * hit testing exact, which is what decides the piece a finger pulls off.
 */

const DOLL_WIDTH = ANCHORS.dollBounds.x2 - ANCHORS.dollBounds.x1;
const DOLL_CENTRE = (ANCHORS.dollBounds.x1 + ANCHORS.dollBounds.x2) / 2;

export const MIN_ZOOM = 1;
/** The zoom at which the canvas is exactly the doll's own width. */
export const MAX_ZOOM = VIEW_BOX.width / DOLL_WIDTH;
/**
 * Forty stops between the two ends. Derived rather than picked, because a range
 * input snaps to its steps: a step that does not divide the interval leaves the
 * last one unreachable, and the closest zoom is exactly the one worth reaching.
 */
export const ZOOM_STEP = (MAX_ZOOM - MIN_ZOOM) / 40;
export const DEFAULT_ZOOM = MIN_ZOOM;

/** Two decimals is finer than a pixel here, and keeps float noise out of the DOM. */
const round = (value: number): number => Math.round(value * 100) / 100;

const clamp = (zoom: number): number => Math.min(Math.max(zoom, MIN_ZOOM), MAX_ZOOM);

export const zoomedViewBox = (zoom: number): string => {
  const width = round(VIEW_BOX.width / clamp(zoom));
  const x = round(DOLL_CENTRE - width / 2);

  return `${String(x)} 0 ${String(width)} ${String(VIEW_BOX.height)}`;
};

import { ANCHORS, VIEW_BOX } from '../anchors';

/**
 * How close the child can pull the view in.
 *
 * The canvas is much wider than the doll — the lateral margin is deliberate
 * (SPEC section 8) — so on a tall stage the doll starts small with empty space
 * either side. Zooming crops the canvas around the doll's centre.
 *
 * It crops both ways, and it has to. Cropping width alone stops doing anything
 * the moment the viewBox is as tall-and-narrow as the stage: past that point
 * the drawing is bound by height and the rest of the slider's travel changes
 * nothing. That was about the first third of it.
 *
 * Working in the viewBox rather than a CSS transform also keeps the browser's
 * hit testing exact, which is what decides the piece a finger pulls off.
 */

const DOLL_WIDTH = ANCHORS.dollBounds.x2 - ANCHORS.dollBounds.x1;
const DOLL_CENTRE = (ANCHORS.dollBounds.x1 + ANCHORS.dollBounds.x2) / 2;
const CANVAS_CENTRE_Y = VIEW_BOX.height / 2;

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
  const factor = clamp(zoom);
  const width = round(VIEW_BOX.width / factor);
  const height = round(VIEW_BOX.height / factor);
  const x = round(DOLL_CENTRE - width / 2);
  const y = round(CANVAS_CENTRE_Y - height / 2);

  return `${String(x)} ${String(y)} ${String(width)} ${String(height)}`;
};

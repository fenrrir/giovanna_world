/**
 * The canvas contract (SPEC section 8).
 *
 * Every part is drawn against these coordinates. Import them; never retype a
 * coordinate in a part file, or the anchors and the artwork will drift apart.
 */

/** A rectangular region of the canvas, in user units. */
export type Box = { x: number; y: number; width: number; height: number };

/** Contractual. No part may change it. */
export const VIEW_BOX = { width: 680, height: 540 } as const;

export const VIEW_BOX_ATTR = '0 0 680 540';

export const ANCHORS = {
  /** The doll occupies this horizontal band. The lateral margin is deliberate. */
  dollBounds: { x1: 234, x2: 446 },

  skullTop: { x: 340, y: 68 },
  headCenter: { x: 340, y: 130, r: 62 },
  eyeLine: { y: 136, xLeft: 318, xRight: 362 },
  chin: { x: 340, y: 192 },
  neckBase: { y: 198, x1: 322, x2: 358 },

  shoulderLeft: { x: 282, y: 216 },
  shoulderRight: { x: 398, y: 216 },
  armLeft: { x1: 266, x2: 294, y1: 212, y2: 338 },
  armRight: { x1: 386, x2: 414, y1: 212, y2: 338 },
  handLeft: { x: 280, y: 344, r: 16 },
  handRight: { x: 400, y: 344, r: 16 },

  torso: { x1: 288, x2: 392, y1: 194, y2: 334, rx: 30 },
  waist: { y: 280, x1: 284, x2: 396, height: 18 },
  hip: { y: 330 },

  legLeft: { x1: 306, x2: 336 },
  legRight: { x1: 344, x2: 374 },
  ankle: { y: 440 },
  sole: { y: 494 },
  shoeLeft: { x1: 296, x2: 344, y1: 464, y2: 494 },
  shoeRight: { x1: 336, x2: 384, y1: 464, y2: 494 },

  /** Reference only: where a flared skirt is expected to end. */
  skirtHem: { y: 398, x1: 234, x2: 446 },

  headAccessorySide: { x: 406, y: 87 },
  headAccessoryCenter: { x: 340, y: 66 },
} as const;

/**
 * The region a thumbnail zooms into, per tray.
 *
 * Derived from the anchors above rather than measured by hand, so a shoe fills
 * its thumbnail instead of sitting as a dot in the corner. The part itself is
 * still the single source of truth — this only supplies a transform.
 */
export const THUMB_FOCUS = {
  hair: { x: 258, y: 40, width: 164, height: 190 },
  top: { x: 254, y: 186, width: 172, height: 170 },
  bottom: { x: 262, y: 270, width: 156, height: 190 },
  shoes: { x: 286, y: 430, width: 108, height: 80 },
} as const satisfies Record<string, Box>;

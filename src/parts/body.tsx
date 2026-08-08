import type { ReactNode } from 'react';

import { ANCHORS } from '../anchors';
import { shade } from '../lib/color';
import { FIXED_COLORS } from '../model/palettes';
import type { Part } from '../model/types';

/**
 * The doll itself.
 *
 * Not optional and not variable: the body has no part alternatives in the MVP
 * and changes only with the skin tone (SPEC section 7). Every coordinate comes
 * from ANCHORS — nothing here is a free-hand number.
 *
 * Limbs are a shade off the torso rather than the same flat fill. Without that
 * separation the arms merge into the torso and the silhouette reads as one
 * wide block instead of a body.
 */

const { headCenter, eyeLine, chin, neckBase, torso } = ANCHORS;
const { armLeft, armRight, handLeft, handRight } = ANCHORS;
const { legLeft, legRight, hip, sole } = ANCHORS;

/** Limb separation and foot shading: subtle, derived, never hardcoded. */
const LIMB = 0.95;
const RECESS = 0.9;

const EYE_RADIUS = 7;
const HIGHLIGHT_RADIUS = 4;
const HIGHLIGHT_OFFSET = 3;
const LIMB_RADIUS = 13;
const FOOT_TOP = 468;

const rounded = (x1: number, x2: number, y1: number, y2: number, fill: string): ReactNode => (
  <rect x={x1} y={y1} width={x2 - x1} height={y2 - y1} rx={LIMB_RADIUS} fill={fill} />
);

/**
 * The eyes, and only the eyes. Brows, mouth and cheeks are their own slots now,
 * because the child picks their colour; what stays here is what she does not
 * choose.
 */
const face = (): ReactNode => (
  <g>
    <circle cx={eyeLine.xLeft} cy={eyeLine.y} r={EYE_RADIUS} fill={FIXED_COLORS.eye} />
    <circle cx={eyeLine.xRight} cy={eyeLine.y} r={EYE_RADIUS} fill={FIXED_COLORS.eye} />
    <circle
      cx={eyeLine.xLeft + HIGHLIGHT_OFFSET}
      cy={eyeLine.y - HIGHLIGHT_OFFSET}
      r={HIGHLIGHT_RADIUS}
      fill={FIXED_COLORS.eyeHighlight}
    />
    <circle
      cx={eyeLine.xRight + HIGHLIGHT_OFFSET}
      cy={eyeLine.y - HIGHLIGHT_OFFSET}
      r={HIGHLIGHT_RADIUS}
      fill={FIXED_COLORS.eyeHighlight}
    />
  </g>
);

const renderBody = (skin: string): ReactNode => {
  const limb = shade(skin, LIMB);
  const recess = shade(skin, RECESS);

  return (
    <g>
      {/* Legs, then feet, then the torso over the hip so the joint reads. */}
      {rounded(legLeft.x1, legLeft.x2, hip.y - 16, sole.y, limb)}
      {rounded(legRight.x1, legRight.x2, hip.y - 16, sole.y, limb)}
      <path
        d={`M ${String(legLeft.x1)} ${String(FOOT_TOP)} L ${String(legLeft.x2)} ${String(FOOT_TOP)}
            L ${String(legLeft.x2)} ${String(sole.y - 8)}
            C ${String(legLeft.x2)} ${String(sole.y)} ${String(legLeft.x1)} ${String(sole.y)} ${String(legLeft.x1)} ${String(sole.y - 8)} Z`}
        fill={recess}
      />
      <path
        d={`M ${String(legRight.x1)} ${String(FOOT_TOP)} L ${String(legRight.x2)} ${String(FOOT_TOP)}
            L ${String(legRight.x2)} ${String(sole.y - 8)}
            C ${String(legRight.x2)} ${String(sole.y)} ${String(legRight.x1)} ${String(sole.y)} ${String(legRight.x1)} ${String(sole.y - 8)} Z`}
        fill={recess}
      />

      {/* Neck, behind the torso so only the throat shows below the chin. */}
      <rect
        x={neckBase.x1 + 6}
        y={chin.y - 14}
        width={neckBase.x2 - neckBase.x1 - 12}
        height={neckBase.y - chin.y + 22}
        fill={recess}
      />

      {rounded(armLeft.x1, armLeft.x2, armLeft.y1, armLeft.y2, limb)}
      {rounded(armRight.x1, armRight.x2, armRight.y1, armRight.y2, limb)}
      <circle cx={handLeft.x} cy={handLeft.y} r={handLeft.r} fill={limb} />
      <circle cx={handRight.x} cy={handRight.y} r={handRight.r} fill={limb} />

      {/* Sloped shoulders, so the torso is a body rather than a box. */}
      <path
        d={`M ${String(torso.x1 + 12)} ${String(torso.y1 + 24)}
            C ${String(torso.x1 + 12)} ${String(torso.y1 + 4)} ${String(torso.x1 + 32)} ${String(torso.y1)} ${String(torso.x1 + 52)} ${String(torso.y1)}
            C ${String(torso.x2 - 32)} ${String(torso.y1)} ${String(torso.x2 - 12)} ${String(torso.y1 + 4)} ${String(torso.x2 - 12)} ${String(torso.y1 + 24)}
            L ${String(torso.x2 - 4)} ${String(torso.y2 - 26)}
            C ${String(torso.x2 - 4)} ${String(torso.y2)} ${String(torso.x1 + 4)} ${String(torso.y2)} ${String(torso.x1 + 4)} ${String(torso.y2 - 26)} Z`}
        fill={skin}
      />

      <circle cx={headCenter.x} cy={headCenter.y} r={headCenter.r} fill={skin} />
      {face()}
    </g>
  );
};

export const BODY: Part = {
  id: 'body.base',
  slot: 'body',
  palette: 'skin',
  render: renderBody,
};

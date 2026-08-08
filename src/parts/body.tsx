import type { ReactNode } from 'react';

import { ANCHORS } from '../anchors';
import { FOLD, shade } from '../lib/color';
import { BLUSH_OPACITY, FIXED_COLORS } from '../model/palettes';
import type { Part } from '../model/types';

/**
 * The doll itself.
 *
 * Not optional and not variable: the body has no part alternatives in the MVP
 * and changes only with the skin tone (SPEC section 7). Every coordinate comes
 * from ANCHORS — nothing here is a free-hand number.
 */

const { headCenter, eyeLine, chin, neckBase, torso, armLeft, armRight, handLeft, handRight } =
  ANCHORS;
const { legLeft, legRight, hip, ankle, sole } = ANCHORS;

const EYE_RADIUS = 7;
const HIGHLIGHT_RADIUS = 4;
const HIGHLIGHT_OFFSET = 3;
const LIMB_RADIUS = 14;

const limb = (x1: number, x2: number, y1: number, y2: number, fill: string): ReactNode => (
  <rect x={x1} y={y1} width={x2 - x1} height={y2 - y1} rx={LIMB_RADIUS} fill={fill} />
);

const face = (): ReactNode => (
  <g>
    <ellipse
      cx={eyeLine.xLeft - 12}
      cy={eyeLine.y + 16}
      rx={13}
      ry={8}
      fill={FIXED_COLORS.blush}
      opacity={BLUSH_OPACITY}
    />
    <ellipse
      cx={eyeLine.xRight + 12}
      cy={eyeLine.y + 16}
      rx={13}
      ry={8}
      fill={FIXED_COLORS.blush}
      opacity={BLUSH_OPACITY}
    />

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

    <path
      d={`M ${String(chin.x - 13)} ${String(chin.y - 26)} Q ${String(chin.x)} ${String(chin.y - 14)} ${String(chin.x + 13)} ${String(chin.y - 26)}`}
      fill="none"
      stroke={FIXED_COLORS.mouth}
      strokeWidth={5}
      strokeLinecap="round"
    />
  </g>
);

const renderBody = (skin: string): ReactNode => {
  const shadow = shade(skin, FOLD);

  return (
    <g>
      {/* Legs, drawn first so the torso overlaps them at the hip. */}
      {limb(legLeft.x1, legLeft.x2, hip.y - 20, sole.y, skin)}
      {limb(legRight.x1, legRight.x2, hip.y - 20, sole.y, skin)}
      <rect
        x={legLeft.x1}
        y={ankle.y}
        width={legLeft.x2 - legLeft.x1}
        height={sole.y - ankle.y}
        rx={LIMB_RADIUS}
        fill={shadow}
      />
      <rect
        x={legRight.x1}
        y={ankle.y}
        width={legRight.x2 - legRight.x1}
        height={sole.y - ankle.y}
        rx={LIMB_RADIUS}
        fill={shadow}
      />

      {limb(armLeft.x1, armLeft.x2, armLeft.y1, armLeft.y2, skin)}
      {limb(armRight.x1, armRight.x2, armRight.y1, armRight.y2, skin)}
      <circle cx={handLeft.x} cy={handLeft.y} r={handLeft.r} fill={skin} />
      <circle cx={handRight.x} cy={handRight.y} r={handRight.r} fill={skin} />

      <rect
        x={torso.x1}
        y={torso.y1}
        width={torso.x2 - torso.x1}
        height={torso.y2 - torso.y1}
        rx={torso.rx}
        fill={skin}
      />

      <rect
        x={neckBase.x1}
        y={chin.y - 8}
        width={neckBase.x2 - neckBase.x1}
        height={neckBase.y - chin.y + 12}
        fill={shadow}
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

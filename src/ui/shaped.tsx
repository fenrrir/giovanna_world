import type { ReactNode } from 'react';

import type { MessageKey } from '../i18n';
import type { LookAction } from '../model/reducer';
import type { Look, PartParams } from '../model/types';
import { CUSTOM_HAIR_ID, customHair } from '../parts/hair/custom';
import { toHairParams } from '../parts/hair/custom/params';
import { CUSTOM_OUTER_ID, customOuter } from '../parts/outer/custom';
import { toOuterParams } from '../parts/outer/custom/params';
import { CUSTOM_SOCKS_ID, customSocks } from '../parts/socks/custom';
import { toSocksParams } from '../parts/socks/custom/params';

/**
 * A family of pieces the child shapes rather than picks.
 *
 * Two slots now build their pieces from axes, and this is what they turned out
 * to share: a list of continuous axes, one discrete choice, a total repair for
 * whatever storage held, and how to draw and apply a shape. Everything below
 * that — what an axis means in user units, how a fringe is cut — stays inside
 * the slot, which is why the builders were left alone.
 *
 * The axes are named, not typed per family. A panel that had to know the shape
 * of `HairParams` could only ever serve hair.
 */

export type ShapedAxis = { key: string; label: MessageKey };

export type ShapedOption = { value: string; label: MessageKey };

export type ShapedChoice = { key: string; label: MessageKey; options: readonly ShapedOption[] };

export type ShapedFamily = {
  /** The one id the whole family shares. */
  id: string;
  label: MessageKey;
  axes: readonly ShapedAxis[];
  choice: ShapedChoice;
  /** Total: whatever storage held becomes a shape this can draw. */
  read: (raw?: PartParams) => PartParams;
  render: (params: PartParams) => (color: string) => ReactNode;
  apply: (params: PartParams, color: string) => LookAction;
};

/*
 * Labels are written out rather than built from the axis name. A template would
 * be shorter and would fail at runtime with the key printed on screen; spelled
 * out, a missing catalogue entry is a compile error.
 */

export const SHAPED_HAIR: ShapedFamily = {
  id: CUSTOM_HAIR_ID,
  label: 'hair.custom',
  axes: [
    { key: 'length', label: 'hair.length' },
    { key: 'volume', label: 'hair.volume' },
    { key: 'wave', label: 'hair.wave' },
  ],
  choice: {
    key: 'fringe',
    label: 'hair.fringe',
    options: [
      { value: 'none', label: 'hair.fringe.none' },
      { value: 'straight', label: 'hair.fringe.straight' },
      { value: 'side', label: 'hair.fringe.side' },
      { value: 'curtain', label: 'hair.fringe.curtain' },
    ],
  },
  read: toHairParams,
  // Both halves, so the thumbnail shows the hairstyle the child will get.
  render: (params) => (color) => {
    const hair = customHair(params);

    return (
      <>
        {hair.back(color)}
        {hair.front(color)}
      </>
    );
  },
  apply: (params, color) => ({ type: 'applyHair', hair: customHair(params), color, params }),
};

export const SHAPED_OUTER: ShapedFamily = {
  id: CUSTOM_OUTER_ID,
  label: 'outer.custom',
  axes: [
    { key: 'length', label: 'outer.length' },
    { key: 'sleeve', label: 'outer.sleeve' },
  ],
  choice: {
    key: 'collar',
    label: 'outer.collar',
    options: [
      { value: 'none', label: 'outer.collar.none' },
      { value: 'round', label: 'outer.collar.round' },
      { value: 'hood', label: 'outer.collar.hood' },
    ],
  },
  read: toOuterParams,
  render: (params) => customOuter(params).render,
  apply: (params, color) => ({ type: 'applyPart', part: customOuter(params), color, params }),
};

export const SHAPED_SOCKS: ShapedFamily = {
  id: CUSTOM_SOCKS_ID,
  label: 'socks.custom',
  axes: [{ key: 'height', label: 'socks.height' }],
  choice: {
    key: 'pattern',
    label: 'socks.pattern',
    options: [
      { value: 'plain', label: 'socks.pattern.plain' },
      { value: 'stripes', label: 'socks.pattern.stripes' },
      { value: 'dots', label: 'socks.pattern.dots' },
    ],
  },
  read: toSocksParams,
  render: (params) => customSocks(params).render,
  apply: (params, color) => ({ type: 'applyPart', part: customSocks(params), color, params }),
};

/** The axes of the shaped piece she is wearing in that slot, if she is. */
export const shapedParams = (
  look: Look | undefined,
  slot: keyof Look['equipped'],
  family: ShapedFamily,
): PartParams | undefined => {
  const worn = look?.equipped[slot];

  return worn?.partId === family.id ? worn.params : undefined;
};

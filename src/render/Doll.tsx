import type { JSX } from 'react';

import { VIEW_BOX_ATTR } from '../anchors';
import type { PartLookup } from '../model/sanitize';
import type { Look, Part } from '../model/types';
import { DollLayers } from './DollLayers';

type DollProps = {
  look: Look;
  lookup: PartLookup;
  body: Part;
  /** Accessible name. The canvas carries no visible text. */
  label: string;
  /** The visible region. Defaults to the whole contractual canvas. */
  viewBox?: string | undefined;
  className?: string | undefined;
};

/**
 * One doll on a canvas of her own, on the contractual 680 by 540 viewBox
 * (SPEC section 8).
 *
 * Still the whole of what a thumbnail and the album need. A doll standing in a
 * room goes through `Scene` instead, which owns the canvas they share.
 */
export const Doll = ({
  look,
  lookup,
  body,
  label,
  className,
  viewBox = VIEW_BOX_ATTR,
}: DollProps): JSX.Element => (
  <svg
    viewBox={viewBox}
    width="100%"
    preserveAspectRatio="xMidYMid meet"
    role="img"
    aria-label={label}
    className={className}
  >
    <DollLayers look={look} lookup={lookup} body={body} />
  </svg>
);

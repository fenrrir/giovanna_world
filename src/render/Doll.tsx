import type { JSX } from 'react';

import { VIEW_BOX_ATTR } from '../anchors';
import type { PartLookup } from '../model/sanitize';
import type { Look, Part } from '../model/types';
import { resolveLayers } from './resolve';

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
 * The single canvas. Every part is a fragment inside this one <svg>, painted
 * in z order, on the contractual 680 by 540 viewBox (SPEC section 8).
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
    {resolveLayers(look, lookup, body).map((layer) => (
      <g key={layer.slot} data-slot={layer.slot}>
        {layer.part.render(layer.color)}
      </g>
    ))}
  </svg>
);

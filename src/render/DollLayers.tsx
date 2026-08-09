import type { JSX } from 'react';

import type { PartLookup } from '../model/sanitize';
import type { Look, Part } from '../model/types';
import { resolveLayers } from './resolve';

type DollLayersProps = {
  look: Look;
  lookup: PartLookup;
  body: Part;
};

/**
 * One doll, painted in z order, with no canvas of her own.
 *
 * Split out from `Doll` so a room can hold two of them: the `<svg>` used to be
 * hers, and a place cannot be inside the doll standing in it.
 *
 * `data-slot` survives the split because it is what the finger is hit-tested
 * against — it is how the drag knows which piece it has hold of.
 */
export const DollLayers = ({ look, lookup, body }: DollLayersProps): JSX.Element => (
  <>
    {resolveLayers(look, lookup, body).map((layer) => (
      <g key={layer.slot} data-slot={layer.slot}>
        {layer.part.render(layer.color)}
      </g>
    ))}
  </>
);

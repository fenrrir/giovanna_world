import type { JSX } from 'react';

import { VIEW_BOX_ATTR } from '../anchors';
import type { PartLookup } from '../model/sanitize';
import type { Look, Part } from '../model/types';
import type { DollIndex } from '../model/world';
import type { Environment } from '../world/registry';
import { DollLayers } from './DollLayers';

/** One doll on the canvas, and where she is standing on it. */
export type Standing = {
  doll: DollIndex;
  look: Look;
  /** Absent when she is being dressed, and so drawn at her full size. */
  transform?: string | undefined;
};

type SceneProps = {
  environment: Environment;
  color: string;
  standing: readonly Standing[];
  lookup: PartLookup;
  body: Part;
  /** Accessible name. The canvas carries no visible text. */
  label: string;
  viewBox?: string | undefined;
  className?: string | undefined;
};

/**
 * A place, with whoever is in it.
 *
 * The room and the doll are drawn on the same 680 by 540 contract, so putting
 * one inside the other is a transform rather than a second coordinate system.
 * The place is painted first and carries no `data-slot`, which is what stops
 * the drag that undresses from ever getting hold of the wallpaper — the old
 * backdrop was a layer of the doll and could be pulled off her.
 *
 * `data-doll` is the counterpart: it is how a tap on the canvas knows which of
 * them it landed on.
 */
export const Scene = ({
  environment,
  color,
  standing,
  lookup,
  body,
  label,
  className,
  viewBox = VIEW_BOX_ATTR,
}: SceneProps): JSX.Element => (
  <svg
    viewBox={viewBox}
    width="100%"
    preserveAspectRatio="xMidYMid meet"
    role="img"
    aria-label={label}
    className={className}
  >
    <g data-place={environment.id}>{environment.render(color)}</g>

    {standing.map((one) => (
      <g key={one.doll} data-doll={one.doll} transform={one.transform}>
        <DollLayers look={one.look} lookup={lookup} body={body} />
      </g>
    ))}
  </svg>
);

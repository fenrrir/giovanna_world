import type { JSX, ReactNode } from 'react';

import { VIEW_BOX, VIEW_BOX_ATTR, type Box } from '../anchors';

type ThumbProps = {
  /**
   * The fragment to show. A render function rather than a Part, so a HairStyle
   * half — which is not a Part — uses the very same component.
   */
  render: (color: string) => ReactNode;
  color: string;
  /** The region of the canvas to zoom into. */
  focus: Box;
  /** Accessible name. Thumbnails carry no visible text. */
  label: string;
  className?: string | undefined;
};

/**
 * One part, drawn in isolation and scaled up.
 *
 * There is no thumbnail asset anywhere in the project: a thumbnail is the part
 * rendered on the same viewBox under a transform, so artwork and thumbnail can
 * never disagree (SPEC section 10).
 */
export const Thumb = ({ render, color, focus, label, className }: ThumbProps): JSX.Element => {
  const scale = Math.min(VIEW_BOX.width / focus.width, VIEW_BOX.height / focus.height);
  const offsetX = (VIEW_BOX.width - focus.width * scale) / 2 - focus.x * scale;
  const offsetY = (VIEW_BOX.height - focus.height * scale) / 2 - focus.y * scale;

  return (
    <svg
      viewBox={VIEW_BOX_ATTR}
      width="100%"
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label={label}
      className={className}
    >
      <g transform={`translate(${String(offsetX)} ${String(offsetY)}) scale(${String(scale)})`}>
        {render(color)}
      </g>
    </svg>
  );
};

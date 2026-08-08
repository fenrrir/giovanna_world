import type { ReactNode } from 'react';

import type { Box } from '../anchors';

/**
 * Procedural fills for clothing (SPEC section 9).
 *
 * Patterns are generated, never written shape by shape, so swapping polka dots
 * for stripes is swapping a function call. Every generator emits flat-filled
 * primitives and clips by construction: a shape that would cross the box is not
 * emitted at all, which keeps the artwork free of <clipPath> and <mask>.
 */

type DotOptions = { radius?: number; spacing?: number };
type StripeOptions = { width?: number; spacing?: number };
type CheckOptions = { size?: number };

/**
 * Positions of a step of `stride` that fit between `start` and `end`, centred.
 *
 * Packing from the start instead leaves the whole remainder on one side, which
 * shows up as a pattern visibly off-centre on the garment whenever the box is
 * not an exact multiple of the spacing.
 */
const track = (start: number, end: number, stride: number, extent: number): number[] => {
  const span = end - start;
  const count = Math.floor((span - extent) / stride) + 1;

  if (count <= 0) return [];

  const offset = (span - ((count - 1) * stride + extent)) / 2;

  return Array.from({ length: count }, (_, index) => start + offset + index * stride);
};

export const dots = (box: Box, color: string, options: DotOptions = {}): ReactNode => {
  const { radius = 6, spacing = 28 } = options;
  const diameter = radius * 2;
  const columns = track(box.x, box.x + box.width, spacing, diameter);
  const rows = track(box.y, box.y + box.height, spacing, diameter);

  return (
    <g>
      {rows.flatMap((y) =>
        columns.map((x) => (
          <circle
            key={`${String(x)}-${String(y)}`}
            cx={x + radius}
            cy={y + radius}
            r={radius}
            fill={color}
          />
        )),
      )}
    </g>
  );
};

export const stripes = (box: Box, color: string, options: StripeOptions = {}): ReactNode => {
  const { width = 10, spacing = 26 } = options;
  const columns = track(box.x, box.x + box.width, spacing, width);

  return (
    <g>
      {columns.map((x) => (
        <rect key={String(x)} x={x} y={box.y} width={width} height={box.height} fill={color} />
      ))}
    </g>
  );
};

export const checks = (box: Box, color: string, options: CheckOptions = {}): ReactNode => {
  const { size = 16 } = options;
  const columns = track(box.x, box.x + box.width, size, size);
  const rows = track(box.y, box.y + box.height, size, size);

  return (
    <g>
      {rows.flatMap((y, rowIndex) =>
        columns
          .filter((_x, columnIndex) => (rowIndex + columnIndex) % 2 === 0)
          .map((x) => (
            <rect
              key={`${String(x)}-${String(y)}`}
              x={x}
              y={y}
              width={size}
              height={size}
              fill={color}
            />
          )),
      )}
    </g>
  );
};

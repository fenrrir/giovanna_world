import type { JSX } from 'react';

import { ANCHORS } from '../anchors';

const CROSS = 8;
const STROKE = '#E24B4A';

/** Every single point in the anchor table, derived rather than retyped. */
const points = (): { name: string; x: number; y: number }[] => {
  const result: { name: string; x: number; y: number }[] = [];

  for (const [name, anchor] of Object.entries(ANCHORS)) {
    const values = anchor as Record<string, number>;
    const xs = Object.entries(values).filter(([key]) => key.startsWith('x'));
    const ys = Object.entries(values).filter(([key]) => key.startsWith('y'));

    for (const [xKey, x] of xs) {
      for (const [yKey, y] of ys) {
        result.push({ name: `${name}.${xKey}${yKey}`, x, y });
      }
    }
  }

  return result;
};

/**
 * Crosses at every anchor, for checking that a new part actually lands on the
 * shoulder, the waist and the sole rather than near them (SPEC section 11).
 */
export const AnchorOverlay = (): JSX.Element => (
  <g data-testid="anchor-overlay" stroke={STROKE} strokeWidth={1.5} opacity={0.85}>
    {points().map(({ name, x, y }) => (
      <path
        key={name}
        d={`M ${String(x - CROSS)} ${String(y)} L ${String(x + CROSS)} ${String(y)}
            M ${String(x)} ${String(y - CROSS)} L ${String(x)} ${String(y + CROSS)}`}
      />
    ))}
  </g>
);

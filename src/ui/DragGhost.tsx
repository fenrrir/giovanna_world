import { createPortal } from 'react-dom';
import type { JSX, ReactNode } from 'react';

import type { Box } from '../anchors';
import { Thumb } from '../render/Thumb';
import type { DragPoint } from './useDrag';
import styles from './controls.module.css';

type DragGhostProps = {
  at: DragPoint;
  render: (color: string) => ReactNode;
  color: string;
  focus: Box;
  label: string;
};

/**
 * The piece under the finger while it is being dragged.
 *
 * Rendered into the body so it is never clipped by the tray it came from, and
 * `pointer-events: none` so it cannot steal the pointer it is following.
 */
export const DragGhost = ({ at, render, color, focus, label }: DragGhostProps): JSX.Element =>
  createPortal(
    <div className={styles.ghost} style={{ left: at.x, top: at.y }} aria-hidden="true">
      <Thumb className={styles.thumb} render={render} color={color} focus={focus} label={label} />
    </div>,
    document.body,
  );

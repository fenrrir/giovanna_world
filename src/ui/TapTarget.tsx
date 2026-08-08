import type { JSX, ReactNode } from 'react';

import { cx } from '../lib/cx';
import styles from './controls.module.css';

type TapTargetProps = {
  /** Accessible name. Nothing here is ever rendered as visible text. */
  label: string;
  selected: boolean;
  onSelect: () => void;
  children: ReactNode;
};

/**
 * Every control the child touches.
 *
 * Pointer Events only, never Touch Events — one event for finger and mouse,
 * so the game is testable on a desktop without a simulator (SPEC section 13).
 * onClick is kept alongside so the keyboard still works, and the handler is
 * guarded so a pointer tap does not fire it twice.
 */
export const TapTarget = ({ label, selected, onSelect, children }: TapTargetProps): JSX.Element => (
  <button
    type="button"
    className={cx(styles.target, selected && styles.selected)}
    aria-label={label}
    aria-pressed={selected}
    onPointerDown={(event) => {
      event.preventDefault();
      onSelect();
    }}
    onClick={(event) => {
      // A real pointer already fired onPointerDown; this is the keyboard path.
      if (event.detail === 0) onSelect();
    }}
  >
    {children}
  </button>
);

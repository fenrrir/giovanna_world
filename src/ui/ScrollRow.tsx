import { useEffect, useRef, useState, type JSX, type ReactNode } from 'react';

import { useTranslation } from '../i18n';
import { edgesOf, scrollStep, type ScrollEdges } from '../lib/scrollEdges';
import styles from './controls.module.css';

type ScrollRowProps = {
  children: ReactNode;
};

const NOTHING: ScrollEdges = { start: false, end: false };

/** The arrowhead, drawn rather than typed: no glyph, no font, no word. */
const Chevron = ({ towards }: { towards: 1 | -1 }): JSX.Element => (
  <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" focusable="false">
    <path
      d={towards === 1 ? 'M 9 4 L 17 12 L 9 20' : 'M 15 4 L 7 12 L 15 20'}
      fill="none"
      stroke="currentColor"
      strokeWidth={3}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/**
 * A single row that scrolls sideways, with a chevron at whichever end still has
 * something on it.
 *
 * Wrapping to a second line was the alternative, and it costs height the doll
 * needs — the panel is the short side of the screen on an iPad. Scrolling keeps
 * the row one deep however many trays exist.
 *
 * A chevron appears only when there is somewhere to go, so it never lies about
 * there being more. It is also the keyboard's way along the row, since dragging
 * a row sideways is a gesture and nothing else here reaches it.
 */
export const ScrollRow = ({ children }: ScrollRowProps): JSX.Element => {
  const { t } = useTranslation();
  const list = useRef<HTMLUListElement>(null);
  const [edges, setEdges] = useState<ScrollEdges>(NOTHING);

  useEffect(() => {
    const row = list.current;

    // Refs are attached before effects run, so this only satisfies the type.
    if (!row) return;

    const measure = (): void => {
      setEdges(edgesOf(row));
    };

    measure();

    // The row changes width with the window, and a resize fires no scroll event.
    const observer = new ResizeObserver(measure);

    observer.observe(row);

    return () => {
      observer.disconnect();
    };
  }, []);

  const nudge = (towards: 1 | -1): void => {
    const row = list.current;

    row?.scrollBy({ left: towards * scrollStep(row.clientWidth), behavior: 'smooth' });
  };

  return (
    <div className={styles.scroller}>
      {edges.start && (
        <button
          type="button"
          className={styles.chevron}
          aria-label={t('scroll.back')}
          onPointerDown={() => {
            nudge(-1);
          }}
          onClick={(event) => {
            // Keyboard activation reports no pointer; a real tap already fired.
            if (event.detail === 0) nudge(-1);
          }}
        >
          <Chevron towards={-1} />
        </button>
      )}

      <ul
        className={styles.row}
        ref={list}
        onScroll={(event) => {
          setEdges(edgesOf(event.currentTarget));
        }}
      >
        {children}
      </ul>

      {edges.end && (
        <button
          type="button"
          className={styles.chevron}
          aria-label={t('scroll.forward')}
          onPointerDown={() => {
            nudge(1);
          }}
          onClick={(event) => {
            if (event.detail === 0) nudge(1);
          }}
        >
          <Chevron towards={1} />
        </button>
      )}
    </div>
  );
};

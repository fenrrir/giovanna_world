import { useEffect, useRef, useState, type JSX, type ReactNode } from 'react';

import { useTranslation } from '../i18n';
import { edgesOf, scrollStep, type ScrollEdges, type ScrollMetrics } from '../lib/scrollEdges';
import styles from './controls.module.css';

type ScrollRailProps = {
  children: ReactNode;
};

const NOTHING: ScrollEdges = { start: false, end: false };

/** The rail's own three numbers, in the axis-neutral shape `edgesOf` reads. */
const metricsOf = (rail: HTMLUListElement): ScrollMetrics => ({
  offset: rail.scrollTop,
  viewport: rail.clientHeight,
  content: rail.scrollHeight,
});

/** The arrowhead, drawn rather than typed: no glyph, no font, no word. */
const Chevron = ({ towards }: { towards: 1 | -1 }): JSX.Element => (
  <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" focusable="false">
    <path
      d={towards === 1 ? 'M 4 9 L 12 17 L 20 9' : 'M 4 15 L 12 7 L 20 15'}
      fill="none"
      stroke="currentColor"
      strokeWidth={3}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/**
 * A single column that scrolls up and down, with a chevron at whichever end
 * still has something on it.
 *
 * It runs down the side of the screen rather than across the bottom, which is
 * what leaves the scene the width of the window instead of half of it. One deep
 * however many trays exist, so the rail never wraps and never grows sideways
 * into the stage.
 *
 * A chevron appears only when there is somewhere to go, so it never lies about
 * there being more. It is also the keyboard's way along the rail, since dragging
 * a rail is a gesture and nothing else here reaches it.
 */
export const ScrollRail = ({ children }: ScrollRailProps): JSX.Element => {
  const { t } = useTranslation();
  const list = useRef<HTMLUListElement>(null);
  const [edges, setEdges] = useState<ScrollEdges>(NOTHING);

  useEffect(() => {
    const rail = list.current;

    // Refs are attached before effects run, so this only satisfies the type.
    if (!rail) return;

    const measure = (): void => {
      setEdges(edgesOf(metricsOf(rail)));
    };

    measure();

    // The rail changes height with the window, and a resize fires no scroll event.
    const observer = new ResizeObserver(measure);

    observer.observe(rail);

    return () => {
      observer.disconnect();
    };
  }, []);

  const nudge = (towards: 1 | -1): void => {
    const rail = list.current;

    rail?.scrollBy({ top: towards * scrollStep(rail.clientHeight), behavior: 'smooth' });
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
        className={styles.rail}
        ref={list}
        onScroll={(event) => {
          setEdges(edgesOf(metricsOf(event.currentTarget)));
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

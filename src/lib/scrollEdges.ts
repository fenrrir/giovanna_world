/**
 * Which way a scrolling rail can still travel.
 *
 * A pure reading of three numbers, so the decision to show a chevron is
 * testable without a layout engine — jsdom has none, and the component that
 * uses this is otherwise untestable.
 *
 * The three are named for the reading rather than for the axis. The rails run
 * down the side of the screen now, and a function called with `scrollTop` under
 * a parameter named `scrollLeft` would be lying about what it measures.
 */

export type ScrollMetrics = {
  /** How far along the rail already is. */
  offset: number;
  /** How much of it can be seen at once. */
  viewport: number;
  /** How long the whole thing is. */
  content: number;
};

export type ScrollEdges = {
  /** There is content back the way the rail came. */
  start: boolean;
  /** There is content further along. */
  end: boolean;
};

/**
 * Sub-pixel slack. Browsers report fractional sizes, so an exactly-scrolled
 * rail can be a fraction short of its end and leave a chevron pointing nowhere.
 */
const SLACK = 2;

export const edgesOf = ({ offset, viewport, content }: ScrollMetrics): ScrollEdges => ({
  start: offset > SLACK,
  end: offset + viewport < content - SLACK,
});

/**
 * How far a chevron moves the rail: most of a screenful, never all of it. The
 * overlap leaves one piece from the previous screen in view, so a child can see
 * that the rail moved rather than that it was replaced.
 */
export const scrollStep = (viewport: number): number => Math.round(viewport * 0.8);

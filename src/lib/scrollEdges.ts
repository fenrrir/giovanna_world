/**
 * Which way a horizontally scrolling row can still travel.
 *
 * A pure reading of three numbers, so the decision to show a chevron is
 * testable without a layout engine — jsdom has none, and the component that
 * uses this is otherwise untestable.
 */

export type ScrollMetrics = {
  scrollLeft: number;
  clientWidth: number;
  scrollWidth: number;
};

export type ScrollEdges = {
  /** There is content back the way the row came. */
  start: boolean;
  /** There is content further along. */
  end: boolean;
};

/**
 * Sub-pixel slack. Browsers report fractional widths, so an exactly-scrolled
 * row can be a fraction short of its end and leave a chevron pointing nowhere.
 */
const SLACK = 2;

export const edgesOf = ({ scrollLeft, clientWidth, scrollWidth }: ScrollMetrics): ScrollEdges => ({
  start: scrollLeft > SLACK,
  end: scrollLeft + clientWidth < scrollWidth - SLACK,
});

/**
 * How far a chevron moves the row: most of a screenful, never all of it. The
 * overlap leaves one piece from the previous screen in view, so a child can see
 * that the row moved rather than that it was replaced.
 */
export const scrollStep = (clientWidth: number): number => Math.round(clientWidth * 0.8);

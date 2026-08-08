declare module 'svg-path-bounds' {
  /** Returns `[minX, minY, maxX, maxY]` for an SVG path definition. */
  export default function pathBounds(d: string): [number, number, number, number];
}

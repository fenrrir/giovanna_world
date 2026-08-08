import pathBounds from 'svg-path-bounds';

/**
 * Geometry extraction for the part contract suite.
 *
 * jsdom implements no layout, so `getBBox()` always returns zeroes. These
 * helpers read the geometry straight off the attributes instead, which is why
 * parts are required to use absolute path commands only — relative commands
 * would make a path's coordinates unresolvable without a full path machine.
 */

export type Bounds = { minX: number; minY: number; maxX: number; maxY: number };

type Transform = { x: number; y: number; scale: number };

const IDENTITY: Transform = { x: 0, y: 0, scale: 1 };

const num = (element: Element, attribute: string): number =>
  Number(element.getAttribute(attribute) ?? 0);

/** Reads `translate(x y) scale(s)`, the only transform shape the project uses. */
const parseTransform = (raw: string): Transform => {
  const translate = /translate\(\s*(-?[\d.]+)[\s,]+(-?[\d.]+)\s*\)/.exec(raw);
  const scale = /scale\(\s*(-?[\d.]+)\s*\)/.exec(raw);

  return {
    x: translate ? Number(translate[1]) : 0,
    y: translate ? Number(translate[2]) : 0,
    scale: scale ? Number(scale[1]) : 1,
  };
};

/** Composes every transform from `root` down to `element`. */
const effectiveTransform = (element: Element, root: Element): Transform => {
  const chain: Transform[] = [];

  for (let node: Element | null = element; node && node !== root; node = node.parentElement) {
    const raw = node.getAttribute('transform');
    if (raw) chain.unshift(parseTransform(raw));
  }

  return chain.reduce<Transform>(
    (outer, inner) => ({
      x: outer.x + inner.x * outer.scale,
      y: outer.y + inner.y * outer.scale,
      scale: outer.scale * inner.scale,
    }),
    IDENTITY,
  );
};

const pointsOf = (raw: string): [number, number][] => {
  const numbers = [...raw.matchAll(/-?[\d.]+/g)].map((match) => Number(match[0]));
  const points: [number, number][] = [];

  for (let index = 0; index + 1 < numbers.length; index += 2) {
    points.push([numbers[index]!, numbers[index + 1]!]);
  }

  return points;
};

type Measurer = (element: Element) => Bounds | null;

/** Shared by <polygon> and <polyline>, which bound identically. */
const measurePoints: Measurer = (element) => {
  const points = pointsOf(element.getAttribute('points') ?? '');

  if (points.length === 0) return null;

  return {
    minX: Math.min(...points.map(([x]) => x)),
    minY: Math.min(...points.map(([, y]) => y)),
    maxX: Math.max(...points.map(([x]) => x)),
    maxY: Math.max(...points.map(([, y]) => y)),
  };
};

/**
 * One measurer per primitive. A lookup rather than a switch, so adding a shape
 * is adding an entry and the dispatcher stays trivial.
 */
const MEASURERS: Record<string, Measurer> = {
  rect: (element) => {
    const [x, y] = [num(element, 'x'), num(element, 'y')];

    return { minX: x, minY: y, maxX: x + num(element, 'width'), maxY: y + num(element, 'height') };
  },

  circle: (element) => {
    const [cx, cy, r] = [num(element, 'cx'), num(element, 'cy'), num(element, 'r')];

    return { minX: cx - r, minY: cy - r, maxX: cx + r, maxY: cy + r };
  },

  ellipse: (element) => {
    const [cx, cy, rx, ry] = [
      num(element, 'cx'),
      num(element, 'cy'),
      num(element, 'rx'),
      num(element, 'ry'),
    ];

    return { minX: cx - rx, minY: cy - ry, maxX: cx + rx, maxY: cy + ry };
  },

  line: (element) => {
    const [x1, y1, x2, y2] = [
      num(element, 'x1'),
      num(element, 'y1'),
      num(element, 'x2'),
      num(element, 'y2'),
    ];

    return {
      minX: Math.min(x1, x2),
      minY: Math.min(y1, y2),
      maxX: Math.max(x1, x2),
      maxY: Math.max(y1, y2),
    };
  },

  polygon: measurePoints,
  polyline: measurePoints,

  path: (element) => {
    const d = element.getAttribute('d');

    if (!d) return null;

    const [minX, minY, maxX, maxY] = pathBounds(d);

    return { minX, minY, maxX, maxY };
  },
};

/** Local bounds of one primitive, before any ancestor transform. */
const localBounds = (element: Element): Bounds | null =>
  MEASURERS[element.tagName.toLowerCase()]?.(element) ?? null;

const apply = (bounds: Bounds, transform: Transform): Bounds => ({
  minX: bounds.minX * transform.scale + transform.x,
  minY: bounds.minY * transform.scale + transform.y,
  maxX: bounds.maxX * transform.scale + transform.x,
  maxY: bounds.maxY * transform.scale + transform.y,
});

const union = (a: Bounds, b: Bounds): Bounds => ({
  minX: Math.min(a.minX, b.minX),
  minY: Math.min(a.minY, b.minY),
  maxX: Math.max(a.maxX, b.maxX),
  maxY: Math.max(a.maxY, b.maxY),
});

/** Union bounding box of every primitive under `root`, in canvas user units. */
export const boundsOf = (root: Element): Bounds | null => {
  let result: Bounds | null = null;

  for (const element of root.querySelectorAll(
    'rect, circle, ellipse, line, polygon, polyline, path',
  )) {
    const local = localBounds(element);

    if (!local) continue;

    const transformed = apply(local, effectiveTransform(element, root));
    result = result ? union(result, transformed) : transformed;
  }

  return result;
};

/** Every fill and stroke literal under `root`, uppercased and deduplicated. */
export const colorsOf = (root: Element): string[] => {
  const colors = new Set<string>();

  for (const element of root.querySelectorAll('*')) {
    for (const attribute of ['fill', 'stroke']) {
      const value = element.getAttribute(attribute);

      if (value && value !== 'none') colors.add(value.toUpperCase());
    }
  }

  return [...colors];
};

/** Every `d` attribute under `root`. */
export const pathDataOf = (root: Element): string[] =>
  [...root.querySelectorAll('path')].map((path) => path.getAttribute('d') ?? '');

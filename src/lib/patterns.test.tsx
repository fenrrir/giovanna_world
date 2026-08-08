import { render } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it } from 'vitest';

import type { Box } from '../anchors';
import { checks, dots, stripes } from './patterns';

const BOX: Box = { x: 288, y: 194, width: 104, height: 140 };
const COLOR = '#7F77DD';

/** Renders a fragment inside a host <svg> and hands back the root element. */
const renderFragment = (fragment: ReactNode): SVGSVGElement => {
  const { container } = render(<svg data-testid="host">{fragment}</svg>);

  return container.querySelector('svg')!;
};

const numbers = (element: Element, ...attributes: string[]): number[] =>
  attributes.map((attribute) => Number(element.getAttribute(attribute)));

describe('dots', () => {
  it('places every dot inside the box', () => {
    const svg = renderFragment(dots(BOX, COLOR, { radius: 5, spacing: 20 }));
    const circles = [...svg.querySelectorAll('circle')];

    expect(circles.length).toBeGreaterThan(0);

    for (const circle of circles) {
      const [cx, cy, r] = numbers(circle, 'cx', 'cy', 'r');

      expect(cx! - r!).toBeGreaterThanOrEqual(BOX.x);
      expect(cx! + r!).toBeLessThanOrEqual(BOX.x + BOX.width);
      expect(cy! - r!).toBeGreaterThanOrEqual(BOX.y);
      expect(cy! + r!).toBeLessThanOrEqual(BOX.y + BOX.height);
    }
  });

  it('fills every dot with the colour it was given', () => {
    const svg = renderFragment(dots(BOX, COLOR));

    for (const circle of svg.querySelectorAll('circle')) {
      expect(circle.getAttribute('fill')).toBe(COLOR);
    }
  });

  it('emits fewer dots as the spacing grows', () => {
    const tight = renderFragment(dots(BOX, COLOR, { spacing: 16 })).querySelectorAll('circle');
    const loose = renderFragment(dots(BOX, COLOR, { spacing: 48 })).querySelectorAll('circle');

    expect(loose.length).toBeLessThan(tight.length);
  });

  it('centres the grid in the box, rather than leaving the remainder on one side', () => {
    // 80 wide with 26 spacing fits three 12px dots, leaving 16px to share.
    const svg = renderFragment(dots(BOX, COLOR, { radius: 6, spacing: 26 }));
    const centres = [...svg.querySelectorAll('circle')].map((circle) =>
      Number(circle.getAttribute('cx')),
    );

    expect((Math.min(...centres) + Math.max(...centres)) / 2).toBeCloseTo(BOX.x + BOX.width / 2);
  });

  it('emits nothing when a dot cannot fit inside the box', () => {
    const svg = renderFragment(dots({ x: 0, y: 0, width: 4, height: 4 }, COLOR, { radius: 10 }));

    expect(svg.querySelectorAll('circle')).toHaveLength(0);
  });
});

describe('stripes', () => {
  it('keeps every stripe inside the box', () => {
    const svg = renderFragment(stripes(BOX, COLOR, { width: 8, spacing: 24 }));
    const rects = [...svg.querySelectorAll('rect')];

    expect(rects.length).toBeGreaterThan(0);

    for (const rect of rects) {
      const [x, y, width, height] = numbers(rect, 'x', 'y', 'width', 'height');

      expect(x).toBeGreaterThanOrEqual(BOX.x);
      expect(x! + width!).toBeLessThanOrEqual(BOX.x + BOX.width);
      expect(y).toBe(BOX.y);
      expect(height).toBe(BOX.height);
    }
  });

  it('fills every stripe with the colour it was given', () => {
    const svg = renderFragment(stripes(BOX, COLOR));

    for (const rect of svg.querySelectorAll('rect')) {
      expect(rect.getAttribute('fill')).toBe(COLOR);
    }
  });

  it('emits nothing when a stripe cannot fit inside the box', () => {
    const svg = renderFragment(stripes({ x: 0, y: 0, width: 4, height: 40 }, COLOR, { width: 10 }));

    expect(svg.querySelectorAll('rect')).toHaveLength(0);
  });

  describe('horizontal', () => {
    const horizontal = { orientation: 'horizontal' } as const;

    it('runs each stripe the full width of the box', () => {
      const svg = renderFragment(stripes(BOX, COLOR, { ...horizontal, width: 8, spacing: 24 }));
      const rects = [...svg.querySelectorAll('rect')];

      expect(rects.length).toBeGreaterThan(0);

      for (const rect of rects) {
        const [x, y, width, height] = numbers(rect, 'x', 'y', 'width', 'height');

        expect(x).toBe(BOX.x);
        expect(width).toBe(BOX.width);
        expect(height).toBe(8);
        expect(y).toBeGreaterThanOrEqual(BOX.y);
        expect(y! + height!).toBeLessThanOrEqual(BOX.y + BOX.height);
      }
    });

    it('stacks along the height rather than the width', () => {
      const svg = renderFragment(stripes(BOX, COLOR, { ...horizontal, width: 8, spacing: 24 }));
      const ys = [...svg.querySelectorAll('rect')].map((rect) => Number(rect.getAttribute('y')));

      expect(new Set(ys).size).toBe(ys.length);
    });

    it('centres the stack in the box', () => {
      const svg = renderFragment(stripes(BOX, COLOR, { ...horizontal, width: 8, spacing: 25 }));
      const ys = [...svg.querySelectorAll('rect')].map((rect) => Number(rect.getAttribute('y')));

      expect((Math.min(...ys) + Math.max(...ys) + 8) / 2).toBeCloseTo(BOX.y + BOX.height / 2);
    });

    it('emits nothing when a stripe cannot fit inside the box', () => {
      const svg = renderFragment(
        stripes({ x: 0, y: 0, width: 40, height: 4 }, COLOR, { ...horizontal, width: 10 }),
      );

      expect(svg.querySelectorAll('rect')).toHaveLength(0);
    });
  });
});

describe('checks', () => {
  it('keeps every cell inside the box', () => {
    const svg = renderFragment(checks(BOX, COLOR, { size: 20 }));
    const rects = [...svg.querySelectorAll('rect')];

    expect(rects.length).toBeGreaterThan(0);

    for (const rect of rects) {
      const [x, y, width, height] = numbers(rect, 'x', 'y', 'width', 'height');

      expect(x! + width!).toBeLessThanOrEqual(BOX.x + BOX.width);
      expect(y! + height!).toBeLessThanOrEqual(BOX.y + BOX.height);
    }
  });

  it('paints a checkerboard, so no two orthogonal neighbours are both filled', () => {
    const size = 20;
    const svg = renderFragment(checks(BOX, COLOR, { size }));
    const filled = new Set(
      [...svg.querySelectorAll('rect')].map((rect) => {
        const [x, y] = numbers(rect, 'x', 'y');

        return `${String(Math.round((x! - BOX.x) / size))},${String(Math.round((y! - BOX.y) / size))}`;
      }),
    );

    for (const cell of filled) {
      const [column, row] = cell.split(',').map(Number);

      expect(filled.has(`${String(column! + 1)},${String(row!)}`)).toBe(false);
      expect(filled.has(`${String(column!)},${String(row! + 1)}`)).toBe(false);
    }
  });

  it('emits nothing when a cell cannot fit inside the box', () => {
    const svg = renderFragment(checks({ x: 0, y: 0, width: 4, height: 4 }, COLOR, { size: 10 }));

    expect(svg.querySelectorAll('rect')).toHaveLength(0);
  });
});

describe('every generator', () => {
  it.each([
    ['dots', dots(BOX, COLOR)],
    ['stripes', stripes(BOX, COLOR)],
    ['checks', checks(BOX, COLOR)],
  ])('keeps %s free of the forbidden svg features', (_name, fragment) => {
    const svg = renderFragment(fragment);

    expect(
      svg.querySelectorAll('linearGradient, radialGradient, filter, image, pattern, mask'),
    ).toHaveLength(0);
  });
});

import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { THUMB_FOCUS, VIEW_BOX, type Box } from '../anchors';
import { Thumb } from './Thumb';

const swatch = (color: string) => <rect data-part="swatch" fill={color} />;

/** Scoped to its own container, so a test may render more than one thumbnail. */
const renderThumb = (focus: Box = THUMB_FOCUS.top): SVGSVGElement => {
  const { container } = render(
    <Thumb render={swatch} color="#1D9E75" focus={focus} label="Escolher blusa" />,
  );

  return container.querySelector('svg')!;
};

/** Pulls the numbers out of `translate(a b) scale(c)`. */
const transformOf = (svg: SVGSVGElement): { x: number; y: number; scale: number } => {
  const raw = svg.querySelector('g')?.getAttribute('transform') ?? '';
  const [x, y, scale] = [...raw.matchAll(/-?\d+(?:\.\d+)?/g)].map((match) => Number(match[0]));

  return { x: x!, y: y!, scale: scale! };
};

describe('Thumb', () => {
  it('shares the doll viewBox, so artwork and thumbnail cannot disagree', () => {
    expect(renderThumb().getAttribute('viewBox')).toBe('0 0 680 540');
  });

  it('names itself for assistive technology, carrying no visible text', () => {
    const svg = renderThumb();

    expect(svg).toHaveAttribute('aria-label', 'Escolher blusa');
    expect(svg.textContent).toBe('');
  });

  it('renders the fragment it is given, in the colour it is given', () => {
    expect(renderThumb().querySelector('[data-part="swatch"]')).toHaveAttribute('fill', '#1D9E75');
  });

  it('magnifies a small region more than a large one', () => {
    const shoes = transformOf(renderThumb(THUMB_FOCUS.shoes));
    const top = transformOf(renderThumb(THUMB_FOCUS.top));

    expect(shoes.scale).toBeGreaterThan(top.scale);
  });

  it.each(Object.entries(THUMB_FOCUS))('centres the %s focus box on the canvas', (_name, focus) => {
    const { x, y, scale } = transformOf(renderThumb(focus));

    expect(x + focus.x * scale + (focus.width * scale) / 2).toBeCloseTo(VIEW_BOX.width / 2);
    expect(y + focus.y * scale + (focus.height * scale) / 2).toBeCloseTo(VIEW_BOX.height / 2);
  });

  it('accepts a class name so the tray owns its size', () => {
    render(
      <Thumb
        render={swatch}
        color="#1D9E75"
        focus={THUMB_FOCUS.top}
        label="Blusa"
        className="thumb"
      />,
    );

    expect(screen.getByRole('img')).toHaveClass('thumb');
  });
});

describe('THUMB_FOCUS', () => {
  it.each(Object.entries(THUMB_FOCUS))(
    'keeps the %s focus box inside the viewBox',
    (_name, box) => {
      expect(box.x).toBeGreaterThanOrEqual(0);
      expect(box.y).toBeGreaterThanOrEqual(0);
      expect(box.x + box.width).toBeLessThanOrEqual(VIEW_BOX.width);
      expect(box.y + box.height).toBeLessThanOrEqual(VIEW_BOX.height);
    },
  );
});

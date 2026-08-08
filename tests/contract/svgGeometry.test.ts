import { describe, expect, it } from 'vitest';

import { boundsOf, colorsOf, pathDataOf } from './svgGeometry';

/** Parses an SVG snippet without React, so the helper is tested in isolation. */
const parse = (markup: string): SVGSVGElement => {
  const document = new DOMParser().parseFromString(
    `<svg xmlns="http://www.w3.org/2000/svg">${markup}</svg>`,
    'image/svg+xml',
  );

  return document.documentElement as unknown as SVGSVGElement;
};

describe('boundsOf', () => {
  it('returns null for an empty root', () => {
    expect(boundsOf(parse(''))).toBeNull();
  });

  it('ignores elements it cannot measure', () => {
    expect(boundsOf(parse('<title>ignored</title>'))).toBeNull();
  });

  it('measures a rect', () => {
    expect(boundsOf(parse('<rect x="10" y="20" width="30" height="40" />'))).toStrictEqual({
      minX: 10,
      minY: 20,
      maxX: 40,
      maxY: 60,
    });
  });

  it('treats a missing coordinate as zero', () => {
    expect(boundsOf(parse('<rect width="30" height="40" />'))).toStrictEqual({
      minX: 0,
      minY: 0,
      maxX: 30,
      maxY: 40,
    });
  });

  it('measures a circle', () => {
    expect(boundsOf(parse('<circle cx="100" cy="50" r="10" />'))).toStrictEqual({
      minX: 90,
      minY: 40,
      maxX: 110,
      maxY: 60,
    });
  });

  it('measures an ellipse', () => {
    expect(boundsOf(parse('<ellipse cx="100" cy="50" rx="20" ry="5" />'))).toStrictEqual({
      minX: 80,
      minY: 45,
      maxX: 120,
      maxY: 55,
    });
  });

  it('measures a line regardless of point order', () => {
    expect(boundsOf(parse('<line x1="30" y1="40" x2="10" y2="20" />'))).toStrictEqual({
      minX: 10,
      minY: 20,
      maxX: 30,
      maxY: 40,
    });
  });

  it.each(['polygon', 'polyline'])('measures a %s', (tag) => {
    expect(boundsOf(parse(`<${tag} points="10,20 40,20 40,60" />`))).toStrictEqual({
      minX: 10,
      minY: 20,
      maxX: 40,
      maxY: 60,
    });
  });

  it('skips a polygon with no points', () => {
    expect(boundsOf(parse('<polygon points="" />'))).toBeNull();
  });

  it('measures a path', () => {
    expect(boundsOf(parse('<path d="M10 20 L110 220 Z" />'))).toStrictEqual({
      minX: 10,
      minY: 20,
      maxX: 110,
      maxY: 220,
    });
  });

  it('skips a path with no data', () => {
    expect(boundsOf(parse('<path />'))).toBeNull();
  });

  it('unions every primitive it finds', () => {
    const bounds = boundsOf(
      parse('<rect x="0" y="0" width="10" height="10" /><circle cx="100" cy="100" r="5" />'),
    );

    expect(bounds).toStrictEqual({ minX: 0, minY: 0, maxX: 105, maxY: 105 });
  });

  it('applies an ancestor translate', () => {
    const bounds = boundsOf(
      parse('<g transform="translate(100 200)"><rect width="10" height="10" /></g>'),
    );

    expect(bounds).toStrictEqual({ minX: 100, minY: 200, maxX: 110, maxY: 210 });
  });

  it('applies an ancestor scale', () => {
    const bounds = boundsOf(parse('<g transform="scale(2)"><rect width="10" height="10" /></g>'));

    expect(bounds).toStrictEqual({ minX: 0, minY: 0, maxX: 20, maxY: 20 });
  });

  it('composes nested transforms outermost first', () => {
    const bounds = boundsOf(
      parse(
        '<g transform="translate(100 100) scale(2)"><g transform="translate(5 5)">' +
          '<rect width="10" height="10" /></g></g>',
      ),
    );

    expect(bounds).toStrictEqual({ minX: 110, minY: 110, maxX: 130, maxY: 130 });
  });

  it('ignores a transform on the root itself', () => {
    const root = parse('<rect width="10" height="10" />');
    root.setAttribute('transform', 'translate(500 500)');

    expect(boundsOf(root)).toStrictEqual({ minX: 0, minY: 0, maxX: 10, maxY: 10 });
  });
});

describe('colorsOf', () => {
  it('collects fills and strokes, uppercased', () => {
    const colors = colorsOf(parse('<rect fill="#7f77dd" stroke="#1d9e75" />'));

    expect(colors.sort()).toStrictEqual(['#1D9E75', '#7F77DD']);
  });

  it('deduplicates a colour used more than once', () => {
    expect(colorsOf(parse('<rect fill="#7F77DD" /><circle fill="#7F77DD" />'))).toStrictEqual([
      '#7F77DD',
    ]);
  });

  it('ignores an explicit none', () => {
    expect(colorsOf(parse('<rect fill="none" stroke="none" />'))).toStrictEqual([]);
  });

  it('returns nothing when no colour is set', () => {
    expect(colorsOf(parse('<rect />'))).toStrictEqual([]);
  });
});

describe('pathDataOf', () => {
  it('collects every path definition', () => {
    expect(pathDataOf(parse('<path d="M0 0 L1 1" /><path d="M2 2 L3 3" />'))).toStrictEqual([
      'M0 0 L1 1',
      'M2 2 L3 3',
    ]);
  });

  it('reports a path with no data as empty', () => {
    expect(pathDataOf(parse('<path />'))).toStrictEqual(['']);
  });
});

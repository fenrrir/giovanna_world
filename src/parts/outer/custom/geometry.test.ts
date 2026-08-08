import { describe, expect, it } from 'vitest';

import { ANCHORS } from '../../../anchors';
import {
  collarShape,
  cuffPath,
  hemPath,
  panelPath,
  sleevePath,
  type OuterAnchors,
} from './geometry';
import { COLLARS, DEFAULT_OUTER_PARAMS, type OuterParams } from './params';

const at = (params: Partial<OuterParams> = {}): OuterParams => ({
  ...DEFAULT_OUTER_PARAMS,
  ...params,
});

/** Every setting worth drawing at, including both ends of both axes. */
const SETTINGS: OuterParams[] = [
  at({ length: 0, sleeve: 0 }),
  at({ length: 1, sleeve: 1 }),
  at({ length: 0, sleeve: 1 }),
  at({ length: 1, sleeve: 0 }),
  at(),
];

const numbersIn = (path: string): number[] =>
  [...path.matchAll(/-?\d+(?:\.\d+)?/g)].map((match) => Number(match[0]));

const xs = (path: string): number[] => numbersIn(path).filter((_, index) => index % 2 === 0);
const ys = (path: string): number[] => numbersIn(path).filter((_, index) => index % 2 === 1);

const everyPath = (params: OuterParams, a?: OuterAnchors): string[] =>
  [
    panelPath(-1, params, a),
    panelPath(1, params, a),
    sleevePath(-1, params, a),
    sleevePath(1, params, a),
    cuffPath(-1, params, a),
    cuffPath(1, params, a),
    hemPath(-1, params, a),
    hemPath(1, params, a),
    collarShape(params, a) ?? '',
  ].filter((path) => path !== '');

describe('the jacket geometry', () => {
  it.each(SETTINGS.map((params, index) => [index, params]))(
    'uses absolute commands only at setting %i',
    (_index, params) => {
      for (const path of everyPath(params)) {
        expect(path).toMatch(/^[MLHVCSQTAZ0-9\s.,-]+$/);
      }
    },
  );

  it.each(SETTINGS.map((params, index) => [index, params]))(
    'stays inside the doll bounds at setting %i',
    (_index, params) => {
      for (const path of everyPath(params)) {
        expect(Math.min(...xs(path))).toBeGreaterThanOrEqual(ANCHORS.dollBounds.x1);
        expect(Math.max(...xs(path))).toBeLessThanOrEqual(ANCHORS.dollBounds.x2);
      }
    },
  );

  /*
   * The rule that cost the first shoes a strip of bare foot: a garment must
   * cover the limb it sits on, with its edge derived from that limb's anchor.
   */
  it.each(SETTINGS.map((params, index) => [index, params]))(
    'covers the arm it hangs from at setting %i',
    (_index, params) => {
      for (const [side, arm] of [
        [-1, ANCHORS.armLeft],
        [1, ANCHORS.armRight],
      ] as const) {
        const sleeve = xs(sleevePath(side, params));

        expect(Math.min(...sleeve)).toBeLessThanOrEqual(arm.x1);
        expect(Math.max(...sleeve)).toBeGreaterThanOrEqual(arm.x2);
      }
    },
  );

  it('leaves the front open, so the top underneath still shows', () => {
    const left = Math.max(...xs(panelPath(-1, at())));
    const right = Math.min(...xs(panelPath(1, at())));

    expect(left).toBeLessThan(right);
  });

  it('hangs from the shoulder at every length', () => {
    for (const params of SETTINGS) {
      expect(Math.min(...ys(panelPath(-1, params)))).toBeLessThanOrEqual(ANCHORS.shoulderLeft.y);
    }
  });

  it('reaches the waist even at its shortest, and further as it lengthens', () => {
    const short = Math.max(...ys(panelPath(-1, at({ length: 0 }))));
    const long = Math.max(...ys(panelPath(-1, at({ length: 1 }))));

    expect(short).toBeGreaterThanOrEqual(ANCHORS.waist.y);
    expect(long).toBeGreaterThan(short);
  });

  it('lengthens the sleeve down the arm without passing the hand', () => {
    const capped = Math.max(...ys(cuffPath(-1, at({ sleeve: 0 }))));
    const full = Math.max(...ys(cuffPath(-1, at({ sleeve: 1 }))));

    expect(capped).toBeLessThan(full);
    expect(full).toBeLessThanOrEqual(ANCHORS.handLeft.y);
  });

  /*
   * No collar may rise above the jaw. `outer` paints at z 60, over the body, so
   * anything crossing the head would cover her face rather than sit behind it.
   */
  it.each(COLLARS)('keeps the %s collar below the chin', (collar) => {
    const path = collarShape(at({ collar }));

    if (path === null) return;

    expect(Math.min(...ys(path))).toBeGreaterThanOrEqual(ANCHORS.chin.y);
  });

  it('draws nothing at all when she has chosen no collar', () => {
    expect(collarShape(at({ collar: 'none' }))).toBeNull();
  });

  /*
   * Hand the builders a body shifted down the canvas. Every coordinate has to
   * move with it — one retyped number would stay behind (CLAUDE.md: import the
   * anchors, never a coordinate).
   */
  it('reads the anchors rather than repeating them', () => {
    const SHIFT = 30;
    const shifted: OuterAnchors = {
      shoulderLeft: { y: ANCHORS.shoulderLeft.y + SHIFT },
      torso: { ...ANCHORS.torso, y1: ANCHORS.torso.y1 + SHIFT },
      waist: { y: ANCHORS.waist.y + SHIFT },
      hip: { y: ANCHORS.hip.y + SHIFT },
      armLeft: {
        ...ANCHORS.armLeft,
        y1: ANCHORS.armLeft.y1 + SHIFT,
        y2: ANCHORS.armLeft.y2 + SHIFT,
      },
      armRight: ANCHORS.armRight,
      neckBase: ANCHORS.neckBase,
    };

    const before = ys(panelPath(-1, at(), ANCHORS));
    const after = ys(panelPath(-1, at(), shifted));

    expect(after).toStrictEqual(before.map((y) => y + SHIFT));
  });
});

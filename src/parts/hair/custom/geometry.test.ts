import pathBounds from 'svg-path-bounds';
import { describe, expect, it } from 'vitest';

import { ANCHORS, VIEW_BOX } from '../../../anchors';
import {
  hairBackPath,
  hairFoldPath,
  hairFrontPath,
  hairStrandPath,
  type HairAnchors,
} from './geometry';
import { DEFAULT_HAIR_PARAMS, FRINGES, type HairParams } from './params';

/**
 * The same gate the contract suite applies to registered artwork
 * (tests/contract/registry.test.tsx). Note the absent `e`: a coordinate that
 * stringifies in exponent notation fails here, which is why every number the
 * builders emit is rounded.
 */
const ABSOLUTE_PATH = /^[MLHVCSQTAZ\d\s.,-]+$/;

const BUILDERS = {
  back: hairBackPath,
  fold: hairFoldPath,
  front: hairFrontPath,
  strand: hairStrandPath,
};

type BuilderName = keyof typeof BUILDERS;

const NAMES = Object.keys(BUILDERS) as BuilderName[];

/** The ends and the middle of every continuous axis, against every fringe. */
const STOPS = [0, 0.5, 1];

const SWEEP: HairParams[] = STOPS.flatMap((length) =>
  STOPS.flatMap((volume) =>
    STOPS.flatMap((wave) => FRINGES.map((fringe) => ({ length, volume, wave, fringe }))),
  ),
);

const CASE = 'length $length, volume $volume, wave $wave, $fringe fringe';

/** Every coordinate pair in the path. Sound because the builders emit only M, C and Z. */
const coordsOf = (d: string): { x: number; y: number }[] => {
  const numbers = (d.match(/-?\d+(?:\.\d+)?/g) ?? []).map(Number);

  return numbers
    .filter((_, index) => index % 2 === 0)
    .map((x, pair) => ({ x, y: numbers[pair * 2 + 1]! }));
};

const boundsOf = (paths: string[]): { minX: number; minY: number; maxX: number; maxY: number } => {
  const boxes = paths.map((d) => pathBounds(d));

  return {
    minX: Math.min(...boxes.map(([minX]) => minX)),
    minY: Math.min(...boxes.map(([, minY]) => minY)),
    maxX: Math.max(...boxes.map(([, , maxX]) => maxX)),
    maxY: Math.max(...boxes.map(([, , , maxY]) => maxY)),
  };
};

const everyPath = (params: HairParams): string[] => NAMES.map((name) => BUILDERS[name](params));

describe('the hairstyles the axes can produce', () => {
  it('covers all four fringes at both ends and the middle of every axis', () => {
    expect(SWEEP).toHaveLength(STOPS.length ** 3 * FRINGES.length);
  });

  it.each(SWEEP)(`${CASE} emits absolute commands only`, (params) => {
    for (const name of NAMES) {
      expect(BUILDERS[name](params), `${name} uses a relative command`).toMatch(ABSOLUTE_PATH);
    }
  });

  it.each(SWEEP)(`${CASE} emits no NaN and no exponent`, (params) => {
    for (const name of NAMES) {
      expect(BUILDERS[name](params), `${name} emits an unusable number`).not.toMatch(
        /NaN|Infinity|e[-+]/i,
      );
    }
  });

  it.each(SWEEP)(`${CASE} ends on a digit or Z, with no trailing space`, (params) => {
    // is-svg-path gates pathBounds on this, and throws rather than failing.
    for (const name of NAMES) {
      expect(BUILDERS[name](params), `${name} ends badly`).toMatch(/[\dZ]$/);
    }
  });

  it.each(SWEEP)(`${CASE} stays inside the viewBox`, (params) => {
    const bounds = boundsOf(everyPath(params));

    expect(bounds.minX).toBeGreaterThanOrEqual(0);
    expect(bounds.minY).toBeGreaterThanOrEqual(0);
    expect(bounds.maxX).toBeLessThanOrEqual(VIEW_BOX.width);
    expect(bounds.maxY).toBeLessThanOrEqual(VIEW_BOX.height);
  });

  it.each(SWEEP)(`${CASE} stays within the doll's lateral bounds`, (params) => {
    const bounds = boundsOf(everyPath(params));

    expect(bounds.minX).toBeGreaterThanOrEqual(ANCHORS.dollBounds.x1);
    expect(bounds.maxX).toBeLessThanOrEqual(ANCHORS.dollBounds.x2);
  });

  it.each(SWEEP)(`${CASE} spans the hairBack anchor band`, (params) => {
    const bounds = boundsOf([hairBackPath(params), hairFoldPath(params)]);

    expect(bounds.minY, 'starts below the skull').toBeLessThanOrEqual(ANCHORS.skullTop.y);
    expect(bounds.maxY, 'ends above the chin').toBeGreaterThanOrEqual(ANCHORS.chin.y);
  });

  it.each(SWEEP)(`${CASE} spans the hairFront anchor band`, (params) => {
    const bounds = boundsOf([hairFrontPath(params), hairStrandPath(params)]);

    expect(bounds.minY, 'starts below the skull').toBeLessThanOrEqual(ANCHORS.skullTop.y);
    expect(bounds.maxY, 'ends above the eyes').toBeGreaterThanOrEqual(ANCHORS.eyeLine.y);
  });

  it.each(SWEEP)(`${CASE} covers the sides of the head with the front layer`, (params) => {
    // A thin hairline leaves the outer skull showing beside it (CLAUDE.md).
    const [minX, , maxX] = pathBounds(hairFrontPath(params));

    expect(minX).toBeLessThanOrEqual(ANCHORS.headCenter.x - ANCHORS.headCenter.r);
    expect(maxX).toBeGreaterThanOrEqual(ANCHORS.headCenter.x + ANCHORS.headCenter.r);
  });
});

describe('the axes do what they say', () => {
  const at = (params: Partial<HairParams>): HairParams => ({ ...DEFAULT_HAIR_PARAMS, ...params });

  it('reaches further down the back the longer it is set', () => {
    expect(pathBounds(hairBackPath(at({ length: 1 })))[3]).toBeGreaterThan(
      pathBounds(hairBackPath(at({ length: 0 })))[3],
    );
  });

  it('is wider at full volume, and never narrower than the head', () => {
    const thin = pathBounds(hairBackPath(at({ volume: 0 })));
    const full = pathBounds(hairBackPath(at({ volume: 1 })));

    expect(full[2] - full[0]).toBeGreaterThan(thin[2] - thin[0]);
    expect(thin[2] - thin[0]).toBeGreaterThanOrEqual(ANCHORS.headCenter.r * 2);
  });

  it('waves the hem rather than the crown', () => {
    const straight = pathBounds(hairBackPath(at({ wave: 0 })));
    const wavy = pathBounds(hairBackPath(at({ wave: 1 })));

    expect(wavy[1]).toBe(straight[1]);
    expect(wavy[3]).toBeGreaterThan(straight[3]);
  });

  /*
   * The hem is not enough on its own. Below the shoulders the torso and the
   * arms cover the back mass, so at anything but the longest setting a wave
   * confined to the hem moves the slider and changes nothing the child sees.
   * The strands framing the face are visible at every length.
   */
  it.each([0, 0.5, 1])('waves the strands beside the face at length %p', (length) => {
    const straight = hairFrontPath(at({ length, wave: 0 }));
    const wavy = hairFrontPath(at({ length, wave: 1 }));

    expect(wavy).not.toBe(straight);
  });

  it.each(FRINGES)('gives the %s fringe a shape of its own', (fringe) => {
    const others = FRINGES.filter((other) => other !== fringe).map((other) =>
      hairFrontPath(at({ fringe: other })),
    );

    expect(others).not.toContain(hairFrontPath(at({ fringe })));
  });

  it('still frames the face when there is no fringe at all', () => {
    // The document has hairFront return '' here; that paints nothing, which the
    // contract suite rejects, and it leaves the temples bare (CLAUDE.md).
    expect(pathBounds(hairFrontPath(at({ fringe: 'none' })))[3]).toBeGreaterThanOrEqual(
      ANCHORS.eyeLine.y,
    );
  });
});

/**
 * The test that proves no body coordinate was written into the builders.
 *
 * Shifting every anchor the hair reads must shift the whole path by the same
 * amount and nothing else. A hardcoded number stays put and fails here; if this
 * ever passes by accident, something is being retyped rather than derived.
 */
describe('anchors', () => {
  const shifted = (dx: number, dy: number): HairAnchors => ({
    skullTop: { x: ANCHORS.skullTop.x + dx, y: ANCHORS.skullTop.y + dy },
    headCenter: {
      x: ANCHORS.headCenter.x + dx,
      y: ANCHORS.headCenter.y + dy,
      r: ANCHORS.headCenter.r,
    },
    eyeLine: { y: ANCHORS.eyeLine.y + dy },
    chin: { y: ANCHORS.chin.y + dy },
    neckBase: { y: ANCHORS.neckBase.y + dy },
    hip: { y: ANCHORS.hip.y + dy },
  });

  it.each(NAMES)('moves the %s path down with the head', (name) => {
    const before = coordsOf(BUILDERS[name](DEFAULT_HAIR_PARAMS));
    const after = coordsOf(BUILDERS[name](DEFAULT_HAIR_PARAMS, shifted(0, 10)));

    expect(after).toStrictEqual(before.map(({ x, y }) => ({ x, y: y + 10 })));
  });

  it.each(NAMES)('moves the %s path sideways with the head', (name) => {
    const before = coordsOf(BUILDERS[name](DEFAULT_HAIR_PARAMS));
    const after = coordsOf(BUILDERS[name](DEFAULT_HAIR_PARAMS, shifted(-7, 0)));

    expect(after).toStrictEqual(before.map(({ x, y }) => ({ x: x - 7, y })));
  });

  it.each(NAMES)('defaults the %s path to the real anchors', (name) => {
    expect(BUILDERS[name](DEFAULT_HAIR_PARAMS)).toBe(BUILDERS[name](DEFAULT_HAIR_PARAMS, ANCHORS));
  });
});

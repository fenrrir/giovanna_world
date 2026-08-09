import { describe, it } from 'vitest';

import { PALETTES } from '../../src/model/palettes';
import type { Look } from '../../src/model/types';
import { CUSTOM_HAIR_ID } from '../../src/parts/hair/custom';
import { DEFAULT_HAIR_PARAMS, FRINGES, type HairParams } from '../../src/parts/hair/custom/params';
import { HOLE_BACKDROP, drawLook, writePreview } from './preview';

/**
 * Headless visual check of the parametric hairstyle, across its axes.
 *
 * The tray and `/dev/sheet` only ever show one point of the parameter space —
 * whatever the child is wearing. This walks the ends and the middle of every
 * axis instead, which is the only way to see that the curve still holds where
 * nobody has looked. What the files are made of is in `preview.tsx`.
 *
 * On macOS:
 *   qlmanage -t -s 680 -o preview preview/hair-*.svg
 */

const wearing = (params: HairParams): Look => ({
  schemaVersion: 1,
  skin: PALETTES.skin[1],
  equipped: {
    hairBack: { partId: CUSTOM_HAIR_ID, color: PALETTES.hair[0], params },
    hairFront: { partId: CUSTOM_HAIR_ID, color: PALETTES.hair[0], params },
  },
});

const draw = (params: HairParams): string => drawLook(wearing(params));

const at = (params: Partial<HairParams>): HairParams => ({ ...DEFAULT_HAIR_PARAMS, ...params });

const STOPS = [0, 0.5, 1];

/** Every continuous axis at both ends and the middle, then every fringe. */
const CASES: [string, HairParams][] = [
  ...(['length', 'volume', 'wave'] as const).flatMap((axis): [string, HairParams][] =>
    STOPS.map((value) => [`${axis}-${String(value)}`, at({ [axis]: value })]),
  ),
  ...FRINGES.map((fringe): [string, HairParams] => [`fringe-${fringe}`, at({ fringe })]),
  ['extremes-shortest', at({ length: 0, volume: 0, wave: 0, fringe: 'none' })],
  ['extremes-longest', at({ length: 1, volume: 1, wave: 1, fringe: 'curtain' })],
];

describe('hair axes preview', () => {
  it.each(CASES)('writes the doll wearing %s', (name, params) => {
    writePreview(`hair-${name}`, draw(params));
    writePreview(`hair-${name}-holes`, draw(params), HOLE_BACKDROP);
  });
});

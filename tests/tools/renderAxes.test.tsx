import { mkdirSync, writeFileSync } from 'node:fs';

import { renderToStaticMarkup } from 'react-dom/server';
import { describe, it } from 'vitest';

import { VIEW_BOX_ATTR } from '../../src/anchors';
import { PALETTES } from '../../src/model/palettes';
import type { Look } from '../../src/model/types';
import { CUSTOM_HAIR_ID } from '../../src/parts/hair/custom';
import { DEFAULT_HAIR_PARAMS, FRINGES, type HairParams } from '../../src/parts/hair/custom/params';
import { BODY, findPart } from '../../src/parts/registry';
import { resolveLayers } from '../../src/render/resolve';

/**
 * Headless visual check of the parametric hairstyle, across its axes.
 *
 * The tray and `/dev/sheet` only ever show one point of the parameter space —
 * whatever the child is wearing. This walks the ends and the middle of every
 * axis instead, which is the only way to see that the curve still holds where
 * nobody has looked. It asserts nothing; the contract and geometry suites do
 * that. Output is gitignored.
 *
 * On macOS, turn the files into images with:
 *   qlmanage -t -s 680 -o preview preview/hair-*.svg
 */

const OUT = 'preview';

/** Magenta, so a gap between the hair and the head is unmistakable. */
const HOLE_BACKDROP = '#FF00FF';

const page = (body: string, backdrop = '#F1F0FB'): string =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${VIEW_BOX_ATTR}" width="680" height="540">` +
  `<rect width="680" height="540" fill="${backdrop}"/>${body}</svg>`;

const wearing = (params: HairParams): Look => ({
  schemaVersion: 1,
  skin: PALETTES.skin[1],
  equipped: {
    hairBack: { partId: CUSTOM_HAIR_ID, color: PALETTES.hair[0], params },
    hairFront: { partId: CUSTOM_HAIR_ID, color: PALETTES.hair[0], params },
  },
});

const draw = (params: HairParams): string =>
  resolveLayers(wearing(params), findPart, BODY)
    .map((layer) => renderToStaticMarkup(<g>{layer.part.render(layer.color)}</g>))
    .join('');

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
    mkdirSync(OUT, { recursive: true });

    writeFileSync(`${OUT}/hair-${name}.svg`, page(draw(params)));
    writeFileSync(`${OUT}/hair-${name}-holes.svg`, page(draw(params), HOLE_BACKDROP));
  });
});

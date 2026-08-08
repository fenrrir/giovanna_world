import { mkdirSync, writeFileSync } from 'node:fs';

import { renderToStaticMarkup } from 'react-dom/server';
import { describe, it } from 'vitest';

import { VIEW_BOX_ATTR } from '../../src/anchors';
import { PALETTES } from '../../src/model/palettes';
import type { Look } from '../../src/model/types';
import { BODY, findPart } from '../../src/parts/registry';
import { resolveLayers } from '../../src/render/resolve';

/**
 * Headless visual check.
 *
 * `/dev/sheet` is the real quality tool, but it needs a browser. This writes
 * the same artwork to standalone SVG files so it can be looked at anywhere —
 * including a sandbox with no browser at all. It asserts nothing; the contract
 * suite does that. Output is gitignored.
 *
 * On macOS, turn the files into images with:
 *   qlmanage -t -s 680 -o preview preview/*.svg
 */

const OUT = 'preview';

/**
 * Magenta, so a gap between two parts is unmistakable. A hole where one layer
 * fails to meet the next is invisible against a soft background and impossible
 * to miss against this one — it is how the shoulder seam and the shoe join were
 * both found.
 */
const HOLE_BACKDROP = '#FF00FF';

const page = (body: string, backdrop = '#F1F0FB'): string =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${VIEW_BOX_ATTR}" width="680" height="540">` +
  `<rect width="680" height="540" fill="${backdrop}"/>${body}</svg>`;

const draw = (look: Look): string =>
  resolveLayers(look, findPart, BODY)
    .map((layer) => renderToStaticMarkup(<g>{layer.part.render(layer.color)}</g>))
    .join('');

const BARE: Look = { schemaVersion: 1, skin: PALETTES.skin[0], equipped: {} };

const DRESSED: Look = {
  schemaVersion: 1,
  skin: PALETTES.skin[1],
  equipped: {
    hairBack: { partId: 'hair.bob-fringe', color: '#6B3A1F' },
    hairFront: { partId: 'hair.bob-fringe', color: '#6B3A1F' },
    top: { partId: 'top.t-shirt', color: '#1D9E75' },
    bottom: { partId: 'bottom.skirt', color: '#D4537E' },
    shoes: { partId: 'shoes.sneakers', color: '#378ADD' },
  },
};

describe('preview', () => {
  it('writes the doll to preview/ for visual review', () => {
    mkdirSync(OUT, { recursive: true });
    writeFileSync(`${OUT}/bare.svg`, page(draw(BARE)));
    writeFileSync(`${OUT}/dressed.svg`, page(draw(DRESSED)));
    writeFileSync(`${OUT}/holes.svg`, page(draw(DRESSED), HOLE_BACKDROP));
  });
});

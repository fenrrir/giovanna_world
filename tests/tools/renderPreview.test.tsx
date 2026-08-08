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

const page = (body: string): string =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${VIEW_BOX_ATTR}" width="680" height="540">` +
  `<rect width="680" height="540" fill="#F1F0FB"/>${body}</svg>`;

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
  });
});

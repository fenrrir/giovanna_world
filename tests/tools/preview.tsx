import { mkdirSync, writeFileSync } from 'node:fs';

import { renderToStaticMarkup } from 'react-dom/server';

import { VIEW_BOX_ATTR } from '../../src/anchors';
import { PALETTES } from '../../src/model/palettes';
import type { Look } from '../../src/model/types';
import { BODY, findPart } from '../../src/parts/registry';
import { resolveLayers } from '../../src/render/resolve';

/**
 * What every headless preview is made of.
 *
 * `/dev/sheet` is the real quality tool, but it needs a browser. These write
 * the same artwork to standalone SVG files so it can be looked at anywhere —
 * including a sandbox with no browser at all. They assert nothing; the contract
 * suite does that. Output is gitignored.
 *
 * On macOS, turn the files into images with:
 *   qlmanage -t -s 1400 -o preview preview/*.svg
 */

export const OUT = 'preview';

/**
 * Magenta, so a gap between two layers is unmistakable. A hole where one fails
 * to meet the next is invisible against a soft background and impossible to
 * miss against this one — it is how the shoulder seam and the shoe join were
 * both found.
 */
export const HOLE_BACKDROP = '#FF00FF';

export const page = (body: string, backdrop = '#F1F0FB'): string =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${VIEW_BOX_ATTR}" width="680" height="540">` +
  `<rect width="680" height="540" fill="${backdrop}"/>${body}</svg>`;

/**
 * Composed through the layer resolver, never by drawing a part over the body.
 * Hair occupies a slot behind the doll and one in front of it; painting both on
 * top hides the face and makes the preview lie about the thing it exists for.
 */
export const drawLook = (look: Look): string =>
  resolveLayers(look, findPart, BODY)
    .map((layer) => renderToStaticMarkup(<g>{layer.part.render(layer.color)}</g>))
    .join('');

/** File-safe name for an id such as `top.polka-dot-dress` or `house.bedroom`. */
export const slug = (id: string): string => id.replace(/[^a-z0-9]+/gi, '-');

export const writePreview = (name: string, body: string, backdrop?: string): void => {
  mkdirSync(OUT, { recursive: true });
  writeFileSync(`${OUT}/${name}.svg`, page(body, backdrop));
};

/** Someone to stand in a room: bare skin shows a floor line, clothes show a hem. */
export const DRESSED: Look = {
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

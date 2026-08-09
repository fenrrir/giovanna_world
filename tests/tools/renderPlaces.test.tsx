import { renderToStaticMarkup } from 'react-dom/server';
import { describe, it } from 'vitest';

import { ENVIRONMENT_IDS } from '../../src/model/places';
import { dollTransform } from '../../src/world/placement';
import { ENVIRONMENTS_BY_ID } from '../../src/world/registry';
import { DRESSED, HOLE_BACKDROP, drawLook, slug, writePreview } from './preview';

/**
 * Headless visual check of the places, with somebody standing in them.
 *
 * The contract suite proves a room fills the canvas and leaves height for a
 * doll. It cannot tell you her feet are sunk into the floorboards, that she
 * towers over the furniture, or that two of her overlap — and those are the
 * three ways a room goes wrong. Nothing else in this project puts a doll and a
 * room in front of a pair of eyes at the same time.
 *
 * This exists before any room is drawn for the world, deliberately: the eye has
 * to be in place before there is something to look at.
 *
 * On macOS:
 *   qlmanage -t -s 1400 -o preview preview/place-*.svg
 */

/** Both edges and the middle: the floor line, the size, and the clamp at once. */
const STANDS = [0, 0.5, 1];

describe('places', () => {
  it.each([...ENVIRONMENT_IDS])('writes %s with somebody standing in it', (id) => {
    const environment = ENVIRONMENTS_BY_ID[id];
    const room = renderToStaticMarkup(<g>{environment.render(environment.defaultColor)}</g>);
    const dolls = STANDS.map(
      (x) => `<g transform="${dollTransform(environment.floor, x)}">${drawLook(DRESSED)}</g>`,
    ).join('');

    writePreview(`place-${slug(id)}`, room + dolls);
    writePreview(`place-${slug(id)}-holes`, room + dolls, HOLE_BACKDROP);
  });
});

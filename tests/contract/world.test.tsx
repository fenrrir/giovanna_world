import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { ANCHORS, VIEW_BOX } from '../../src/anchors';
import { ENVIRONMENT_IDS, LOCATION_IDS } from '../../src/model/places';
import { PALETTES, WORLD_COLORS } from '../../src/model/palettes';
import { MAP_SPOTS } from '../../src/world/anchors';
import { ENVIRONMENTS_BY_ID, WORLD_MAP, type Environment } from '../../src/world/registry';
import { boundsOf, colorsOf, pathDataOf } from './svgGeometry';

/**
 * SPEC section 12 for places rather than parts, mechanised the same way.
 *
 * A place owes almost everything a part owes — one colour, no forbidden
 * feature, absolute path data — and the opposite of the one rule that does not
 * fit: it must cover the whole canvas rather than leave the lateral margin
 * free. It also owes something no part does, a floor that a doll can stand on
 * without her head leaving the room.
 */

/** Absolute commands only, so the geometry above can be trusted (CLAUDE.md). */
const ABSOLUTE_PATH = /^[MLHVCSQTAZ\d\s.,-]+$/;

const FORBIDDEN = 'linearGradient, radialGradient, filter, image, pattern, mask, use';

const HEX = /^#[0-9A-Fa-f]{6}$/;

/** How tall she is drawn, from the top of her skull to the sole of her foot. */
const DOLL_HEIGHT = ANCHORS.sole.y - ANCHORS.skullTop.y;

/** What every place owes, whether a doll can stand in it or not. */
type Drawn = { id: string; defaultColor: string; render: (color: string) => React.ReactNode };

const FIXED = new Set(Object.values(WORLD_COLORS).map((color) => color.toUpperCase()));

const renderPlace = (place: Drawn, color: string): SVGSVGElement => {
  const { container } = render(<svg>{place.render(color)}</svg>);

  return container.querySelector('svg')!;
};

const renderEnvironment = renderPlace;

const everyEnvironment = (): [string, Environment][] =>
  ENVIRONMENT_IDS.map((id) => [id, ENVIRONMENTS_BY_ID[id]]);

const everyPlace = (): [string, Drawn][] => [...everyEnvironment(), ['map', WORLD_MAP]];

describe('the world registry', () => {
  it('has a place to draw for every environment the taxonomy names', () => {
    expect(Object.keys(ENVIRONMENTS_BY_ID).sort()).toStrictEqual([...ENVIRONMENT_IDS].sort());
  });

  it('files every place under its own name', () => {
    for (const [id, environment] of everyEnvironment()) {
      expect(environment.id, `${id} is registered under another name`).toBe(id);
    }
  });
});

describe.each(everyPlace())('%s', (id, environment) => {
  it('opens in a colour that is a colour', () => {
    expect(environment.defaultColor, `${id} has no usable default colour`).toMatch(HEX);
  });

  /*
   * The counterpart of the lateral margin. A backdrop that stopped short of an
   * edge would be a poster the doll is standing next to, and the stage would
   * show through beside it.
   */
  it('covers the whole canvas', () => {
    const bounds = boundsOf(renderEnvironment(environment, environment.defaultColor));

    expect(bounds, `${id} draws nothing`).not.toBeNull();
    expect(bounds!.minX, `${id} leaves a gap at the left`).toBeLessThanOrEqual(0);
    expect(bounds!.minY, `${id} leaves a gap at the top`).toBeLessThanOrEqual(0);
    expect(bounds!.maxX, `${id} leaves a gap at the right`).toBeGreaterThanOrEqual(VIEW_BOX.width);
    expect(bounds!.maxY, `${id} leaves a gap at the bottom`).toBeGreaterThanOrEqual(
      VIEW_BOX.height,
    );
  });

  /*
   * A place may keep colours of its own — a house derived from the colour of
   * the grass is a green house — but only the ones `WORLD_COLORS` declares.
   * Anything else that survives a change of colour was hardcoded.
   */
  it('derives every tone from the colour it is given, or declares it fixed', () => {
    const before = colorsOf(renderEnvironment(environment, PALETTES.fabric[0]));
    const after = colorsOf(renderEnvironment(environment, PALETTES.fabric.at(-1)!));

    expect(before, `${id} paints nothing`).not.toStrictEqual([]);

    for (const color of before.filter((one) => after.includes(one))) {
      expect(FIXED.has(color), `${id} hardcodes ${color} instead of deriving or declaring it`).toBe(
        true,
      );
    }
  });

  it.each([...PALETTES.fabric])('uses no forbidden svg feature in %s', (color) => {
    const svg = renderEnvironment(environment, color);

    expect(svg.querySelectorAll(FORBIDDEN), `${id} uses a forbidden element`).toHaveLength(0);

    for (const element of svg.querySelectorAll('[style], [filter]')) {
      const style = `${element.getAttribute('style') ?? ''} ${element.getAttribute('filter') ?? ''}`;

      expect(style, `${id} uses a shadow or blur`).not.toMatch(/drop-shadow|blur/i);
    }
  });

  it('writes path data with absolute commands only', () => {
    for (const d of pathDataOf(renderEnvironment(environment, environment.defaultColor))) {
      expect(d, `${id} uses a relative path command`).toMatch(ABSOLUTE_PATH);
    }
  });
});

/*
 * What only a room owes: a floor a doll can stand on. The map has none — she
 * looks at it rather than standing on it.
 */
describe.each(everyEnvironment())('%s floor', (id, environment) => {
  it('puts its floor inside the room', () => {
    expect(environment.floor.y, `${id} has a floor above the ceiling`).toBeGreaterThan(0);
    expect(environment.floor.y, `${id} has a floor below the room`).toBeLessThanOrEqual(
      VIEW_BOX.height,
    );
  });

  /*
   * The failure this catches is a room drawn with the horizon too low: the doll
   * stands on the floor as asked and her head goes out through the top of the
   * canvas, which no assertion about the artwork alone would see.
   */
  it('leaves room above the floor for the doll it stands there', () => {
    const { floor } = environment;

    expect(floor.scale, `${id} stands her at nothing`).toBeGreaterThan(0);
    expect(
      floor.y - floor.scale * DOLL_HEIGHT,
      `${id} pushes her head out of the room`,
    ).toBeGreaterThanOrEqual(0);
  });
});

/*
 * The map's own rule. A finger is a blunt instrument: two places whose discs
 * overlap would each steal taps meant for the other, and a place drawn off the
 * canvas could never be tapped at all.
 */
describe('the map', () => {
  it.each([...LOCATION_IDS])('keeps %s inside the canvas', (id) => {
    const spot = MAP_SPOTS[id];

    expect(spot.x - spot.r, `${id} hangs off the left`).toBeGreaterThanOrEqual(0);
    expect(spot.y - spot.r, `${id} hangs off the top`).toBeGreaterThanOrEqual(0);
    expect(spot.x + spot.r, `${id} hangs off the right`).toBeLessThanOrEqual(VIEW_BOX.width);
    expect(spot.y + spot.r, `${id} hangs off the bottom`).toBeLessThanOrEqual(VIEW_BOX.height);
  });

  it('never lets two places share a finger', () => {
    for (const one of LOCATION_IDS) {
      for (const other of LOCATION_IDS.filter((id) => id !== one)) {
        const a = MAP_SPOTS[one];
        const b = MAP_SPOTS[other];

        expect(
          Math.hypot(a.x - b.x, a.y - b.y),
          `${one} and ${other} overlap`,
        ).toBeGreaterThanOrEqual(a.r + b.r);
      }
    }
  });

  it('draws something for every place the taxonomy names', () => {
    const drawn = renderPlace(WORLD_MAP, WORLD_MAP.defaultColor);

    for (const id of LOCATION_IDS) {
      expect(
        drawn.querySelector(`[data-location="${id}"]`),
        `${id} is not on the map`,
      ).not.toBeNull();
    }
  });
});

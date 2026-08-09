import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { ANCHORS, VIEW_BOX } from '../../src/anchors';
import { ENVIRONMENT_IDS } from '../../src/model/places';
import { PALETTES } from '../../src/model/palettes';
import { ENVIRONMENTS_BY_ID, type Environment } from '../../src/world/registry';
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

const renderEnvironment = (environment: Environment, color: string): SVGSVGElement => {
  const { container } = render(<svg>{environment.render(color)}</svg>);

  return container.querySelector('svg')!;
};

const everyEnvironment = (): [string, Environment][] =>
  ENVIRONMENT_IDS.map((id) => [id, ENVIRONMENTS_BY_ID[id]]);

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

describe.each(everyEnvironment())('%s', (id, environment) => {
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

  it('derives every tone from the colour it is given', () => {
    const before = colorsOf(renderEnvironment(environment, PALETTES.fabric[0]));
    const after = colorsOf(renderEnvironment(environment, PALETTES.fabric.at(-1)!));

    expect(before, `${id} paints nothing`).not.toStrictEqual([]);
    expect(
      before.filter((color) => after.includes(color)),
      `${id} hardcodes a tone instead of deriving it via shade`,
    ).toStrictEqual([]);
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

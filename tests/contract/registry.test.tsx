import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { ANCHORS, VIEW_BOX } from '../../src/anchors';
import { FIXED_COLORS, PALETTES } from '../../src/model/palettes';
import { RENDER_ORDER, type Slot } from '../../src/model/slots';
import type { Part } from '../../src/model/types';
import { CUSTOM_HAIR_ID } from '../../src/parts/hair/custom';
import { HAIR_STYLES, PARTS_BY_SLOT, findHairStyle, findPart } from '../../src/parts/registry';
import { boundsOf, colorsOf, pathDataOf } from './svgGeometry';

/**
 * SPEC section 12, mechanised.
 *
 * Every part that reaches the registry is checked here automatically, so a new
 * piece of artwork needs no test of its own. An anchor error is invisible when
 * you look at one part; this suite and /dev/sheet are what make it obvious.
 */

const FIXED = new Set(Object.values(FIXED_COLORS).map((color) => color.toUpperCase()));

/** Absolute commands only, so the geometry above can be trusted (CLAUDE.md). */
const ABSOLUTE_PATH = /^[MLHVCSQTAZ\d\s.,-]+$/;

const FORBIDDEN = 'linearGradient, radialGradient, filter, image, pattern, mask, use';

/**
 * The region a slot's artwork must reach into. A sleeve that misses the
 * shoulder or a shoe that floats above the sole fails here (SPEC section 12.2).
 */
const SLOT_ANCHORS: Partial<Record<Slot, { minY: number; maxY: number }>> = {
  hairBack: { minY: ANCHORS.skullTop.y, maxY: ANCHORS.headCenter.y + ANCHORS.headCenter.r },
  hairFront: { minY: ANCHORS.skullTop.y, maxY: ANCHORS.eyeLine.y },
  body: { minY: ANCHORS.skullTop.y, maxY: ANCHORS.sole.y },
  top: { minY: ANCHORS.shoulderLeft.y, maxY: ANCHORS.waist.y },
  // A jacket hangs from the shoulder and has to reach the waist even when the
  // child has wound it all the way short.
  outer: { minY: ANCHORS.shoulderLeft.y, maxY: ANCHORS.waist.y },
  bottom: { minY: ANCHORS.waist.y, maxY: ANCHORS.hip.y },
  shoes: { minY: ANCHORS.shoeLeft.y1, maxY: ANCHORS.sole.y },
  // A head accessory fails by floating beside the head, so what it must do is
  // span the anchor it hangs from.
  accessoryHead: { minY: ANCHORS.headAccessorySide.y, maxY: ANCHORS.headAccessorySide.y },
};

/**
 * Slots whose artwork must stay inside a region rather than reach across one.
 *
 * A brow, a mouth or a cheek goes wrong by sitting somewhere it does not belong
 * — on the forehead, below the chin — which a span check cannot see. The region
 * is the head itself, derived from its own anchor.
 */
const HEAD = {
  minX: ANCHORS.headCenter.x - ANCHORS.headCenter.r,
  maxX: ANCHORS.headCenter.x + ANCHORS.headCenter.r,
  minY: ANCHORS.headCenter.y - ANCHORS.headCenter.r,
  maxY: ANCHORS.headCenter.y + ANCHORS.headCenter.r,
};

const SLOT_REGIONS: Partial<Record<Slot, typeof HEAD>> = {
  brows: HEAD,
  lips: HEAD,
  blush: HEAD,
};

const renderPart = (part: Part, color: string): SVGSVGElement => {
  const { container } = render(<svg>{part.render(color)}</svg>);

  return container.querySelector('svg')!;
};

const everyPart = (): [string, Part][] =>
  RENDER_ORDER.flatMap((slot) =>
    PARTS_BY_SLOT[slot].map((part): [string, Part] => [part.id, part]),
  );

describe('registry invariants', () => {
  it('has an entry for every slot in the taxonomy', () => {
    expect(Object.keys(PARTS_BY_SLOT).sort()).toStrictEqual([...RENDER_ORDER].sort());
  });

  it('always carries a body, because the doll cannot be undressed to nothing', () => {
    expect(PARTS_BY_SLOT.body).toHaveLength(1);
  });

  it('gives every part an id unique within its slot', () => {
    for (const slot of RENDER_ORDER) {
      const ids = PARTS_BY_SLOT[slot].map((part) => part.id);

      expect(new Set(ids).size, `${slot} has duplicate ids`).toBe(ids.length);
    }
  });

  it('namespaces every part id under its own slot', () => {
    for (const [id, part] of everyPart()) {
      const prefix = part.slot.startsWith('hair') ? 'hair' : part.slot;

      expect(id, `${id} is not namespaced under ${part.slot}`).toMatch(new RegExp(`^${prefix}\\.`));
    }
  });

  it('gives every hairstyle a unique id', () => {
    const ids = HAIR_STYLES.map((hair) => hair.id);

    expect(new Set(ids).size).toBe(ids.length);
  });

  it('projects each hairstyle into both hair slots', () => {
    for (const hair of HAIR_STYLES) {
      expect(findPart('hairBack', hair.id), `${hair.id} is missing its back half`).toBeDefined();
      expect(findPart('hairFront', hair.id), `${hair.id} is missing its front half`).toBeDefined();
    }
  });

  it('finds every registered part through the lookup', () => {
    for (const [id, part] of everyPart()) {
      expect(findPart(part.slot, id)).toBe(part);
    }
  });

  it('returns undefined for a part that does not exist', () => {
    expect(findPart('top', 'top.nope')).toBeUndefined();
    expect(findHairStyle('hair.nope')).toBeUndefined();
  });

  it('finds every hairstyle by id', () => {
    for (const hair of HAIR_STYLES) {
      expect(findHairStyle(hair.id)).toBe(hair);
    }
  });

  describe('the generated hairstyle', () => {
    const params = { length: 1, volume: 1, wave: 1, fringe: 'curtain' };

    it('is registered in both hair slots like any other', () => {
      expect(findPart('hairBack', CUSTOM_HAIR_ID)).toBeDefined();
      expect(findPart('hairFront', CUSTOM_HAIR_ID)).toBeDefined();
    });

    it('builds different artwork for different axes', () => {
      const wide = renderPart(findPart('hairBack', CUSTOM_HAIR_ID, params)!, '#6B3A1F');
      const plain = renderPart(findPart('hairBack', CUSTOM_HAIR_ID)!, '#6B3A1F');

      expect(pathDataOf(wide)).not.toStrictEqual(pathDataOf(plain));
    });

    it('answers with the registered instance when no axes are given', () => {
      // Identity matters: the lookup above asserts findPart returns the very
      // part PARTS_BY_SLOT holds, and a part rebuilt per call would not.
      expect(findPart('hairFront', CUSTOM_HAIR_ID)).toBe(findPart('hairFront', CUSTOM_HAIR_ID));
    });

    it('stays out of a slot that is not hair, whatever axes arrive', () => {
      expect(findPart('top', CUSTOM_HAIR_ID, params)).toBeUndefined();
    });

    it('is not a ready-made hairstyle, so the randomiser cannot draw it', () => {
      expect(HAIR_STYLES.map((hair) => hair.id)).not.toContain(CUSTOM_HAIR_ID);
      expect(findHairStyle(CUSTOM_HAIR_ID)).toBeUndefined();
    });
  });
});

describe.each(everyPart())('%s', (id, part) => {
  const palette = PALETTES[part.palette];

  it('declares a palette that exists', () => {
    expect(palette.length).toBeGreaterThan(0);
  });

  it.each([...palette])('renders inside the viewBox in %s', (color) => {
    const bounds = boundsOf(renderPart(part, color));

    expect(bounds, `${id} renders nothing`).not.toBeNull();
    expect(bounds!.minX, `${id} crosses the left edge`).toBeGreaterThanOrEqual(0);
    expect(bounds!.minY, `${id} crosses the top edge`).toBeGreaterThanOrEqual(0);
    expect(bounds!.maxX, `${id} crosses the right edge`).toBeLessThanOrEqual(VIEW_BOX.width);
    expect(bounds!.maxY, `${id} crosses the bottom edge`).toBeLessThanOrEqual(VIEW_BOX.height);
  });

  it('covers the anchor band its slot demands', () => {
    const band = SLOT_ANCHORS[part.slot];

    if (!band) return;

    const bounds = boundsOf(renderPart(part, palette[0]))!;

    expect(bounds.minY, `${id} starts below its anchor band`).toBeLessThanOrEqual(band.minY);
    expect(bounds.maxY, `${id} ends above its anchor band`).toBeGreaterThanOrEqual(band.maxY);
  });

  it('stays inside the region its slot belongs to', () => {
    const region = SLOT_REGIONS[part.slot];

    if (!region) return;

    const bounds = boundsOf(renderPart(part, palette[0]))!;

    expect(bounds.minX, `${id} reaches left of its region`).toBeGreaterThanOrEqual(region.minX);
    expect(bounds.maxX, `${id} reaches right of its region`).toBeLessThanOrEqual(region.maxX);
    expect(bounds.minY, `${id} reaches above its region`).toBeGreaterThanOrEqual(region.minY);
    expect(bounds.maxY, `${id} reaches below its region`).toBeLessThanOrEqual(region.maxY);
  });

  it('stays within the doll bounds, leaving the lateral margin free', () => {
    const bounds = boundsOf(renderPart(part, palette[0]))!;

    expect(bounds.minX).toBeGreaterThanOrEqual(ANCHORS.dollBounds.x1);
    expect(bounds.maxX).toBeLessThanOrEqual(ANCHORS.dollBounds.x2);
  });

  it('derives every tone from the colour it is given', () => {
    const [first, second] = [palette[0], palette.at(-1)!];
    const before = colorsOf(renderPart(part, first));
    const after = colorsOf(renderPart(part, second));
    const unchanged = before.filter((color) => after.includes(color));

    expect(before, `${id} paints nothing`).not.toStrictEqual([]);

    for (const color of unchanged) {
      expect(FIXED.has(color), `${id} hardcodes ${color} instead of deriving it via shade`).toBe(
        true,
      );
    }
  });

  it.each([...palette])('uses no forbidden svg feature in %s', (color) => {
    const svg = renderPart(part, color);

    expect(svg.querySelectorAll(FORBIDDEN), `${id} uses a forbidden element`).toHaveLength(0);

    for (const element of svg.querySelectorAll('[style], [filter]')) {
      const style = `${element.getAttribute('style') ?? ''} ${element.getAttribute('filter') ?? ''}`;

      expect(style, `${id} uses a shadow or blur`).not.toMatch(/drop-shadow|blur/i);
    }
  });

  it('writes path data with absolute commands only', () => {
    for (const d of pathDataOf(renderPart(part, palette[0]))) {
      expect(d, `${id} uses a relative path command`).toMatch(ABSOLUTE_PATH);
    }
  });

  it('declares an honest hides list', () => {
    const hides = part.hides ?? [];

    expect(hides, `${id} hides its own slot`).not.toContain(part.slot);
    expect(hides, `${id} hides the body`).not.toContain('body');
  });
});

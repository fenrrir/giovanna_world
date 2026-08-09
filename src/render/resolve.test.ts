import { describe, expect, it } from 'vitest';

import { indexedLookup, stubLookup, stubPart } from '../../tests/doubles';
import { DEFAULT_LOOK } from '../model/defaults';
import { lookReducer } from '../model/reducer';
import type { PartLookup } from '../model/sanitize';
import type { Look, PartParams } from '../model/types';
import { resolveLayers } from './resolve';

const body = stubPart('body', 'body.base');
const tShirt = stubPart('top', 'top.t-shirt');
const dress = stubPart('top', 'top.dress', ['bottom']);
const skirt = stubPart('bottom', 'bottom.skirt');
const shoes = stubPart('shoes', 'shoes.sneakers');
const hairBack = stubPart('hairBack', 'hair.bob');
const hairFront = stubPart('hairFront', 'hair.bob');

const lookup = stubLookup(body, tShirt, dress, skirt, shoes, hairBack, hairFront);

const dressed = (equipped: Look['equipped']): Look => ({ ...DEFAULT_LOOK, equipped });

const slotsOf = (look: Look): string[] =>
  resolveLayers(look, lookup, body).map((layer) => layer.slot);

describe('resolveLayers', () => {
  it('always includes the body, even with nothing equipped', () => {
    const layers = resolveLayers(DEFAULT_LOOK, lookup, body);

    expect(layers).toHaveLength(1);
    expect(layers[0]?.part).toBe(body);
  });

  it('colours the body with the skin tone rather than an equipped colour', () => {
    const look = { ...DEFAULT_LOOK, skin: '#8A5A38' };

    expect(resolveLayers(look, lookup, body)[0]?.color).toBe('#8A5A38');
  });

  it('sorts back to front by z', () => {
    const look = dressed({
      shoes: { partId: 'shoes.sneakers', color: '#E24B4A' },
      hairFront: { partId: 'hair.bob', color: '#6B3A1F' },
      top: { partId: 'top.t-shirt', color: '#1D9E75' },
      hairBack: { partId: 'hair.bob', color: '#6B3A1F' },
      bottom: { partId: 'bottom.skirt', color: '#EF9F27' },
    });

    expect(slotsOf(look)).toStrictEqual([
      'hairBack',
      'body',
      'shoes',
      'bottom',
      'top',
      'hairFront',
    ]);
  });

  it('carries each part own colour through', () => {
    const look = dressed({ top: { partId: 'top.t-shirt', color: '#1D9E75' } });
    const layer = resolveLayers(look, lookup, body).find((candidate) => candidate.slot === 'top');

    expect(layer?.color).toBe('#1D9E75');
  });

  describe('hides', () => {
    it('omits a hidden slot from the render', () => {
      const look = dressed({
        top: { partId: 'top.dress', color: '#D4537E' },
        bottom: { partId: 'bottom.skirt', color: '#EF9F27' },
      });

      expect(slotsOf(look)).not.toContain('bottom');
    });

    it('leaves the hidden slot in the state', () => {
      const look = dressed({
        top: { partId: 'top.dress', color: '#D4537E' },
        bottom: { partId: 'bottom.skirt', color: '#EF9F27' },
      });

      resolveLayers(look, lookup, body);

      expect(look.equipped.bottom).toStrictEqual({ partId: 'bottom.skirt', color: '#EF9F27' });
    });

    it('brings the skirt back when the dress is swapped for a t-shirt', () => {
      const wearingDress = dressed({
        top: { partId: 'top.dress', color: '#D4537E' },
        bottom: { partId: 'bottom.skirt', color: '#EF9F27' },
      });

      expect(slotsOf(wearingDress)).not.toContain('bottom');

      const swapped = lookReducer(wearingDress, {
        type: 'applyPart',
        part: tShirt,
        color: '#1D9E75',
      });

      expect(slotsOf(swapped)).toContain('bottom');
    });

    it('never hides the body, whatever a part declares', () => {
      const rogue = stubPart('top', 'top.rogue', ['body']);
      const look = dressed({ top: { partId: 'top.rogue', color: '#D4537E' } });

      expect(
        resolveLayers(look, stubLookup(body, rogue), body).map((layer) => layer.slot),
      ).toContain('body');
    });

    it('never lets a part hide itself off the canvas', () => {
      const selfHiding = stubPart('top', 'top.self', ['top']);
      const look = dressed({ top: { partId: 'top.self', color: '#D4537E' } });

      expect(
        resolveLayers(look, stubLookup(body, selfHiding), body).map((layer) => layer.slot),
      ).toContain('top');
    });

    it('applies hides from a part that is itself hidden by nobody', () => {
      const look = dressed({
        top: { partId: 'top.dress', color: '#D4537E' },
        bottom: { partId: 'bottom.skirt', color: '#EF9F27' },
        shoes: { partId: 'shoes.sneakers', color: '#378ADD' },
      });

      expect(slotsOf(look)).toStrictEqual(['body', 'shoes', 'top']);
    });
  });

  describe('unknown parts', () => {
    it('skips an equipped part that has left the registry', () => {
      const look = dressed({ top: { partId: 'top.deleted', color: '#1D9E75' } });

      expect(slotsOf(look)).toStrictEqual(['body']);
    });

    it('ignores the hides of a part that has left the registry', () => {
      const look = dressed({
        top: { partId: 'top.deleted', color: '#1D9E75' },
        bottom: { partId: 'bottom.skirt', color: '#EF9F27' },
      });

      expect(slotsOf(look)).toContain('bottom');
    });
  });

  describe('generated parts', () => {
    it('hands the equipped params to the lookup, so a part can be built from them', () => {
      const seen: (PartParams | undefined)[] = [];
      const recording: PartLookup = (slot, partId, params) => {
        seen.push(params);

        return lookup(slot, partId);
      };
      const look = dressed({
        top: { partId: 'top.t-shirt', color: '#1D9E75', params: { length: 0.8 } },
      });

      resolveLayers(look, recording, body);

      expect(seen).toStrictEqual([{ length: 0.8 }]);
    });

    it('asks for a part with no params when the entry carries none', () => {
      const seen: (PartParams | undefined)[] = [];
      const recording: PartLookup = (slot, partId, params) => {
        seen.push(params);

        return lookup(slot, partId);
      };

      resolveLayers(dressed({ top: { partId: 'top.t-shirt', color: '#1D9E75' } }), recording, body);

      expect(seen).toStrictEqual([undefined]);
    });
  });

  it('resolves both halves of a hairstyle', () => {
    const look = dressed({
      hairBack: { partId: 'hair.bob', color: '#6B3A1F' },
      hairFront: { partId: 'hair.bob', color: '#6B3A1F' },
    });

    expect(slotsOf(look)).toStrictEqual(['hairBack', 'body', 'hairFront']);
  });

  /*
   * The album renders looks straight off the disk without sanitising them, so
   * this path meets a departed slot too — and it sorts by `Z[slot]` afterwards,
   * which a name outside the taxonomy has no entry in either.
   */
  it('paints a look holding a slot the taxonomy no longer has', () => {
    const stored = {
      ...DEFAULT_LOOK,
      equipped: {
        top: { partId: 'top.t-shirt', color: '#1D9E75' },
        backdrop: { partId: 'backdrop.meadow', color: '#1D9E75' },
      },
    } as Look;

    expect(
      resolveLayers(stored, indexedLookup(body, tShirt), body).map((layer) => layer.slot),
    ).toStrictEqual(['body', 'top']);
  });
});

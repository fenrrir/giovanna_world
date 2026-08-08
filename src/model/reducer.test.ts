import { describe, expect, it } from 'vitest';

import { stubHair, stubPart } from '../../tests/doubles';
import { DEFAULT_LOOK } from './defaults';
import { lookReducer } from './reducer';
import type { Look } from './types';

const top = stubPart('top', 'top.t-shirt');
const otherTop = stubPart('top', 'top.tank');
const bottom = stubPart('bottom', 'bottom.skirt');
const hair = stubHair('hair.bob');

/** Frozen, so any accidental mutation throws instead of passing quietly. */
const frozen = (look: Look): Look =>
  Object.freeze({ ...look, equipped: Object.freeze({ ...look.equipped }) });

describe('lookReducer', () => {
  describe('replaceLook', () => {
    it('replaces the whole look', () => {
      const stored: Look = { schemaVersion: 1, skin: '#8A5A38', equipped: {} };

      expect(lookReducer(DEFAULT_LOOK, { type: 'replaceLook', look: stored })).toStrictEqual(
        stored,
      );
    });
  });

  describe('setSkin', () => {
    it('changes the skin tone', () => {
      const next = lookReducer(DEFAULT_LOOK, { type: 'setSkin', color: '#C68A5E' });

      expect(next.skin).toBe('#C68A5E');
    });

    it('leaves the clothing untouched', () => {
      const dressed = lookReducer(DEFAULT_LOOK, { type: 'applyPart', part: top, color: '#1D9E75' });
      const next = lookReducer(dressed, { type: 'setSkin', color: '#C68A5E' });

      expect(next.equipped.top).toStrictEqual({ partId: 'top.t-shirt', color: '#1D9E75' });
    });
  });

  describe('applyPart', () => {
    it('writes the part and its colour into the part own slot', () => {
      const next = lookReducer(DEFAULT_LOOK, { type: 'applyPart', part: top, color: '#1D9E75' });

      expect(next.equipped.top).toStrictEqual({ partId: 'top.t-shirt', color: '#1D9E75' });
    });

    it('replaces whatever occupied that slot', () => {
      const first = lookReducer(DEFAULT_LOOK, { type: 'applyPart', part: top, color: '#1D9E75' });
      const second = lookReducer(first, { type: 'applyPart', part: otherTop, color: '#E24B4A' });

      expect(second.equipped.top).toStrictEqual({ partId: 'top.tank', color: '#E24B4A' });
    });

    it('leaves the other slots alone', () => {
      const first = lookReducer(DEFAULT_LOOK, {
        type: 'applyPart',
        part: bottom,
        color: '#EF9F27',
      });
      const second = lookReducer(first, { type: 'applyPart', part: top, color: '#1D9E75' });

      expect(second.equipped.bottom).toStrictEqual({ partId: 'bottom.skirt', color: '#EF9F27' });
    });
  });

  describe('applyHair', () => {
    it('writes the same hairstyle into both hair slots', () => {
      const next = lookReducer(DEFAULT_LOOK, { type: 'applyHair', hair, color: '#6B3A1F' });

      expect(next.equipped.hairBack).toStrictEqual({ partId: 'hair.bob', color: '#6B3A1F' });
      expect(next.equipped.hairFront).toStrictEqual({ partId: 'hair.bob', color: '#6B3A1F' });
    });

    it('gives both slots the same colour, because it is one choice for the child', () => {
      const next = lookReducer(DEFAULT_LOOK, { type: 'applyHair', hair, color: '#D4537E' });

      expect(next.equipped.hairBack?.color).toBe(next.equipped.hairFront?.color);
    });
  });

  describe('setSlotColor', () => {
    it('recolours an occupied slot without changing the part', () => {
      const dressed = lookReducer(DEFAULT_LOOK, { type: 'applyPart', part: top, color: '#1D9E75' });
      const next = lookReducer(dressed, { type: 'setSlotColor', slot: 'top', color: '#378ADD' });

      expect(next.equipped.top).toStrictEqual({ partId: 'top.t-shirt', color: '#378ADD' });
    });

    it('is a no-op on an empty slot', () => {
      const next = lookReducer(DEFAULT_LOOK, {
        type: 'setSlotColor',
        slot: 'top',
        color: '#378ADD',
      });

      expect(next).toBe(DEFAULT_LOOK);
    });

    it('recolours both hair slots together, from either one', () => {
      const dressed = lookReducer(DEFAULT_LOOK, { type: 'applyHair', hair, color: '#6B3A1F' });
      const next = lookReducer(dressed, {
        type: 'setSlotColor',
        slot: 'hairFront',
        color: '#111111',
      });

      expect(next.equipped.hairFront?.color).toBe('#111111');
      expect(next.equipped.hairBack?.color).toBe('#111111');
    });

    it('recolours a half-hydrated hairstyle without inventing the missing half', () => {
      // Storage can hand back a look with only one hair slot populated.
      const partial = lookReducer(DEFAULT_LOOK, {
        type: 'replaceLook',
        look: {
          schemaVersion: 1,
          skin: '#F7DCC3',
          equipped: { hairBack: { partId: 'hair.bob', color: '#6B3A1F' } },
        },
      });
      const next = lookReducer(partial, {
        type: 'setSlotColor',
        slot: 'hairBack',
        color: '#111111',
      });

      expect(next.equipped.hairBack?.color).toBe('#111111');
      expect(next.equipped.hairFront).toBeUndefined();
    });

    it('recolours both hair slots when driven from the back slot too', () => {
      const dressed = lookReducer(DEFAULT_LOOK, { type: 'applyHair', hair, color: '#6B3A1F' });
      const next = lookReducer(dressed, {
        type: 'setSlotColor',
        slot: 'hairBack',
        color: '#C97B2E',
      });

      expect(next.equipped.hairFront?.color).toBe('#C97B2E');
      expect(next.equipped.hairBack?.color).toBe('#C97B2E');
    });
  });

  describe('removeSlot', () => {
    it('takes a garment off', () => {
      const dressed = lookReducer(DEFAULT_LOOK, { type: 'applyPart', part: top, color: '#1D9E75' });
      const next = lookReducer(dressed, { type: 'removeSlot', slot: 'top' });

      expect(next.equipped.top).toBeUndefined();
    });

    it('leaves the other slots dressed', () => {
      const first = lookReducer(DEFAULT_LOOK, { type: 'applyPart', part: top, color: '#1D9E75' });
      const second = lookReducer(first, { type: 'applyPart', part: bottom, color: '#EF9F27' });
      const next = lookReducer(second, { type: 'removeSlot', slot: 'top' });

      expect(next.equipped.bottom).toStrictEqual({ partId: 'bottom.skirt', color: '#EF9F27' });
    });

    it.each(['hairBack', 'hairFront'] as const)(
      'takes both halves of the hair off when pulled by %s',
      (slot) => {
        const dressed = lookReducer(DEFAULT_LOOK, { type: 'applyHair', hair, color: '#6B3A1F' });
        const next = lookReducer(dressed, { type: 'removeSlot', slot });

        expect(next.equipped.hairBack).toBeUndefined();
        expect(next.equipped.hairFront).toBeUndefined();
      },
    );

    it('is a no-op on a slot with nothing in it', () => {
      const next = lookReducer(DEFAULT_LOOK, { type: 'removeSlot', slot: 'shoes' });

      expect(next).toBe(DEFAULT_LOOK);
    });

    it('cannot take the body off, because the body is never equipped', () => {
      const dressed = lookReducer(DEFAULT_LOOK, { type: 'applyPart', part: top, color: '#1D9E75' });
      const next = lookReducer(dressed, { type: 'removeSlot', slot: 'body' });

      expect(next).toBe(dressed);
    });

    it('leaves the skin tone alone', () => {
      const dressed = lookReducer(DEFAULT_LOOK, { type: 'applyPart', part: top, color: '#1D9E75' });
      const next = lookReducer(dressed, { type: 'removeSlot', slot: 'top' });

      expect(next.skin).toBe(DEFAULT_LOOK.skin);
    });
  });

  describe('purity', () => {
    it.each([
      ['setSkin', { type: 'setSkin', color: '#C68A5E' }],
      ['applyPart', { type: 'applyPart', part: top, color: '#1D9E75' }],
      ['applyHair', { type: 'applyHair', hair, color: '#6B3A1F' }],
      ['replaceLook', { type: 'replaceLook', look: DEFAULT_LOOK }],
    ] as const)('never mutates the state it is given for %s', (_name, action) => {
      const before = structuredClone(DEFAULT_LOOK);
      const state = frozen(DEFAULT_LOOK);

      expect(() => lookReducer(state, action)).not.toThrow();
      expect(state).toStrictEqual(before);
    });

    it('returns a new object for a change', () => {
      const next = lookReducer(DEFAULT_LOOK, { type: 'setSkin', color: '#C68A5E' });

      expect(next).not.toBe(DEFAULT_LOOK);
    });
  });
});

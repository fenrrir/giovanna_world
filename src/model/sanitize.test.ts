import { describe, expect, it } from 'vitest';

import { indexedLookup, stubLookup, stubPart } from '../../tests/doubles';
import { sanitizeLook } from './sanitize';
import type { EquippedPart, Look } from './types';

const top = stubPart('top', 'top.t-shirt');
const bottom = stubPart('bottom', 'bottom.skirt');

const look = (equipped: Look['equipped']): Look => ({
  schemaVersion: 1,
  skin: '#F7DCC3',
  equipped,
});

/**
 * What `loadLook` hands back once a slot has left the taxonomy.
 *
 * `isLook` checks the values of `equipped` and never its keys, so a name no
 * version of this app knows about reaches here intact. The cast is the point of
 * the test rather than a shortcut: it is the same cast `sanitizeLook` makes.
 */
const fromStorage = (equipped: Record<string, EquippedPart>): Look => ({
  schemaVersion: 1,
  skin: '#F7DCC3',
  equipped,
});

describe('sanitizeLook', () => {
  it('drops a slot whose part no longer exists, silently', () => {
    const stored = look({
      top: { partId: 'top.t-shirt', color: '#1D9E75' },
      bottom: { partId: 'bottom.deleted', color: '#EF9F27' },
    });

    expect(sanitizeLook(stored, stubLookup(top, bottom)).equipped).toStrictEqual({
      top: { partId: 'top.t-shirt', color: '#1D9E75' },
    });
  });

  it('drops a part that exists but under a different slot', () => {
    const stored = look({ bottom: { partId: 'top.t-shirt', color: '#1D9E75' } });

    expect(sanitizeLook(stored, stubLookup(top)).equipped).toStrictEqual({});
  });

  it('keeps a look whose parts all exist', () => {
    const stored = look({
      top: { partId: 'top.t-shirt', color: '#1D9E75' },
      bottom: { partId: 'bottom.skirt', color: '#EF9F27' },
    });

    expect(sanitizeLook(stored, stubLookup(top, bottom))).toStrictEqual(stored);
  });

  it('preserves the skin tone, which is never part-backed', () => {
    const stored = look({ top: { partId: 'top.gone', color: '#1D9E75' } });

    expect(sanitizeLook(stored, stubLookup()).skin).toBe('#F7DCC3');
  });

  it('returns a new object rather than mutating the stored one', () => {
    const stored = look({ top: { partId: 'top.gone', color: '#1D9E75' } });
    const result = sanitizeLook(stored, stubLookup());

    expect(result).not.toBe(stored);
    expect(stored.equipped.top).toBeDefined();
  });

  /*
   * A part leaving the registry and a whole slot leaving the taxonomy are not
   * the same repair, and only the first one used to work. The lookup is indexed
   * by slot, so asking it about a name it has never heard of throws — and this
   * runs inside the lazy initialiser of the store, where a throw is a white
   * screen holding the outfit she was wearing.
   */
  it('drops a slot the taxonomy no longer has, without asking the registry about it', () => {
    const stored = fromStorage({
      top: { partId: 'top.t-shirt', color: '#1D9E75' },
      backdrop: { partId: 'backdrop.meadow', color: '#1D9E75' },
    });

    expect(sanitizeLook(stored, indexedLookup(top)).equipped).toStrictEqual({
      top: { partId: 'top.t-shirt', color: '#1D9E75' },
    });
  });

  it('survives a stored look made entirely of slots that no longer exist', () => {
    const stored = fromStorage({ backdrop: { partId: 'backdrop.meadow', color: '#1D9E75' } });

    expect(sanitizeLook(stored, indexedLookup(top)).equipped).toStrictEqual({});
  });
});

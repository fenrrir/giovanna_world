import { describe, expect, it } from 'vitest';

import { stubLookup, stubPart } from '../../tests/doubles';
import { sanitizeLook } from './sanitize';
import type { Look } from './types';

const top = stubPart('top', 'top.t-shirt');
const bottom = stubPart('bottom', 'bottom.skirt');

const look = (equipped: Look['equipped']): Look => ({
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
});

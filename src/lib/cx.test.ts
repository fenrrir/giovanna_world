import { describe, expect, it } from 'vitest';

import { cx } from './cx';

describe('cx', () => {
  it('joins the names it is given', () => {
    expect(cx('a', 'b')).toBe('a b');
  });

  it('drops an undefined lookup rather than printing it', () => {
    expect(cx('a', undefined, 'b')).toBe('a b');
  });

  it('drops an unmet condition', () => {
    const selected = false as boolean;

    expect(cx('a', selected && 'b')).toBe('a');
  });

  it('drops an empty string', () => {
    expect(cx('a', '')).toBe('a');
  });

  it('returns an empty string when nothing applies', () => {
    expect(cx(undefined, false)).toBe('');
  });
});

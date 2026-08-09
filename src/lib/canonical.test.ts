import { describe, expect, it } from 'vitest';

import { canonicalJson } from './canonical';

describe('canonicalJson', () => {
  it('writes the same text for the same content, whatever order it was built in', () => {
    expect(canonicalJson({ a: 1, b: 2 })).toBe(canonicalJson({ b: 2, a: 1 }));
  });

  it('sorts the keys of a nested object too', () => {
    expect(canonicalJson({ outer: { b: 2, a: 1 } })).toBe('{"outer":{"a":1,"b":2}}');
  });

  it('leaves a list in the order it was given, where order is the content', () => {
    expect(canonicalJson([3, 1, 2])).toBe('[3,1,2]');
  });

  it('still tells different content apart', () => {
    expect(canonicalJson({ a: 1 })).not.toBe(canonicalJson({ a: 2 }));
    expect(canonicalJson({ a: 1 })).not.toBe(canonicalJson({ b: 1 }));
  });

  it('handles the values a stored look is made of', () => {
    expect(canonicalJson('text')).toBe('"text"');
    expect(canonicalJson(null)).toBe('null');
  });
});

import { describe, expect, it } from 'vitest';

import { translate } from './translator';

const catalogue = {
  greeting: 'Olá',
  withName: 'Vestir {tray}',
  withTwo: '{a} e {b}',
  withCount: 'Faltam {count} peças',
};

describe('translate', () => {
  it('returns the value for a known key', () => {
    expect(translate(catalogue, 'greeting')).toBe('Olá');
  });

  it('returns the key itself for an unknown one, never an error on screen', () => {
    expect(translate(catalogue, 'missing.key')).toBe('missing.key');
  });

  it('substitutes a placeholder', () => {
    expect(translate(catalogue, 'withName', { tray: 'blusa' })).toBe('Vestir blusa');
  });

  it('substitutes every placeholder in the message', () => {
    expect(translate(catalogue, 'withTwo', { a: 'saia', b: 'sapato' })).toBe('saia e sapato');
  });

  it('accepts a numeric parameter', () => {
    expect(translate(catalogue, 'withCount', { count: 3 })).toBe('Faltam 3 peças');
  });

  it('leaves an unmatched placeholder in place rather than blanking it', () => {
    expect(translate(catalogue, 'withName', { other: 'x' })).toBe('Vestir {tray}');
  });

  it('ignores parameters when the message has no placeholder', () => {
    expect(translate(catalogue, 'greeting', { tray: 'blusa' })).toBe('Olá');
  });

  it('substitutes into an unknown key as well, so the gap stays visible', () => {
    expect(translate(catalogue, 'nope.{tray}', { tray: 'blusa' })).toBe('nope.blusa');
  });
});

import { describe, expect, it } from 'vitest';

import { ptBR } from '../i18n/locales/ptBR';
import { BASE_PATH, THEME_COLOR, manifest } from './manifest';

describe('the web app manifest', () => {
  it('opens at the project subpath, not the account root', () => {
    expect(BASE_PATH).toBe('/giovanna_world/');
    expect(manifest.start_url).toBe(BASE_PATH);
    expect(manifest.scope).toBe(BASE_PATH);
  });

  it('opens full screen, without an address bar', () => {
    expect(manifest.display).toBe('standalone');
  });

  it('turns with the iPad rather than locking an orientation', () => {
    expect(manifest.orientation).toBe('any');
  });

  it('takes its visible text from the catalogue, so nothing can drift', () => {
    expect(manifest.name).toBe(ptBR['app.name']);
    expect(manifest.short_name).toBe(ptBR['app.shortName']);
    expect(manifest.description).toBe(ptBR['app.description']);
    expect(manifest.lang).toBe('pt-BR');
  });

  it('ships an icon at every size a home screen asks for', () => {
    expect(manifest.icons.map((icon) => icon.sizes)).toStrictEqual([
      '64x64',
      '192x192',
      '512x512',
      '512x512',
    ]);
  });

  it('ships exactly one maskable icon, for adaptive home screens', () => {
    const maskable = manifest.icons.filter((icon) => 'purpose' in icon);

    expect(maskable).toHaveLength(1);
    expect(maskable[0]?.sizes).toBe('512x512');
  });

  it('states every icon as a relative path, so the base path applies', () => {
    for (const icon of manifest.icons) {
      expect(icon.src.startsWith('/')).toBe(false);
    }
  });

  it('matches the theme colour declared in the document head', () => {
    expect(THEME_COLOR).toBe('#7F77DD');
    expect(manifest.theme_color).toBe(THEME_COLOR);
  });
});

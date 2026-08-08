import { ptBR } from '../i18n/locales/ptBR.ts';

/**
 * The installed app's identity.
 *
 * GitHub Pages serves the project from a subpath, so start_url and scope carry
 * it — without them the installed app opens the account's root and shows
 * nothing. The visible strings come from the pt-BR catalogue, so the manifest
 * cannot drift from the rest of the interface.
 */
export const BASE_PATH = '/giovanna_world/';

export const THEME_COLOR = '#7F77DD';

export const manifest = {
  id: BASE_PATH,
  name: ptBR['app.name'],
  short_name: ptBR['app.shortName'],
  description: ptBR['app.description'],
  lang: 'pt-BR',
  dir: 'ltr',
  start_url: BASE_PATH,
  scope: BASE_PATH,
  display: 'standalone',
  orientation: 'any',
  background_color: '#FBFBF9',
  theme_color: THEME_COLOR,
  icons: [
    { src: 'pwa-64x64.png', sizes: '64x64', type: 'image/png' },
    { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
    { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
    {
      src: 'maskable-icon-512x512.png',
      sizes: '512x512',
      type: 'image/png',
      purpose: 'maskable',
    },
  ],
} as const;

/**
 * The only file in the project that holds human-facing text.
 *
 * Keys are English; values are Brazilian Portuguese. Adding a user-visible
 * string means adding a key here, never a literal in a component — the game
 * itself shows no words, so most of these are accessible names.
 */
export const ptBR = {
  'app.name': 'Mundo da Giovanna',
  'app.shortName': 'Giovanna',
  'app.description': 'Jogo de vestir personagens, para brincar offline no iPad.',

  'doll.label': 'Personagem montado',

  'tray.hair': 'Cabelo',
  'tray.top': 'Blusa',
  'tray.bottom': 'Saia e calça',
  'tray.shoes': 'Sapatos',

  'tray.open': 'Abrir as opções de {tray}',
  'part.choose': 'Vestir esta peça de {tray}',
  'color.choose': 'Pintar de outra cor',
  'skin.choose': 'Mudar o tom de pele',

  'dev.sheet.title': 'Folha de contato',
  'dev.sheet.slot': 'Peça',
  'dev.sheet.skinTone': 'Tom de pele',
  'dev.sheet.showAnchors': 'Mostrar âncoras',
  'dev.sheet.fabricRow': 'A mesma peça nas seis cores de tecido',
  'dev.sheet.empty': 'Nenhuma peça registrada para este slot.',
} as const;

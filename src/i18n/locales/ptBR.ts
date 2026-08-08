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
  'tray.brows': 'Sobrancelhas',
  'tray.lips': 'Batom',
  'tray.blush': 'Blush',
  'tray.outer': 'Casaco',
  'tray.accessoryHead': 'Enfeite de cabelo',
  'zoom.label': 'Aproximar a boneca',

  'tray.open': 'Abrir as opções de {tray}',
  'scroll.back': 'Ver as opções anteriores',
  'scroll.forward': 'Ver as próximas opções',
  'part.choose': 'Vestir esta peça de {tray}',
  'hair.custom': 'Fazer um cabelo do meu jeito',

  /*
   * The one screen in the game that shows words. The generator asks the child
   * to tell three identical sliders apart, and without a label she can only do
   * it by trying each one — see SPEC section 4 for the scope of the exception.
   */
  'hair.length': 'Comprimento',
  'hair.volume': 'Volume',
  'hair.wave': 'Cachos',
  'hair.fringe': 'Franja',
  'hair.fringe.none': 'Sem franja',
  'hair.fringe.straight': 'Reta',
  'hair.fringe.side': 'De lado',
  'hair.fringe.curtain': 'Repartida',
  'outer.custom': 'Fazer um casaco do meu jeito',
  'outer.length': 'Comprimento',
  'outer.sleeve': 'Manga',
  'outer.collar': 'Gola',
  'outer.collar.none': 'Sem gola',
  'outer.collar.round': 'Redonda',
  'outer.collar.hood': 'Capuz',
  'color.pick': 'Escolher qualquer outra cor',
  'skin.pick': 'Escolher qualquer outro tom de pele',
  'look.randomise': 'Segurar para sortear uma roupa nova',

  'dev.sheet.title': 'Folha de contato',
  'dev.sheet.slot': 'Peça',
  'dev.sheet.skinTone': 'Tom de pele',
  'dev.sheet.showAnchors': 'Mostrar âncoras',
  'dev.sheet.fabricRow': 'A mesma peça nas seis cores de tecido',
  'dev.sheet.empty': 'Nenhuma peça registrada para este slot.',
} as const;

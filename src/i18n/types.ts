import type { ptBR } from './locales/ptBR';

/** Every key the catalogue defines. A typo becomes a compile error. */
export type MessageKey = keyof typeof ptBR;

export type Catalogue = Record<MessageKey, string>;

/** Values substituted into `{placeholder}` slots. */
export type MessageParams = Record<string, string | number>;

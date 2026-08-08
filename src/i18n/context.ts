import { createContext, useContext } from 'react';

import { ptBR } from './locales/ptBR';
import { translate } from './translator';
import type { MessageKey, MessageParams } from './types';

/** The default and, for now, only locale (SPEC section 4 leaves the UI wordless). */
export const DEFAULT_LOCALE = 'pt-BR';

export type Translation = {
  t: (key: MessageKey, params?: MessageParams) => string;
  locale: string;
};

export const I18nContext = createContext<Translation | null>(null);

const FALLBACK: Translation = {
  t: (key, params) => translate(ptBR, key, params),
  locale: DEFAULT_LOCALE,
};

/**
 * Falls back to the built-in catalogue outside a provider, so a component
 * rendered in isolation — in a test, or in the dev sheet — still shows real
 * text instead of throwing.
 */
export const useTranslation = (): Translation => useContext(I18nContext) ?? FALLBACK;

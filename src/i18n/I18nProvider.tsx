import { useMemo, type JSX, type ReactNode } from 'react';

import { DEFAULT_LOCALE, I18nContext, type Translation } from './context';
import { ptBR } from './locales/ptBR';
import { translate } from './translator';
import type { Catalogue } from './types';

type I18nProviderProps = {
  children: ReactNode;
  catalogue?: Catalogue;
  locale?: string;
};

export const I18nProvider = ({
  children,
  catalogue = ptBR,
  locale = DEFAULT_LOCALE,
}: I18nProviderProps): JSX.Element => {
  const value = useMemo<Translation>(
    () => ({
      t: (key, params) => translate(catalogue, key, params),
      locale,
    }),
    [catalogue, locale],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

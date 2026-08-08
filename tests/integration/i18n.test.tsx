import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { DEFAULT_LOCALE, I18nProvider, ptBR, useTranslation } from '../../src/i18n';
import type { Catalogue } from '../../src/i18n';

const Probe = (): React.JSX.Element => {
  const { t, locale } = useTranslation();

  return (
    <p data-locale={locale}>
      {t('tray.top')} · {t('tray.open', { tray: t('tray.hair') })}
    </p>
  );
};

describe('I18nProvider', () => {
  it('renders the brazilian portuguese catalogue by default', () => {
    render(
      <I18nProvider>
        <Probe />
      </I18nProvider>,
    );

    expect(screen.getByText(/Blusa/)).toBeInTheDocument();
    expect(screen.getByText(/Abrir as opções de Cabelo/)).toBeInTheDocument();
  });

  it('exposes the locale for the document to use', () => {
    render(
      <I18nProvider>
        <Probe />
      </I18nProvider>,
    );

    expect(screen.getByText(/Blusa/)).toHaveAttribute('data-locale', DEFAULT_LOCALE);
  });

  it('accepts a replacement catalogue, so a second locale needs no code change', () => {
    const enGB = {
      ...ptBR,
      'tray.top': 'Top',
      'tray.open': 'Open the {tray} options',
    } as Catalogue;

    render(
      <I18nProvider catalogue={enGB} locale="en-GB">
        <Probe />
      </I18nProvider>,
    );

    expect(screen.getByText(/Open the Cabelo options/)).toBeInTheDocument();
    expect(screen.getByText(/Top/)).toHaveAttribute('data-locale', 'en-GB');
  });

  it('still renders outside a provider rather than throwing', () => {
    render(<Probe />);

    expect(screen.getByText(/Blusa/)).toBeInTheDocument();
  });
});

describe('the catalogue', () => {
  it('is the only place holding user-facing text', () => {
    for (const [key, value] of Object.entries(ptBR)) {
      expect(value, `${key} is empty`).not.toBe('');
    }
  });

  it('names every key in english', () => {
    for (const key of Object.keys(ptBR)) {
      expect(key).toMatch(/^[a-z][a-zA-Z.]*$/);
    }
  });
});

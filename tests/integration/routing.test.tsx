import { act, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { DEV_SHEET_HASH, Root } from '../../src/Root';
import { ptBR } from '../../src/i18n';

const goTo = (hash: string): void => {
  globalThis.location.hash = hash;
};

const fireHashChange = (): void => {
  act(() => {
    globalThis.dispatchEvent(new HashChangeEvent('hashchange'));
  });
};

describe('the hidden dev route', () => {
  afterEach(() => {
    goTo('');
  });

  it('shows the game at the root', () => {
    render(<Root />);

    expect(screen.getByRole('img', { name: ptBR['doll.label'] })).toBeInTheDocument();
    expect(screen.queryByText(ptBR['dev.sheet.title'])).toBeNull();
  });

  it('shows the contact sheet at the dev hash', () => {
    goTo(DEV_SHEET_HASH);

    render(<Root />);

    expect(screen.getByText(ptBR['dev.sheet.title'])).toBeInTheDocument();
  });

  it('keeps the child away from the sheet on a lookalike hash', () => {
    goTo('#/dev');

    render(<Root />);

    expect(screen.getByRole('img', { name: ptBR['doll.label'] })).toBeInTheDocument();
  });

  it('switches when the hash changes while the app is open', () => {
    render(<Root />);

    expect(screen.getByRole('img', { name: ptBR['doll.label'] })).toBeInTheDocument();

    goTo(DEV_SHEET_HASH);
    fireHashChange();

    expect(screen.getByText(ptBR['dev.sheet.title'])).toBeInTheDocument();

    goTo('');
    fireHashChange();

    expect(screen.getByRole('img', { name: ptBR['doll.label'] })).toBeInTheDocument();
  });

  it('stops listening once unmounted', () => {
    const { unmount } = render(<Root />);

    unmount();
    goTo(DEV_SHEET_HASH);

    expect(() => {
      fireHashChange();
    }).not.toThrow();
  });
});

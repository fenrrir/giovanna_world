import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';

import { App } from '../../src/App';
import { I18nProvider, ptBR } from '../../src/i18n';
import { WorldProvider } from '../../src/state/WorldProvider';
import { DRESSING } from '../doubles';

const mount = () =>
  render(
    <I18nProvider>
      <WorldProvider world={DRESSING}>
        <App />
      </WorldProvider>
    </I18nProvider>,
  );

const openTray = (tray: keyof typeof ptBR): void => {
  const button = screen.getByRole('button', {
    name: ptBR['tray.open'].replace('{tray}', ptBR[tray]),
  });

  fireEvent.pointerDown(button);
  fireEvent.pointerUp(button);
};

const wearTheJacket = (): void => {
  openTray('tray.outer');

  const jacket = screen.getByRole('button', { name: ptBR['outer.custom'] });

  fireEvent.pointerDown(jacket);
  fireEvent.pointerUp(jacket);
};

const doll = (): HTMLElement => screen.getByRole('img', { name: ptBR['doll.label'] });

const jacketLayer = (): Element | null => doll().querySelector('g[data-slot="outer"]');

const axis = (name: 'outer.length' | 'outer.sleeve'): HTMLElement =>
  screen.getByRole('slider', { name: ptBR[name] });

describe('the jacket she shapes herself', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('offers exactly one jacket, the one she shapes', () => {
    mount();
    openTray('tray.outer');

    // The registry holds it too, at its default axes. Offered twice it would
    // look like a choice between a piece and itself.
    expect(screen.getAllByRole('button', { name: ptBR['outer.custom'] })).toHaveLength(1);
  });

  it('puts it on the doll', () => {
    mount();
    wearTheJacket();

    expect(jacketLayer()).not.toBeNull();
  });

  it('shows the axes only once it is worn', () => {
    mount();
    openTray('tray.outer');

    expect(screen.queryByRole('slider', { name: ptBR['outer.length'] })).toBeNull();

    wearTheJacket();

    expect(axis('outer.length')).toBeInTheDocument();
    expect(axis('outer.sleeve')).toBeInTheDocument();
  });

  /* One panel serves both families. Typed to the hairstyle's params it could
   * only ever have served hair. */
  it('shows the jacket’s axes rather than the hairstyle’s', () => {
    mount();
    wearTheJacket();

    expect(screen.queryByRole('slider', { name: ptBR['hair.wave'] })).toBeNull();
    expect(screen.getByRole('button', { name: ptBR['outer.collar.hood'] })).toBeInTheDocument();
  });

  it('redraws it as she moves an axis', () => {
    mount();
    wearTheJacket();

    const before = jacketLayer()?.innerHTML;

    fireEvent.change(axis('outer.length'), { target: { value: '1' } });

    expect(jacketLayer()?.innerHTML).not.toBe(before);
  });

  it('keeps the axes she chose, so the piece survives a reload', () => {
    mount();
    wearTheJacket();

    fireEvent.change(axis('outer.length'), { target: { value: '1' } });
    fireEvent.pointerDown(screen.getByRole('button', { name: ptBR['outer.collar.hood'] }));

    expect(axis('outer.length')).toHaveValue('1');
    expect(screen.getByRole('button', { name: ptBR['outer.collar.hood'] })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });

  it('puts the axes away when she takes the jacket off for another tray', () => {
    mount();
    wearTheJacket();
    openTray('tray.shoes');

    expect(screen.queryByRole('slider', { name: ptBR['outer.length'] })).toBeNull();
  });
});

import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';

import { App } from '../../src/App';
import { I18nProvider, ptBR } from '../../src/i18n';
import { PALETTES } from '../../src/model/palettes';
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

const picker = (name: 'skin.pick' | 'color.pick'): HTMLInputElement =>
  screen.getByLabelText<HTMLInputElement>(ptBR[name]);

const doll = (): HTMLElement => screen.getByRole('img', { name: ptBR['doll.label'] });

/** Every colour the named layer paints with, fill or stroke. */
const colorsIn = (slot: string): (string | null)[] =>
  [...doll().querySelectorAll(`g[data-slot="${slot}"] *`)].flatMap((node) => [
    node.getAttribute('fill'),
    node.getAttribute('stroke'),
  ]);

const openTray = (tray: keyof typeof ptBR): void => {
  const button = screen.getByRole('button', {
    name: ptBR['tray.open'].replace('{tray}', ptBR[tray]),
  });

  fireEvent.pointerDown(button);
  fireEvent.pointerUp(button);
};

describe('picking a colour outside the palette', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('offers a free picker beside the skin tones', () => {
    mount();

    expect(picker('skin.pick')).toBeInTheDocument();
  });

  it('shows the tone currently in use, so it is never blank', () => {
    mount();

    expect(picker('skin.pick').value).toBe(PALETTES.skin[0].toLowerCase());
  });

  it('paints the doll a colour the palette does not offer', () => {
    mount();

    fireEvent.change(picker('skin.pick'), { target: { value: '#20b2aa' } });

    expect(colorsIn('body')).toContain('#20b2aa');
  });

  it('offers one for the open tray as well', () => {
    mount();
    openTray('tray.lips');

    expect(picker('color.pick')).toBeInTheDocument();
  });

  it('recolours the worn piece with it', () => {
    mount();
    openTray('tray.lips');

    fireEvent.change(picker('color.pick'), { target: { value: '#123456' } });

    expect(colorsIn('lips')).toContain('#123456');
  });

  it('offers none for a tray with nothing worn in it', () => {
    mount();
    openTray('tray.shoes');

    expect(screen.queryByLabelText(ptBR['color.pick'])).toBeNull();
  });

  it('is the only way a colour is chosen, now the swatches are gone', () => {
    mount();
    openTray('tray.lips');

    expect(screen.getAllByLabelText(/^Escolher qualquer/)).toHaveLength(2);
  });

  it('adds no word to the interface', () => {
    const { container } = mount();

    expect(container.textContent.trim()).toBe('');
  });
});

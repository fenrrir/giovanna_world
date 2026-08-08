import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { App } from '../../src/App';
import { I18nProvider, ptBR } from '../../src/i18n';
import { LookProvider } from '../../src/state/LookProvider';

/**
 * jsdom lays nothing out, so a row is always zero wide and a chevron would
 * never have anywhere to point. These give the tray bar a width and a longer
 * content, which is the whole condition the chevrons depend on.
 */
const measureRow = (scrollLeft: number, clientWidth = 400, scrollWidth = 900): void => {
  for (const [property, value] of [
    ['scrollLeft', scrollLeft],
    ['clientWidth', clientWidth],
    ['scrollWidth', scrollWidth],
  ] as const) {
    Object.defineProperty(HTMLUListElement.prototype, property, {
      configurable: true,
      get: () => value,
    });
  }
};

const mount = () =>
  render(
    <I18nProvider>
      <LookProvider>
        <App />
      </LookProvider>
    </I18nProvider>,
  );

const chevron = (name: 'scroll.back' | 'scroll.forward'): HTMLElement =>
  screen.getByRole('button', { name: ptBR[name] });

const trayRow = (): HTMLElement => screen.getAllByRole('list')[0]!;

describe('the tray bar when it does not fit', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('offers only the way forward at the start of the row', () => {
    measureRow(0);
    mount();

    expect(chevron('scroll.forward')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: ptBR['scroll.back'] })).toBeNull();
  });

  it('offers both ways once the row has been moved', () => {
    measureRow(250);
    mount();

    expect(chevron('scroll.back')).toBeInTheDocument();
    expect(chevron('scroll.forward')).toBeInTheDocument();
  });

  it('offers only the way back at the end of the row', () => {
    measureRow(500);
    mount();

    expect(chevron('scroll.back')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: ptBR['scroll.forward'] })).toBeNull();
  });

  it('moves the row forward by most of a screenful when tapped', () => {
    measureRow(0);
    const scrollBy = vi.spyOn(Element.prototype, 'scrollBy');
    mount();

    fireEvent.pointerDown(chevron('scroll.forward'));

    expect(scrollBy).toHaveBeenCalledWith({ left: 320, behavior: 'smooth' });
  });

  it('moves the row back the other way', () => {
    measureRow(500);
    const scrollBy = vi.spyOn(Element.prototype, 'scrollBy');
    mount();

    fireEvent.pointerDown(chevron('scroll.back'));

    expect(scrollBy).toHaveBeenCalledWith({ left: -320, behavior: 'smooth' });
  });

  it('answers the keyboard as well as a finger', () => {
    measureRow(0);
    const scrollBy = vi.spyOn(Element.prototype, 'scrollBy');
    mount();

    // A keyboard activation reports no pointer, which is how it is told apart
    // from the click a real tap also fires.
    fireEvent.click(chevron('scroll.forward'), { detail: 0 });

    expect(scrollBy).toHaveBeenCalledWith({ left: 320, behavior: 'smooth' });
  });

  it('answers the keyboard on the way back too', () => {
    measureRow(500);
    const scrollBy = vi.spyOn(Element.prototype, 'scrollBy');
    mount();

    fireEvent.click(chevron('scroll.back'), { detail: 0 });

    expect(scrollBy).toHaveBeenCalledWith({ left: -320, behavior: 'smooth' });
  });

  it('does not act twice when a tap fires both events', () => {
    measureRow(0);
    const scrollBy = vi.spyOn(Element.prototype, 'scrollBy');
    mount();

    const button = chevron('scroll.forward');
    fireEvent.pointerDown(button);
    fireEvent.click(button, { detail: 1 });

    expect(scrollBy).toHaveBeenCalledTimes(1);
  });

  it('re-reads the row as it is scrolled', () => {
    measureRow(0);
    mount();

    expect(screen.queryByRole('button', { name: ptBR['scroll.back'] })).toBeNull();

    measureRow(250);
    fireEvent.scroll(trayRow());

    expect(chevron('scroll.back')).toBeInTheDocument();
  });

  it('adds no word to the interface', () => {
    measureRow(250);
    const { container } = mount();

    expect(container.textContent.trim()).toBe('');
  });
});

describe('the tray bar when everything fits', () => {
  beforeEach(() => {
    measureRow(0, 900, 900);
  });

  it('shows no chevron, because there is nowhere to go', () => {
    mount();

    expect(screen.queryByRole('button', { name: ptBR['scroll.back'] })).toBeNull();
    expect(screen.queryByRole('button', { name: ptBR['scroll.forward'] })).toBeNull();
  });
});

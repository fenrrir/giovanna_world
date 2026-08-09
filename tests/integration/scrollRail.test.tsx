import { fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { App } from '../../src/App';
import { I18nProvider, ptBR } from '../../src/i18n';
import { WorldProvider } from '../../src/state/WorldProvider';
import { DRESSING } from '../doubles';

/**
 * jsdom lays nothing out, so a rail is always zero tall and a chevron would
 * never have anywhere to point. These give every rail a height and a longer
 * content, which is the whole condition the chevrons depend on.
 */
const measureRail = (scrollTop: number, clientHeight = 400, scrollHeight = 900): void => {
  for (const [property, value] of [
    ['scrollTop', scrollTop],
    ['clientHeight', clientHeight],
    ['scrollHeight', scrollHeight],
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
      <WorldProvider world={DRESSING}>
        <App />
      </WorldProvider>
    </I18nProvider>,
  );

/**
 * The tray rail, reached through a tray button rather than by position. Every
 * column is a rail now, so an index into the lists would name whichever one
 * happens to come first in the document.
 */
const trayRail = (): HTMLElement =>
  screen
    .getByRole('button', { name: ptBR['tray.open'].replace('{tray}', ptBR['tray.hair']) })
    .closest('ul')!;

/** The rail together with the chevrons that drive it. */
const trayScroller = (): HTMLElement => trayRail().parentElement!;

const chevron = (name: 'scroll.back' | 'scroll.forward'): HTMLElement =>
  within(trayScroller()).getByRole('button', { name: ptBR[name] });

const noChevron = (name: 'scroll.back' | 'scroll.forward'): void => {
  expect(within(trayScroller()).queryByRole('button', { name: ptBR[name] })).toBeNull();
};

describe('a rail that does not fit', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('offers only the way down at the top of the rail', () => {
    measureRail(0);
    mount();

    expect(chevron('scroll.forward')).toBeInTheDocument();
    noChevron('scroll.back');
  });

  it('offers both ways once the rail has been moved', () => {
    measureRail(250);
    mount();

    expect(chevron('scroll.back')).toBeInTheDocument();
    expect(chevron('scroll.forward')).toBeInTheDocument();
  });

  it('offers only the way up at the bottom of the rail', () => {
    measureRail(500);
    mount();

    expect(chevron('scroll.back')).toBeInTheDocument();
    noChevron('scroll.forward');
  });

  it('moves the rail down by most of a screenful when tapped', () => {
    measureRail(0);
    const scrollBy = vi.spyOn(Element.prototype, 'scrollBy');
    mount();

    fireEvent.pointerDown(chevron('scroll.forward'));

    expect(scrollBy).toHaveBeenCalledWith({ top: 320, behavior: 'smooth' });
  });

  it('moves the rail back up the other way', () => {
    measureRail(500);
    const scrollBy = vi.spyOn(Element.prototype, 'scrollBy');
    mount();

    fireEvent.pointerDown(chevron('scroll.back'));

    expect(scrollBy).toHaveBeenCalledWith({ top: -320, behavior: 'smooth' });
  });

  it('answers the keyboard as well as a finger', () => {
    measureRail(0);
    const scrollBy = vi.spyOn(Element.prototype, 'scrollBy');
    mount();

    // A keyboard activation reports no pointer, which is how it is told apart
    // from the click a real tap also fires.
    fireEvent.click(chevron('scroll.forward'), { detail: 0 });

    expect(scrollBy).toHaveBeenCalledWith({ top: 320, behavior: 'smooth' });
  });

  it('answers the keyboard on the way back too', () => {
    measureRail(500);
    const scrollBy = vi.spyOn(Element.prototype, 'scrollBy');
    mount();

    fireEvent.click(chevron('scroll.back'), { detail: 0 });

    expect(scrollBy).toHaveBeenCalledWith({ top: -320, behavior: 'smooth' });
  });

  it('does not act twice when a tap fires both events', () => {
    measureRail(0);
    const scrollBy = vi.spyOn(Element.prototype, 'scrollBy');
    mount();

    const button = chevron('scroll.forward');
    fireEvent.pointerDown(button);
    fireEvent.click(button, { detail: 1 });

    expect(scrollBy).toHaveBeenCalledTimes(1);
  });

  it('re-reads the rail as it is scrolled', () => {
    measureRail(0);
    mount();

    noChevron('scroll.back');

    measureRail(250);
    fireEvent.scroll(trayRail());

    expect(chevron('scroll.back')).toBeInTheDocument();
  });

  it('adds no word to the interface', () => {
    measureRail(250);
    const { container } = mount();

    expect(container.textContent.trim()).toBe('');
  });
});

describe('a rail with everything on it', () => {
  beforeEach(() => {
    measureRail(0, 900, 900);
  });

  it('shows no chevron, because there is nowhere to go', () => {
    mount();

    noChevron('scroll.back');
    noChevron('scroll.forward');
  });
});

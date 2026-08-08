import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';

import { App } from '../../src/App';
import { I18nProvider, ptBR } from '../../src/i18n';
import { LookProvider } from '../../src/state/LookProvider';

const mount = () =>
  render(
    <I18nProvider>
      <LookProvider>
        <App />
      </LookProvider>
    </I18nProvider>,
  );

/**
 * The columns, left to right, by the tag each one carries.
 *
 * Tags rather than class names: CSS modules hash theirs at build time, and the
 * meaning is in the markup anyway — the stage is a section, the axes are an
 * aside beside it, the trays are the navigation.
 */
const columns = (): string[] =>
  [...screen.getByRole('main').children].map((column) => column.tagName);

const tap = (button: HTMLElement): void => {
  fireEvent.pointerDown(button);
  fireEvent.pointerUp(button);
};

const openTray = (tray: 'tray.hair' | 'tray.saved'): void => {
  tap(screen.getByRole('button', { name: ptBR['tray.open'].replace('{tray}', ptBR[tray]) }));
};

const drawnHairstyle = (): HTMLElement =>
  screen.getAllByRole('button', {
    name: ptBR['part.choose'].replace('{tray}', ptBR['tray.hair']),
  })[0]!;

const customHairstyle = (): HTMLElement =>
  screen.getByRole('button', { name: ptBR['hair.custom'] });

describe('the layout', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  /**
   * The whole point of the rails: the stage is the only column that grows, and
   * everything else is as narrow as its own content. A control row across the
   * bottom or a panel down half the screen would both show up here.
   */
  it('puts the stage first and the trays last, with the pieces between them', () => {
    mount();

    expect(columns()).toStrictEqual(['SECTION', 'DIV', 'NAV']);
  });

  it('opens the axes as a column of their own, between the stage and the pieces', () => {
    mount();
    openTray('tray.hair');
    tap(customHairstyle());

    expect(columns()).toStrictEqual(['SECTION', 'ASIDE', 'DIV', 'NAV']);
  });

  /**
   * Retracted means gone, not hidden. A column left in place at zero width still
   * costs the grid its gap, and the scene is what pays for it.
   */
  it('takes the axes column out of the layout when nothing shaped is worn', () => {
    mount();
    openTray('tray.hair');
    tap(customHairstyle());
    tap(drawnHairstyle());

    expect(columns()).toStrictEqual(['SECTION', 'DIV', 'NAV']);
  });

  it('gives the album the same column the pieces use', () => {
    mount();
    openTray('tray.saved');

    expect(columns()).toStrictEqual(['SECTION', 'DIV', 'NAV']);
  });

  /**
   * The colours travel with the pieces they paint rather than with the trays,
   * so the tray rail stays a rail of trays and nothing else.
   */
  it('keeps the colour pickers in the piece column and the die in the tray rail', () => {
    mount();

    const pieces = screen.getByRole('main').children[1]!;
    const trays = screen.getByRole('main').children[2]!;

    expect(pieces.contains(screen.getByLabelText(ptBR['skin.pick']))).toBe(true);
    expect(trays.contains(screen.getByLabelText(ptBR['look.randomise']))).toBe(true);
  });

  it('gives the album no colour to pick, because an outfit has none', () => {
    mount();
    openTray('tray.saved');

    expect(screen.queryByLabelText(ptBR['skin.pick'])).toBeNull();
  });
});

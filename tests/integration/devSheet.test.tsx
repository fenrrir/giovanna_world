import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { ANCHORS } from '../../src/anchors';
import { Sheet } from '../../src/dev/Sheet';
import { I18nProvider, ptBR } from '../../src/i18n';
import { PALETTES } from '../../src/model/palettes';
import { PARTS_BY_SLOT, HAIR_STYLES } from '../../src/parts/registry';

const mount = () => {
  const user = userEvent.setup();
  const view = render(
    <I18nProvider>
      <Sheet />
    </I18nProvider>,
  );

  return { ...view, user };
};

const cellsIn = (testId: string): Element[] => [
  ...screen.getByTestId(testId).querySelectorAll('svg[data-part]'),
];

const fillsOf = (cell: Element): string[] =>
  [...cell.querySelectorAll('[fill]')].map((node) => node.getAttribute('fill') ?? '');

describe('the contact sheet', () => {
  it('opens on the hair tray, one cell per hairstyle', () => {
    mount();

    expect(cellsIn('parts-row')).toHaveLength(HAIR_STYLES.length);
  });

  it('draws every part over the same body, at the same scale', () => {
    mount();

    for (const cell of cellsIn('parts-row')) {
      expect(cell.getAttribute('viewBox')).toBe('0 0 680 540');
    }
  });

  it('swaps the set when another tray is chosen', async () => {
    const { user } = mount();

    await user.selectOptions(screen.getByLabelText(ptBR['dev.sheet.slot']), 'top');

    expect(cellsIn('parts-row')).toHaveLength(PARTS_BY_SLOT.top.length);
    expect(cellsIn('parts-row')[0]?.getAttribute('data-part')).toBe('top.t-shirt');
  });

  it('recolours every body when the skin tone changes', async () => {
    const { user } = mount();
    const tone = PALETTES.skin[3];

    await user.selectOptions(screen.getByLabelText(ptBR['dev.sheet.skinTone']), tone);

    for (const cell of cellsIn('parts-row')) {
      expect(fillsOf(cell)).toContain(tone);
    }
  });

  it('shows the same part in all six fabric colours', () => {
    mount();

    expect(cellsIn('fabric-row')).toHaveLength(PALETTES.fabric.length);
  });

  it('actually paints those six colours, so tone derivation is visible', async () => {
    const { user } = mount();

    await user.selectOptions(screen.getByLabelText(ptBR['dev.sheet.slot']), 'top');

    const painted = cellsIn('fabric-row').map((cell) => fillsOf(cell));

    for (const [index, color] of PALETTES.fabric.entries()) {
      expect(painted[index]).toContain(color);
    }
  });

  it('hides the anchor overlay until it is asked for', () => {
    mount();

    expect(screen.queryAllByTestId('anchor-overlay')).toHaveLength(0);
  });

  it('adds and removes the anchor overlay on toggle', async () => {
    const { user } = mount();
    const toggle = screen.getByLabelText(ptBR['dev.sheet.showAnchors']);

    await user.click(toggle);

    expect(screen.getAllByTestId('anchor-overlay').length).toBe(
      cellsIn('parts-row').length + cellsIn('fabric-row').length,
    );

    await user.click(toggle);

    expect(screen.queryAllByTestId('anchor-overlay')).toHaveLength(0);
  });

  it('draws a cross for every anchor, derived from the table itself', async () => {
    const { user } = mount();

    await user.click(screen.getByLabelText(ptBR['dev.sheet.showAnchors']));

    const crosses =
      screen.getAllByTestId('anchor-overlay')[0]?.querySelectorAll('path').length ?? 0;

    expect(crosses).toBeGreaterThanOrEqual(Object.keys(ANCHORS).length);
  });
});

describe('every Phase 1 tray', () => {
  it.each(['hair', 'top', 'bottom', 'shoes'])('has artwork to show for %s', async (tray) => {
    const { user } = mount();

    await user.selectOptions(screen.getByLabelText(ptBR['dev.sheet.slot']), tray);

    expect(cellsIn('parts-row').length).toBeGreaterThan(0);
  });
});

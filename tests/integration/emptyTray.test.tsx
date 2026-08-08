import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { I18nProvider, ptBR } from '../../src/i18n';
import type * as Registry from '../../src/parts/registry';

/**
 * What the interface does with a tray that has no artwork.
 *
 * Not reachable through the UI today — every Phase 1 tray has a piece — but it
 * is the state a tray is in between being added and being drawn, and neither
 * the game nor the contact sheet may break there. Isolated in its own file so
 * the registry mock cannot leak into the other suites.
 */
vi.mock('../../src/parts/registry', async (importOriginal) => {
  const actual = await importOriginal<typeof Registry>();

  return {
    ...actual,
    HAIR_STYLES: [],
    PARTS_BY_SLOT: { ...actual.PARTS_BY_SLOT, accessoryHead: [] },
  };
});

describe('the contact sheet', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('says the tray is empty instead of rendering an empty row', async () => {
    const [{ Sheet }, userEvent] = await Promise.all([
      import('../../src/dev/Sheet'),
      import('@testing-library/user-event'),
    ]);
    const user = userEvent.default.setup();

    render(
      <I18nProvider>
        <Sheet />
      </I18nProvider>,
    );

    await user.selectOptions(
      screen.getByLabelText(ptBR['dev.sheet.slot']),
      ptBR['tray.accessoryHead'],
    );

    expect(screen.getByText(ptBR['dev.sheet.empty'])).toBeInTheDocument();
    expect(screen.queryByTestId('parts-row')).toBeNull();
    expect(screen.queryByTestId('fabric-row')).toBeNull();
  });
});

describe('the randomiser', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('skips a tray with nothing in it instead of producing a broken look', async () => {
    const { randomLook } = await import('../../src/ui/randomize');
    const { DEFAULT_LOOK } = await import('../../src/model/defaults');

    const look = randomLook(() => 0, { ...DEFAULT_LOOK, equipped: {} });

    expect(look.equipped.hairBack).toBeUndefined();
    expect(look.equipped.hairFront).toBeUndefined();
    expect(look.equipped.top).toBeDefined();
    expect(look.equipped.shoes).toBeDefined();
    expect(look.schemaVersion).toBe(1);
  });
});

const mountApp = async (): Promise<void> => {
  const [{ App }, { LookProvider }] = await Promise.all([
    import('../../src/App'),
    import('../../src/state/LookProvider'),
  ]);

  render(
    <I18nProvider>
      <LookProvider>
        <App />
      </LookProvider>
    </I18nProvider>,
  );
};

describe('the tray bar', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('still offers the tray, with a blank icon rather than a broken one', async () => {
    await mountApp();

    const tray = screen.getByRole('button', {
      name: ptBR['tray.open'].replace('{tray}', ptBR['tray.accessoryHead']),
    });

    expect(tray).toBeInTheDocument();
    expect(tray.querySelector('svg')).toBeNull();
  });

  /**
   * Hair is the one tray this can no longer happen to. The hairstyle she
   * shapes herself is generated from the anchors rather than drawn, so it
   * needs no artwork to exist and the tray keeps an icon with none registered.
   */
  it('keeps the hair tray usable with no hairstyle drawn at all', async () => {
    await mountApp();

    const hairTray = screen.getByRole('button', {
      name: ptBR['tray.open'].replace('{tray}', ptBR['tray.hair']),
    });

    expect(hairTray.querySelector('svg')).not.toBeNull();
    expect(screen.getByRole('button', { name: ptBR['hair.custom'] })).toBeInTheDocument();
  });
});

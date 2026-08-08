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

  return { ...actual, HAIR_STYLES: [] };
});

describe('the contact sheet', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('says the tray is empty instead of rendering an empty row', async () => {
    const { Sheet } = await import('../../src/dev/Sheet');

    render(
      <I18nProvider>
        <Sheet />
      </I18nProvider>,
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

    const look = randomLook(() => 0);

    expect(look.equipped.hairBack).toBeUndefined();
    expect(look.equipped.hairFront).toBeUndefined();
    expect(look.equipped.top).toBeDefined();
    expect(look.equipped.shoes).toBeDefined();
    expect(look.schemaVersion).toBe(1);
  });
});

describe('the tray bar', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('still offers the tray, with a blank icon rather than a broken one', async () => {
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

    const hairTray = screen.getByRole('button', {
      name: ptBR['tray.open'].replace('{tray}', ptBR['tray.hair']),
    });

    expect(hairTray).toBeInTheDocument();
    expect(hairTray.querySelector('svg')).toBeNull();
  });
});

import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';

import { App } from '../../src/App';
import { I18nProvider, ptBR } from '../../src/i18n';
import { hairFrontPath } from '../../src/parts/hair/custom/geometry';
import { DEFAULT_HAIR_PARAMS } from '../../src/parts/hair/custom/params';
import { HAIR_STYLES } from '../../src/parts/registry';
import { LookProvider } from '../../src/state/LookProvider';

const mount = () =>
  render(
    <I18nProvider>
      <LookProvider>
        <App />
      </LookProvider>
    </I18nProvider>,
  );

const doll = (): HTMLElement => screen.getByRole('img', { name: ptBR['doll.label'] });

const layerPath = (slot: string): string | null =>
  doll().querySelector(`g[data-slot="${slot}"] path`)?.getAttribute('d') ?? null;

const drawnHairstyles = (): HTMLElement[] =>
  screen.getAllByRole('button', {
    name: ptBR['part.choose'].replace('{tray}', ptBR['tray.hair']),
  });

const customEntry = (): HTMLElement => screen.getByRole('button', { name: ptBR['hair.custom'] });

const choose = (button: HTMLElement): void => {
  fireEvent.pointerDown(button);
  fireEvent.pointerUp(button);
};

describe('the hairstyle she makes herself', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('sits in the hair tray beside the drawn hairstyles, not instead of them', () => {
    mount();

    expect(drawnHairstyles()).toHaveLength(HAIR_STYLES.length);
    expect(customEntry()).toBeInTheDocument();
  });

  it('names itself apart from the others, since it does something different', () => {
    mount();

    for (const drawn of drawnHairstyles()) {
      expect(drawn).not.toHaveAccessibleName(ptBR['hair.custom']);
    }
  });

  it('dresses the doll the moment she picks it', () => {
    mount();

    expect(layerPath('hairFront')).toBeNull();

    choose(customEntry());

    expect(layerPath('hairFront')).toBe(hairFrontPath(DEFAULT_HAIR_PARAMS));
  });

  it('fills both hair slots, the same as any other hairstyle', () => {
    mount();
    choose(customEntry());

    expect(layerPath('hairBack')).not.toBeNull();
    expect(layerPath('hairFront')).not.toBeNull();
  });
});

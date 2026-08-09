import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';

import { App } from '../../src/App';
import { I18nProvider, ptBR, type MessageKey } from '../../src/i18n';
import { hairBackPath, hairFrontPath } from '../../src/parts/hair/custom/geometry';
import { DEFAULT_HAIR_PARAMS } from '../../src/parts/hair/custom/params';
import { HAIR_STYLES } from '../../src/parts/registry';
import { WorldProvider } from '../../src/state/WorldProvider';
import { DRESSING } from '../doubles';

const FRINGE_KEYS = [
  'hair.fringe.none',
  'hair.fringe.straight',
  'hair.fringe.side',
  'hair.fringe.curtain',
] as const satisfies readonly MessageKey[];

const slider = (key: MessageKey): HTMLElement => screen.getByLabelText(ptBR[key]);

/** Reopened the way the child reopens it: from what was written down. */
const reopen = () =>
  render(
    <I18nProvider>
      <WorldProvider>
        <App />
      </WorldProvider>
    </I18nProvider>,
  );

const mount = () =>
  render(
    <I18nProvider>
      <WorldProvider world={DRESSING}>
        <App />
      </WorldProvider>
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

describe('the axes that shape it', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('stay out of the way until she asks for them', () => {
    mount();

    expect(screen.queryByLabelText(ptBR['hair.length'])).toBeNull();
    expect(screen.queryByRole('button', { name: ptBR['hair.fringe.curtain'] })).toBeNull();
  });

  it.each(['hair.length', 'hair.volume', 'hair.wave'] as const)(
    'gives %s a slider she can drag',
    (key) => {
      mount();
      choose(customEntry());

      expect(slider(key)).toHaveAttribute('type', 'range');
    },
  );

  it.each(['hair.length', 'hair.volume', 'hair.wave'] as const)(
    'reshapes the hair when %s moves, without touching its colour',
    (key) => {
      mount();
      choose(customEntry());

      const before = layerPath('hairBack');
      fireEvent.change(slider(key), { target: { value: '1' } });

      expect(layerPath('hairBack')).not.toBe(before);
    },
  );

  it('keeps both halves of the hairstyle in step as she drags', () => {
    mount();
    choose(customEntry());

    fireEvent.change(slider('hair.length'), { target: { value: '0.9' } });

    expect(layerPath('hairFront')).toBe(hairFrontPath({ ...DEFAULT_HAIR_PARAMS, length: 0.9 }));
    expect(layerPath('hairBack')).toBe(hairBackPath({ ...DEFAULT_HAIR_PARAMS, length: 0.9 }));
  });

  it('offers every fringe, marking the one she is wearing', () => {
    mount();
    choose(customEntry());

    for (const key of FRINGE_KEYS) {
      expect(screen.getByRole('button', { name: ptBR[key] })).toBeInTheDocument();
    }

    expect(screen.getByRole('button', { name: ptBR['hair.fringe.straight'] })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });

  it('changes the fringe when she picks another one', () => {
    mount();
    choose(customEntry());

    choose(screen.getByRole('button', { name: ptBR['hair.fringe.curtain'] }));

    expect(layerPath('hairFront')).toBe(
      hairFrontPath({ ...DEFAULT_HAIR_PARAMS, fringe: 'curtain' }),
    );
  });

  it('takes the axes away again when she picks a drawn hairstyle', () => {
    mount();
    choose(customEntry());

    expect(screen.getByLabelText(ptBR['hair.length'])).toBeInTheDocument();

    choose(drawnHairstyles()[0]!);

    expect(screen.queryByLabelText(ptBR['hair.length'])).toBeNull();
  });

  /**
   * SPEC section 4 allows this panel words and nothing else. The rule is only
   * worth anything if the exception stays the size it was granted, so this
   * pins both halves: words here, and none anywhere the panel is not.
   */
  it('is the only thing in the game that shows a word', () => {
    const { container } = mount();

    expect(container.textContent.trim()).toBe('');

    choose(customEntry());

    expect(container.textContent).toContain(ptBR['hair.length']);
    expect(container.textContent).toContain(ptBR['hair.fringe.curtain']);

    choose(drawnHairstyles()[0]!);

    expect(container.textContent.trim()).toBe('');
  });

  it('answers the keyboard as well as the finger', () => {
    mount();
    choose(customEntry());

    // detail 0 is what activating a button from the keyboard looks like.
    fireEvent.click(screen.getByRole('button', { name: ptBR['hair.fringe.side'] }), { detail: 0 });

    expect(layerPath('hairFront')).toBe(hairFrontPath({ ...DEFAULT_HAIR_PARAMS, fringe: 'side' }));
  });

  it('remembers the hair she shaped after the app is closed', () => {
    const first = mount();

    choose(customEntry());
    fireEvent.change(slider('hair.wave'), { target: { value: '1' } });

    // Unmounting flushes the pending autosave, the way closing the app does.
    first.unmount();
    /* Reopened from storage rather than from an injected world — that is the
       whole of what this test is about. */
    reopen();

    expect(layerPath('hairBack')).toBe(hairBackPath({ ...DEFAULT_HAIR_PARAMS, wave: 1 }));
    expect(slider('hair.wave')).toHaveValue('1');
  });
});

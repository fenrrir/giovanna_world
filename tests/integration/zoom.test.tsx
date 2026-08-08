import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';

import { App } from '../../src/App';
import { I18nProvider, ptBR } from '../../src/i18n';
import { MAX_ZOOM, MIN_ZOOM } from '../../src/lib/zoom';
import { LookProvider } from '../../src/state/LookProvider';

const mount = () =>
  render(
    <I18nProvider>
      <LookProvider>
        <App />
      </LookProvider>
    </I18nProvider>,
  );

const slider = (): HTMLElement => screen.getByRole('slider', { name: ptBR['zoom.label'] });

const dollViewBox = (): string =>
  screen.getByRole('img', { name: ptBR['doll.label'] }).getAttribute('viewBox') ?? '';

describe('zooming in on the doll', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('starts showing the whole canvas', () => {
    mount();

    expect(dollViewBox()).toBe('0 0 680 540');
    expect(slider()).toHaveValue(String(MIN_ZOOM));
  });

  it('narrows the canvas onto the doll as the slider is moved', () => {
    mount();

    fireEvent.change(slider(), { target: { value: String(MAX_ZOOM) } });

    expect(dollViewBox()).toBe('234 185.83 212 168.35');
  });

  it('goes back out again, so a child cannot get stuck zoomed in', () => {
    mount();

    fireEvent.change(slider(), { target: { value: String(MAX_ZOOM) } });
    fireEvent.change(slider(), { target: { value: String(MIN_ZOOM) } });

    expect(dollViewBox()).toBe('0 0 680 540');
  });

  it('keeps the doll dressed while zooming', () => {
    mount();

    fireEvent.change(slider(), { target: { value: '2' } });

    expect(screen.getByRole('img', { name: ptBR['doll.label'] })).toBeInTheDocument();
  });

  it('names itself for a screen reader without printing a word', () => {
    const { container } = mount();

    expect(slider()).toHaveAccessibleName(ptBR['zoom.label']);
    expect(container.textContent.trim()).toBe('');
  });
});

import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { stubLookup, stubPart } from '../../tests/doubles';
import { DEFAULT_LOOK } from '../model/defaults';
import type { Look } from '../model/types';
import { Doll } from './Doll';

const body = stubPart('body', 'body.base');
const top = stubPart('top', 'top.t-shirt');
const hairBack = stubPart('hairBack', 'hair.bob');
const lookup = stubLookup(body, top, hairBack);

const renderDoll = (look: Look = DEFAULT_LOOK): SVGSVGElement => {
  render(<Doll look={look} lookup={lookup} body={body} label="Personagem montado" />);

  return screen.getByRole('img') as unknown as SVGSVGElement;
};

describe('Doll', () => {
  it('renders on the contractual viewBox', () => {
    expect(renderDoll().getAttribute('viewBox')).toBe('0 0 680 540');
  });

  it('scales to its container rather than to a fixed size', () => {
    const svg = renderDoll();

    expect(svg.getAttribute('width')).toBe('100%');
    expect(svg.getAttribute('preserveAspectRatio')).toBe('xMidYMid meet');
  });

  it('names itself for assistive technology, carrying no visible text', () => {
    const svg = renderDoll();

    expect(svg).toHaveAttribute('aria-label', 'Personagem montado');
    expect(svg.textContent).toBe('');
  });

  it('paints the layers in document order, back to front', () => {
    const look: Look = {
      ...DEFAULT_LOOK,
      equipped: {
        top: { partId: 'top.t-shirt', color: '#1D9E75' },
        hairBack: { partId: 'hair.bob', color: '#6B3A1F' },
      },
    };

    const slots = [...renderDoll(look).querySelectorAll('g[data-slot]')].map((group) =>
      group.getAttribute('data-slot'),
    );

    expect(slots).toStrictEqual(['hairBack', 'body', 'top']);
  });

  it('hands each part the colour it was equipped with', () => {
    const look: Look = {
      ...DEFAULT_LOOK,
      skin: '#8A5A38',
      equipped: { top: { partId: 'top.t-shirt', color: '#1D9E75' } },
    };
    const svg = renderDoll(look);

    expect(svg.querySelector('[data-part="body.base"]')).toHaveAttribute('fill', '#8A5A38');
    expect(svg.querySelector('[data-part="top.t-shirt"]')).toHaveAttribute('fill', '#1D9E75');
  });

  it('accepts a class name so the layout owns its size', () => {
    render(
      <Doll look={DEFAULT_LOOK} lookup={lookup} body={body} label="Doll" className="canvas" />,
    );

    expect(screen.getByRole('img')).toHaveClass('canvas');
  });
});

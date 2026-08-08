import { describe, expect, it } from 'vitest';

import { PALETTES } from './palettes';
import { DEFAULT_STAGE, type Stage } from './stage';
import { stageReducer } from './stageReducer';
import type { EquippedPart, Part } from './types';

const top: Part = {
  id: 'top.test',
  slot: 'top',
  palette: 'fabric',
  render: () => null,
};

const sky: EquippedPart = { partId: 'scene.meadow', color: PALETTES.fabric[4] };

const dress = (stage: Stage, color: string): Stage =>
  stageReducer(stage, { type: 'dress', action: { type: 'applyPart', part: top, color } });

describe('stageReducer', () => {
  /*
   * The wrapper is the point: every action the trays already dispatch goes
   * through untouched, so lookReducer never learns there are two dolls.
   */
  it('hands a tray action to the doll she is dressing', () => {
    const next = dress(DEFAULT_STAGE, PALETTES.fabric[0]);

    expect(next.dolls[0].equipped.top?.partId).toBe('top.test');
    expect(next.dolls[1].equipped.top).toBeUndefined();
  });

  it('dresses the other one once her attention moves', () => {
    const looking = stageReducer(DEFAULT_STAGE, { type: 'chooseDoll', standing: 1 });
    const next = dress(looking, PALETTES.fabric[0]);

    expect(next.dolls[1].equipped.top?.partId).toBe('top.test');
    expect(next.dolls[0].equipped.top).toBeUndefined();
  });

  it('keeps each of them in the clothes she gave them', () => {
    const first = dress(DEFAULT_STAGE, PALETTES.fabric[0]);
    const looking = stageReducer(first, { type: 'chooseDoll', standing: 1 });
    const both = dress(looking, PALETTES.fabric[3]);

    expect(both.dolls[0].equipped.top?.color).toBe(PALETTES.fabric[0]);
    expect(both.dolls[1].equipped.top?.color).toBe(PALETTES.fabric[3]);
  });

  it('puts the sky up over both of them', () => {
    expect(stageReducer(DEFAULT_STAGE, { type: 'setScene', scene: sky }).scene).toStrictEqual(sky);
  });

  it('takes it down again', () => {
    const under = stageReducer(DEFAULT_STAGE, { type: 'setScene', scene: sky });

    expect(stageReducer(under, { type: 'setScene' }).scene).toBeUndefined();
  });

  it('dresses nobody by changing the sky', () => {
    const under = stageReducer(DEFAULT_STAGE, { type: 'setScene', scene: sky });

    expect(under.dolls).toStrictEqual(DEFAULT_STAGE.dolls);
  });

  it('leaves the sky where it is while she dresses someone', () => {
    const under = stageReducer(DEFAULT_STAGE, { type: 'setScene', scene: sky });

    expect(dress(under, PALETTES.fabric[0]).scene).toStrictEqual(sky);
  });

  it('never mutates the stage it is given', () => {
    const frozen = Object.freeze({ ...DEFAULT_STAGE });

    expect(() => dress(frozen, PALETTES.fabric[0])).not.toThrow();
    expect(frozen.dolls[0].equipped.top).toBeUndefined();
  });
});

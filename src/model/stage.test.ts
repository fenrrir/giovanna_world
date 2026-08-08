import { describe, expect, it } from 'vitest';

import { DEFAULT_LOOK } from './defaults';
import { PALETTES } from './palettes';
import {
  DEFAULT_STAGE,
  STANDING,
  dressedDoll,
  nowDressing,
  withDressedDoll,
  withScene,
  type Stage,
} from './stage';
import type { EquippedPart, Look } from './types';

const other: Look = { ...DEFAULT_LOOK, skin: PALETTES.skin[3] };
const sky: EquippedPart = { partId: 'scene.meadow', color: PALETTES.fabric[4] };

const on = (standing: 0 | 1): Stage => ({ ...DEFAULT_STAGE, dressing: standing });

describe('the stage she opens on', () => {
  it('stands two dolls, on the newer schema', () => {
    expect(DEFAULT_STAGE.dolls).toHaveLength(2);
    expect(DEFAULT_STAGE.schemaVersion).toBe(2);
  });

  /* Identical, they would read as one doll drawn twice. */
  it('tells them apart by skin tone from the start', () => {
    expect(DEFAULT_STAGE.dolls[0].skin).not.toBe(DEFAULT_STAGE.dolls[1].skin);
  });

  it('starts with no backdrop and her attention on the first', () => {
    expect(DEFAULT_STAGE.scene).toBeUndefined();
    expect(DEFAULT_STAGE.dressing).toBe(0);
  });
});

describe('dressing one of them', () => {
  it.each(STANDING)('hands back the doll standing at %i', (standing) => {
    expect(dressedDoll(on(standing))).toStrictEqual(DEFAULT_STAGE.dolls[standing]);
  });

  it.each(STANDING)('dresses the one at %i and leaves the other alone', (standing) => {
    const next = withDressedDoll(on(standing), other);

    expect(next.dolls[standing]).toStrictEqual(other);
    expect(next.dolls[standing === 0 ? 1 : 0]).toStrictEqual(
      DEFAULT_STAGE.dolls[standing === 0 ? 1 : 0],
    );
  });

  it('leaves the backdrop where it is while she dresses someone', () => {
    const staged = withScene(DEFAULT_STAGE, sky);

    expect(withDressedDoll(staged, other).scene).toStrictEqual(sky);
  });

  it('never mutates the stage it is given', () => {
    const frozen = Object.freeze({ ...DEFAULT_STAGE });

    expect(() => withDressedDoll(frozen, other)).not.toThrow();
    expect(frozen.dolls[0]).toStrictEqual(DEFAULT_LOOK);
  });
});

describe('choosing which of them to dress', () => {
  it('moves her attention to the other', () => {
    expect(nowDressing(DEFAULT_STAGE, 1).dressing).toBe(1);
  });

  it('hands back the same stage when she taps the one already chosen', () => {
    expect(nowDressing(DEFAULT_STAGE, 0)).toBe(DEFAULT_STAGE);
  });

  it('dresses neither of them by choosing', () => {
    expect(nowDressing(DEFAULT_STAGE, 1).dolls).toStrictEqual(DEFAULT_STAGE.dolls);
  });
});

describe('the backdrop, which belongs to neither of them', () => {
  it('goes up over both', () => {
    expect(withScene(DEFAULT_STAGE, sky).scene).toStrictEqual(sky);
  });

  it('comes down again', () => {
    expect(withScene(withScene(DEFAULT_STAGE, sky)).scene).toBeUndefined();
  });

  /* The key is dropped rather than written as undefined, so a bare stage stores
   * without it — the same rule `params` follows. */
  it('leaves no empty key behind when it comes down', () => {
    const bare = withScene(withScene(DEFAULT_STAGE, sky));

    expect(Object.keys(bare)).not.toContain('scene');
  });

  it('leaves both dolls untouched either way', () => {
    expect(withScene(DEFAULT_STAGE, sky).dolls).toStrictEqual(DEFAULT_STAGE.dolls);
  });
});

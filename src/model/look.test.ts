import { describe, expect, it } from 'vitest';

import { DEFAULT_LOOK } from './defaults';
import { inCurrentScene, withoutScene } from './look';
import { PALETTES } from './palettes';
import type { Look } from './types';

const meadow = { partId: 'scene.meadow', color: PALETTES.fabric[1] };
const bedroom = { partId: 'scene.bedroom', color: PALETTES.fabric[4] };
const tShirt = { partId: 'top.t-shirt', color: PALETTES.fabric[0] };

const standing = (equipped: Look['equipped']): Look => ({ ...DEFAULT_LOOK, equipped });

describe('withoutScene', () => {
  it('keeps the outfit and leaves the place behind', () => {
    expect(withoutScene(standing({ top: tShirt, scene: meadow })).equipped).toStrictEqual({
      top: tShirt,
    });
  });

  /* The rule every optional entry here follows: absent means no key at all, so
     what is stored round-trips through JSON byte for byte. */
  it('drops the key rather than setting it to undefined', () => {
    const bare = withoutScene(standing({ scene: meadow }));

    expect(Object.keys(bare.equipped)).not.toContain('scene');
  });

  it('leaves a look that was nowhere exactly as it was', () => {
    const nowhere = standing({ top: tShirt });

    expect(withoutScene(nowhere)).toStrictEqual(nowhere);
  });

  it('never mutates the look it is given', () => {
    const stored = standing({ top: tShirt, scene: meadow });

    withoutScene(stored);

    expect(stored.equipped.scene).toStrictEqual(meadow);
  });
});

describe('inCurrentScene', () => {
  it('puts a kept outfit back on without moving her', () => {
    const kept = standing({ top: tShirt });
    const here = standing({ scene: bedroom });

    expect(inCurrentScene(kept, here).equipped).toStrictEqual({ top: tShirt, scene: bedroom });
  });

  /* A kept entry from before the album stopped storing places still carries
     one, and it must not drag her back there. */
  it('ignores the place a kept outfit remembers', () => {
    const kept = standing({ top: tShirt, scene: meadow });
    const here = standing({ scene: bedroom });

    expect(inCurrentScene(kept, here).equipped.scene).toStrictEqual(bedroom);
  });

  it('leaves her nowhere when she is nowhere', () => {
    const kept = standing({ top: tShirt, scene: meadow });
    const here = standing({});

    expect(Object.keys(inCurrentScene(kept, here).equipped)).not.toContain('scene');
  });

  it('takes the outfit from the kept look and nothing else from where she is', () => {
    const kept = { ...standing({ top: tShirt }), skin: PALETTES.skin[3] };
    const here = { ...standing({ scene: bedroom }), skin: PALETTES.skin[0] };

    expect(inCurrentScene(kept, here).skin).toBe(PALETTES.skin[3]);
  });
});

import type { PartLookup } from '../model/sanitize';
import type { Slot } from '../model/slots';
import type { HairStyle, Part } from '../model/types';
import { BODY } from './body';
import { BOB_FRINGE } from './hair/bobFringe';
import { T_SHIRT } from './top/tShirt';

/**
 * The single import point for artwork.
 *
 * Adding a part is creating its file and adding one line here. Nothing else in
 * the codebase imports a part directly, so the contract suite sees every part
 * that exists (SPEC section 10).
 */

export { BODY };

/** Hairstyles are chosen as a pair and written into two slots by the reducer. */
export const HAIR_STYLES: readonly HairStyle[] = [BOB_FRINGE];

const TOPS: readonly Part[] = [T_SHIRT];
const BOTTOMS: readonly Part[] = [];
const SHOES: readonly Part[] = [];

/**
 * Slots with no Phase 1 artwork are present but empty. The taxonomy already
 * covers them (SPEC section 7), so filling them later is registration, not a
 * change of shape.
 */
export const PARTS_BY_SLOT: Readonly<Record<Slot, readonly Part[]>> = {
  hairBack: HAIR_STYLES.map((hair) => hairPart(hair, 'hairBack')),
  hairFront: HAIR_STYLES.map((hair) => hairPart(hair, 'hairFront')),
  body: [BODY],
  top: TOPS,
  bottom: BOTTOMS,
  shoes: SHOES,
  socks: [],
  outer: [],
  accessoryFace: [],
  accessoryHead: [],
  handheld: [],
};

/**
 * Projects one half of a hairstyle as a Part, so the render layer treats hair
 * exactly like everything else while the child still sees a single choice.
 */
function hairPart(hair: HairStyle, slot: 'hairBack' | 'hairFront'): Part {
  return {
    id: hair.id,
    slot,
    palette: 'hair',
    render: slot === 'hairBack' ? hair.back : hair.front,
  };
}

const indexBySlot = (): Record<Slot, ReadonlyMap<string, Part>> => {
  const index = {} as Record<Slot, ReadonlyMap<string, Part>>;

  for (const [slot, parts] of Object.entries(PARTS_BY_SLOT) as [Slot, readonly Part[]][]) {
    index[slot] = new Map(parts.map((part) => [part.id, part]));
  }

  return index;
};

const INDEX = indexBySlot();

export const findPart: PartLookup = (slot, partId) => INDEX[slot].get(partId);

export const findHairStyle = (id: string): HairStyle | undefined =>
  HAIR_STYLES.find((hair) => hair.id === id);

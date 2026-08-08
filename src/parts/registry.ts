import type { PartLookup } from '../model/sanitize';
import type { Slot } from '../model/slots';
import type { HairStyle, Part } from '../model/types';
import { BOW } from './accessoryHead/bow';
import { BODY } from './body';
import { BOB_FRINGE } from './hair/bobFringe';
import { LONG_WAVY } from './hair/longWavy';
import { TWIN_BUNS } from './hair/twinBuns';
import { JEANS } from './bottom/jeans';
import { SHORTS } from './bottom/shorts';
import { SKIRT } from './bottom/skirt';
import { POLKA_DOT_DRESS } from './top/polkaDotDress';
import { STRIPED_SWEATSHIRT } from './top/stripedSweatshirt';
import { TANK_TOP } from './top/tankTop';
import { MARY_JANES } from './shoes/maryJanes';
import { SNEAKERS } from './shoes/sneakers';
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
export const HAIR_STYLES: readonly HairStyle[] = [BOB_FRINGE, LONG_WAVY, TWIN_BUNS];

const TOPS: readonly Part[] = [T_SHIRT, POLKA_DOT_DRESS, STRIPED_SWEATSHIRT, TANK_TOP];
const BOTTOMS: readonly Part[] = [SKIRT, JEANS, SHORTS];
const SHOES: readonly Part[] = [SNEAKERS, MARY_JANES];
const HEAD_ACCESSORIES: readonly Part[] = [BOW];

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
  accessoryHead: HEAD_ACCESSORIES,
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

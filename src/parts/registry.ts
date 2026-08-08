import type { PartLookup } from '../model/sanitize';
import type { Slot } from '../model/slots';
import type { HairStyle, Part } from '../model/types';
import { CUSTOM_HAIR_ID, customHair } from './hair/custom';
import { CUSTOM_OUTER_ID, customOuter } from './outer/custom';
import { CUSTOM_SOCKS_ID, customSocks } from './socks/custom';
import { BOW } from './accessoryHead/bow';
import { ROUND_BLUSH } from './blush/round';
import { SOFT_ARCH } from './brows/softArch';
import { SMILE } from './lips/smile';
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

/**
 * The generated hairstyle at its default axes.
 *
 * Registered like any other part so the contract suite subjects it to the six
 * criteria of SPEC section 12 with no test written for it, and so a lookup that
 * carries no params still answers with one stable instance. It stays out of
 * `HAIR_STYLES`, which is what the randomiser draws from: a random outfit
 * chooses among the drawn hairstyles rather than inventing axes.
 */
const CUSTOM_HAIR = customHair();
/*
 * Registered at its default axes so the contract holds it to the same six
 * criteria as every drawn part. The tray that lets her shape it comes next; a
 * part that no tray offers is still a part the suite must be able to check.
 */
const CUSTOM_OUTER = customOuter();
const CUSTOM_SOCKS = customSocks();

const TOPS: readonly Part[] = [T_SHIRT, POLKA_DOT_DRESS, STRIPED_SWEATSHIRT, TANK_TOP];
const BOTTOMS: readonly Part[] = [SKIRT, JEANS, SHORTS];
const SHOES: readonly Part[] = [SNEAKERS, MARY_JANES];
const HEAD_ACCESSORIES: readonly Part[] = [BOW];
const BROWS: readonly Part[] = [SOFT_ARCH];
const LIPS: readonly Part[] = [SMILE];
const BLUSHES: readonly Part[] = [ROUND_BLUSH];

/**
 * Slots with no Phase 1 artwork are present but empty. The taxonomy already
 * covers them (SPEC section 7), so filling them later is registration, not a
 * change of shape.
 */
export const PARTS_BY_SLOT: Readonly<Record<Slot, readonly Part[]>> = {
  hairBack: [...HAIR_STYLES, CUSTOM_HAIR].map((hair) => hairPart(hair, 'hairBack')),
  hairFront: [...HAIR_STYLES, CUSTOM_HAIR].map((hair) => hairPart(hair, 'hairFront')),
  body: [BODY],
  brows: BROWS,
  lips: LIPS,
  blush: BLUSHES,
  top: TOPS,
  bottom: BOTTOMS,
  shoes: SHOES,
  socks: [CUSTOM_SOCKS],
  outer: [CUSTOM_OUTER],
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

const isHairSlot = (slot: Slot): slot is 'hairBack' | 'hairFront' =>
  slot === 'hairBack' || slot === 'hairFront';

/**
 * Only taken when params actually arrive.
 *
 * A lookup without them falls through to the index, which holds one stable
 * instance — the contract suite asserts `findPart(slot, id)` is that very
 * object, and a part rebuilt on every call would never satisfy it.
 */
export const findPart: PartLookup = (slot, partId, params) => {
  if (!params) return INDEX[slot].get(partId);

  if (partId === CUSTOM_HAIR_ID && isHairSlot(slot)) return hairPart(customHair(params), slot);
  if (partId === CUSTOM_OUTER_ID && slot === 'outer') return customOuter(params);
  if (partId === CUSTOM_SOCKS_ID && slot === 'socks') return customSocks(params);

  return INDEX[slot].get(partId);
};

export const findHairStyle = (id: string): HairStyle | undefined =>
  HAIR_STYLES.find((hair) => hair.id === id);

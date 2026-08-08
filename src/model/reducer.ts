import type { Slot } from './slots';
import type { EquippedPart, HairStyle, Look, Part, PartParams } from './types';

export type LookAction =
  | { type: 'replaceLook'; look: Look }
  | { type: 'setSkin'; color: string }
  | { type: 'applyPart'; part: Part; color: string; params?: PartParams }
  | { type: 'applyHair'; hair: HairStyle; color: string; params?: PartParams }
  | { type: 'setSlotColor'; slot: Slot; color: string }
  | { type: 'removeSlot'; slot: Slot };

/** The two slots a single hairstyle writes into (SPEC section 7). */
const HAIR_SLOTS: readonly Slot[] = ['hairBack', 'hairFront'];

const isHairSlot = (slot: Slot): boolean => HAIR_SLOTS.includes(slot);

/**
 * One equipped entry, carrying the axes it was built from only when it has any.
 *
 * `params` is absent for every ready-made piece, and writing it as `undefined`
 * would put the key in the stored JSON — so a look saved before generated
 * pieces existed would stop round-tripping unchanged.
 */
const entryOf = (partId: string, color: string, params?: PartParams): EquippedPart => ({
  partId,
  color,
  ...(params ? { params } : {}),
});

/** The look with those slots empty. Rebuilt rather than deleted from. */
const without = (look: Look, removed: readonly Slot[]): Look => {
  const entries = Object.entries(look.equipped) as [Slot, EquippedPart][];
  const equipped: Look['equipped'] = {};

  for (const [slot, entry] of entries) {
    if (!removed.includes(slot)) equipped[slot] = entry;
  }

  return { ...look, equipped };
};

/**
 * The look with that slot taken off. Hair comes off as one piece, the same way
 * it goes on, and a slot with nothing in it — including the body, which is
 * never equipped — leaves the look untouched.
 */
const removed = (look: Look, slot: Slot): Look => {
  const slots = isHairSlot(slot) ? HAIR_SLOTS : [slot];

  return slots.some((candidate) => look.equipped[candidate]) ? without(look, slots) : look;
};

const recolour = (look: Look, slots: readonly Slot[], color: string): Look => {
  const equipped = { ...look.equipped };

  for (const slot of slots) {
    const entry = equipped[slot];
    if (entry) equipped[slot] = { ...entry, color };
  }

  return { ...look, equipped };
};

/**
 * The only place a Look changes.
 *
 * Pure by construction: every branch returns a fresh object, so React sees a
 * new reference and the autosave effect fires exactly once per change.
 */
export const lookReducer = (state: Look, action: LookAction): Look => {
  switch (action.type) {
    case 'replaceLook':
      return action.look;

    case 'setSkin':
      return { ...state, skin: action.color };

    case 'applyPart':
      return {
        ...state,
        equipped: {
          ...state.equipped,
          [action.part.slot]: entryOf(action.part.id, action.color, action.params),
        },
      };

    case 'applyHair': {
      const entry = entryOf(action.hair.id, action.color, action.params);

      return {
        ...state,
        equipped: { ...state.equipped, hairBack: entry, hairFront: entry },
      };
    }

    case 'removeSlot':
      return removed(state, action.slot);

    case 'setSlotColor': {
      if (!state.equipped[action.slot]) return state;

      // Hair is one choice in one colour, so recolouring either half moves both.
      const slots = isHairSlot(action.slot) ? HAIR_SLOTS : [action.slot];

      return recolour(state, slots, action.color);
    }
  }
};

import type { Slot } from './slots';
import type { HairStyle, Look, Part } from './types';

export type LookAction =
  | { type: 'replaceLook'; look: Look }
  | { type: 'setSkin'; color: string }
  | { type: 'applyPart'; part: Part; color: string }
  | { type: 'applyHair'; hair: HairStyle; color: string }
  | { type: 'setSlotColor'; slot: Slot; color: string };

/** The two slots a single hairstyle writes into (SPEC section 7). */
const HAIR_SLOTS: readonly Slot[] = ['hairBack', 'hairFront'];

const isHairSlot = (slot: Slot): boolean => HAIR_SLOTS.includes(slot);

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
          [action.part.slot]: { partId: action.part.id, color: action.color },
        },
      };

    case 'applyHair': {
      const entry = { partId: action.hair.id, color: action.color };

      return {
        ...state,
        equipped: { ...state.equipped, hairBack: entry, hairFront: entry },
      };
    }

    case 'setSlotColor': {
      if (!state.equipped[action.slot]) return state;

      // Hair is one choice in one colour, so recolouring either half moves both.
      const slots = isHairSlot(action.slot) ? HAIR_SLOTS : [action.slot];

      return recolour(state, slots, action.color);
    }
  }
};

import { DEFAULT_LOOK } from './defaults';
import { PAINTED_SLOTS, isSlot, type Slot } from './slots';
import type { Look, Part, PartParams } from './types';

/**
 * Resolves a slot and part id to the part itself, or undefined when the part is
 * no longer registered.
 *
 * Taken as a parameter rather than imported, so the model layer never depends
 * on the art layer. A generated part is built from `params` on the way out,
 * which is why the params travel here rather than into `Part.render`: the art
 * layer closes over them and every other layer stays unaware.
 */
export type PartLookup = (slot: Slot, partId: string, params?: PartParams) => Part | undefined;

/**
 * Drops every equipped entry whose part has left the registry.
 *
 * A part removed between sessions must not break a stored look: the slot is
 * ignored silently and everything else survives (SPEC section 14).
 */
/**
 * The look with any missing painted slot filled from the default.
 *
 * Painted slots are the doll rather than its clothes, so a stored look from
 * before they existed — or one saved with a face part since renamed — would
 * otherwise come back mouthless. Restoring is silent, like every other repair
 * on read (SPEC section 14).
 */
const withFace = (look: Look): Look => {
  const equipped = { ...look.equipped };

  for (const slot of PAINTED_SLOTS) {
    const fallback = DEFAULT_LOOK.equipped[slot];
    if (!equipped[slot] && fallback) equipped[slot] = fallback;
  }

  return { ...look, equipped };
};

export const sanitizeLook = (look: Look, lookup: PartLookup): Look => {
  /* No cast. `Object.entries` gives back the string keys the object really has,
     and pretending they are `Slot`s is exactly what used to let a departed one
     through to a lookup that cannot answer it. */
  const entries = Object.entries(withFace(look).equipped);
  const equipped: Look['equipped'] = {};

  for (const [slot, entry] of entries) {
    // The slot is checked before the part, because a name from outside the
    // taxonomy is not a question the lookup can be asked (see `isSlot`).
    if (isSlot(slot) && lookup(slot, entry.partId)) {
      equipped[slot] = entry;
    }
  }

  return { ...look, equipped };
};

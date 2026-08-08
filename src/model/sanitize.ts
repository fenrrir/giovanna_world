import { DEFAULT_LOOK } from './defaults';
import { PAINTED_SLOTS, type Slot } from './slots';
import type { EquippedPart, Look, Part } from './types';

/**
 * Resolves a slot and part id to the part itself, or undefined when the part is
 * no longer registered.
 *
 * Taken as a parameter rather than imported, so the model layer never depends
 * on the art layer.
 */
export type PartLookup = (slot: Slot, partId: string) => Part | undefined;

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
  const entries = Object.entries(withFace(look).equipped) as [Slot, EquippedPart][];
  const equipped: Look['equipped'] = {};

  for (const [slot, entry] of entries) {
    if (lookup(slot, entry.partId)) {
      equipped[slot] = entry;
    }
  }

  return { ...look, equipped };
};

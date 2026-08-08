import type { Slot } from './slots';
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
export const sanitizeLook = (look: Look, lookup: PartLookup): Look => {
  const entries = Object.entries(look.equipped) as [Slot, EquippedPart][];
  const equipped: Look['equipped'] = {};

  for (const [slot, entry] of entries) {
    if (lookup(slot, entry.partId)) {
      equipped[slot] = entry;
    }
  }

  return { ...look, equipped };
};

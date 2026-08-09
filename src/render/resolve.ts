import type { PartLookup } from '../model/sanitize';
import { Z, isSlot, type Slot } from '../model/slots';
import type { Look, Part } from '../model/types';

export type ResolvedLayer = { slot: Slot; part: Part; color: string };

/**
 * The body is never optional and can never be hidden — it is the doll itself
 * (SPEC section 7).
 */
const UNHIDEABLE: Slot = 'body';

type EquippedLayer = { slot: Slot; part: Part; color: string };

const equippedLayers = (look: Look, lookup: PartLookup): EquippedLayer[] => {
  const layers: EquippedLayer[] = [];

  const entries = Object.entries(look.equipped);

  for (const [slot, entry] of entries) {
    // The album renders looks straight off the disk, unsanitised, so a slot
    // this version has dropped arrives here too — and `Z[slot]` has no entry
    // for it either. Checked before the lookup, which cannot be asked.
    if (!isSlot(slot)) continue;

    const part = lookup(slot, entry.partId, entry.params);

    // A part removed from the registry is skipped silently (SPEC section 14).
    if (part) layers.push({ slot, part, color: entry.color });
  }

  return layers;
};

const hiddenSlots = (layers: EquippedLayer[]): Set<Slot> => {
  const hidden = new Set<Slot>();

  for (const { slot, part } of layers) {
    for (const target of part.hides ?? []) {
      // A part may not hide the body, nor erase itself.
      if (target !== UNHIDEABLE && target !== slot) hidden.add(target);
    }
  }

  return hidden;
};

/**
 * Turns a Look into the ordered list of fragments the canvas should paint.
 *
 * Hiding is a render-time concern only: a dress removes the `bottom` layer from
 * the output but the skirt stays in the state, so swapping the dress for a
 * t-shirt brings it straight back (SPEC section 7).
 */
export const resolveLayers = (look: Look, lookup: PartLookup, body: Part): ResolvedLayer[] => {
  const equipped = equippedLayers(look, lookup);
  const hidden = hiddenSlots(equipped);

  return [
    ...equipped.filter(({ slot }) => !hidden.has(slot)),
    { slot: UNHIDEABLE, part: body, color: look.skin },
  ].sort((a, b) => Z[a.slot] - Z[b.slot]);
};

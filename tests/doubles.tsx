import type { PartLookup } from '../src/model/sanitize';
import { RENDER_ORDER, type Slot } from '../src/model/slots';
import type { HairStyle, Part } from '../src/model/types';

/**
 * Minimal stand-ins for real artwork, so the model and render layers can be
 * tested without importing the part registry. Lives outside src/ because it is
 * test scaffolding, not production code.
 */

export const stubPart = (slot: Slot, id = `${slot}.stub`, hides?: Slot[]): Part => ({
  id,
  slot,
  palette: slot === 'body' ? 'skin' : 'fabric',
  ...(hides ? { hides } : {}),
  render: (color: string) => <rect data-part={id} fill={color} />,
});

export const stubHair = (id = 'hair.stub'): HairStyle => ({
  id,
  back: (color: string) => <rect data-part={`${id}.back`} fill={color} />,
  front: (color: string) => <rect data-part={`${id}.front`} fill={color} />,
});

/** Builds a lookup over a fixed set of parts, matching the registry's contract. */
export const stubLookup =
  (...parts: Part[]): PartLookup =>
  (slot, partId) =>
    parts.find((part) => part.slot === slot && part.id === partId);

/**
 * A lookup built the way the real registry builds one: an index keyed by slot.
 *
 * `findPart` is `INDEX[slot].get(partId)`, so a slot the taxonomy has never
 * heard of throws instead of answering undefined. That is not a flaw to paper
 * over in the double — it is the behaviour every caller has to survive, because
 * the slot arrives out of storage as a string and no cast can make it true.
 *
 * Every known slot gets an entry, empty or not, exactly as `indexBySlot` does.
 * Only a name from outside the taxonomy is missing, and only that one throws.
 */
export const indexedLookup = (...parts: Part[]): PartLookup => {
  const index = Object.fromEntries(
    RENDER_ORDER.map((slot) => [slot, new Map<string, Part>()]),
  ) as Record<Slot, Map<string, Part>>;

  for (const part of parts) index[part.slot].set(part.id, part);

  return (slot, partId) => index[slot].get(partId);
};

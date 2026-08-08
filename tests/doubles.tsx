import type { PartLookup } from '../src/model/sanitize';
import type { Slot } from '../src/model/slots';
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

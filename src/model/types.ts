import type { ReactNode } from 'react';

import type { Slot } from './slots';

export type Palette = 'skin' | 'hair' | 'fabric' | 'makeup';

export type Part = {
  /** Namespaced identifier, e.g. 'top.polka-dot-dress'. */
  id: string;
  slot: Slot;
  palette: Palette;
  /**
   * Slots this part removes from the render while equipped. Never its own slot
   * and never 'body'. The hidden slot stays in the state and reappears when
   * this part is swapped out (SPEC section 7).
   */
  hides?: Slot[];
  /** An SVG fragment, without an outer <svg>. */
  render: (color: string) => ReactNode;
};

/**
 * A hairstyle occupies two slots but is a single choice, in a single colour,
 * for the child (SPEC section 7).
 */
export type HairStyle = {
  id: string;
  back: (color: string) => ReactNode;
  front: (color: string) => ReactNode;
};

/**
 * The axes of a part the child shapes herself, rather than picks ready-made.
 *
 * Opaque to the model: only the art layer knows what a key means, which is what
 * keeps the model from having to learn about hair to store a hairstyle.
 */
export type PartParams = Readonly<Record<string, number | string>>;

export type EquippedPart = {
  partId: string;
  color: string;
  /**
   * Absent for every ready-made part. Additive, so a look stored before
   * generated parts existed reads back unchanged and `schemaVersion` stays 1.
   */
  params?: PartParams;
};

export type Look = {
  schemaVersion: 1;
  /** Skin tone hex. The body has no part variants; it varies only by this. */
  skin: string;
  equipped: Partial<Record<Slot, EquippedPart>>;
};

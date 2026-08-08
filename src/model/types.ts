import type { ReactNode } from 'react';

import type { Slot } from './slots';

export type Palette = 'skin' | 'hair' | 'fabric';

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

export type EquippedPart = { partId: string; color: string };

export type Look = {
  schemaVersion: 1;
  /** Skin tone hex. The body has no part variants; it varies only by this. */
  skin: string;
  equipped: Partial<Record<Slot, EquippedPart>>;
};

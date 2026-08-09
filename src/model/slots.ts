/**
 * Every part belongs to a slot. The renderer sorts by z (SPEC section 7).
 */
export type Slot =
  | 'hairBack'
  | 'body'
  | 'blush'
  | 'brows'
  | 'lips'
  | 'socks'
  | 'shoes'
  | 'bottom'
  | 'top'
  | 'outer'
  | 'hairFront'
  | 'accessoryFace'
  | 'accessoryHead'
  | 'handheld';

/** Stacking order. The gaps between values leave room for future insertions. */
export const Z: Record<Slot, number> = {
  hairBack: 0,
  body: 10,
  blush: 12,
  brows: 14,
  lips: 16,
  socks: 20,
  shoes: 30,
  bottom: 40,
  top: 50,
  outer: 60,
  hairFront: 70,
  accessoryFace: 75,
  accessoryHead: 80,
  handheld: 90,
};

/** Slots in paint order, back to front. Derived from Z so the two cannot drift. */
export const RENDER_ORDER: readonly Slot[] = (Object.keys(Z) as Slot[]).sort((a, b) => Z[a] - Z[b]);

const KNOWN: ReadonlySet<string> = new Set(RENDER_ORDER);

/**
 * Whether a name out of storage is a slot this version of the app knows.
 *
 * A stored look's keys are strings, and the app reads looks written by earlier
 * versions of itself — versions that had slots this one has since dropped. The
 * part lookup is an index keyed by slot, so it answers a departed name with a
 * crash rather than with undefined, and the crash lands inside the store's lazy
 * initialiser: a white screen holding the outfit she was wearing.
 *
 * Casting `Object.entries(look.equipped)` to `Slot` is what lets that through.
 * The cast cannot be made true, so the check has to be made real.
 */
export const isSlot = (name: string): name is Slot => KNOWN.has(name);

/**
 * What the child can choose. `hair` is a single choice writing into two slots
 * (SPEC section 7), so it is a tray identifier rather than a Slot.
 */
export type TraySlot =
  | 'hair'
  | 'brows'
  | 'lips'
  | 'blush'
  | 'top'
  | 'bottom'
  | 'socks'
  | 'shoes'
  | 'outer'
  | 'accessoryHead'
  | 'handheld';

/** In the order they read down the doll: hair, then the face, then the outfit. */
export const SELECTABLE_SLOTS: readonly TraySlot[] = [
  'hair',
  'brows',
  'lips',
  'blush',
  'top',
  'bottom',
  'socks',
  'shoes',
  'outer',
  'accessoryHead',
  'handheld',
];

/**
 * Slots that are part of the doll rather than worn on it.
 *
 * A child changes their colour but never takes them off — a doll with no mouth
 * reads as broken rather than as undressed. This is why the drag that pulls a
 * garment off refuses them, and why a stored look missing one gets it back.
 */
export const PAINTED_SLOTS: readonly Slot[] = ['body', 'blush', 'brows', 'lips'];

export const isPainted = (slot: Slot): boolean => PAINTED_SLOTS.includes(slot);

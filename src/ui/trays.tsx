import type { ReactNode } from 'react';

import { THUMB_FOCUS, type Box } from '../anchors';
import type { MessageKey } from '../i18n';
import type { LookAction } from '../model/reducer';
import { SELECTABLE_SLOTS, type Slot, type TraySlot } from '../model/slots';
import type { HairStyle, Look, Palette, PartParams } from '../model/types';
import { CUSTOM_HAIR_ID, customHair } from '../parts/hair/custom';
import { toHairParams } from '../parts/hair/custom/params';
import { HAIR_STYLES, PARTS_BY_SLOT } from '../parts/registry';

/**
 * What a tray is made of.
 *
 * The child sees four trays; the model has eleven slots. This module is the
 * one place that bridges the two, so the rest of the UI never has to know that
 * a hairstyle is secretly a pair of slots (SPEC section 7).
 */
export type TrayDefinition = {
  id: TraySlot;
  /** The slot whose equipped entry this tray reflects and recolours. */
  slot: Slot;
  palette: Palette;
  focus: Box;
  /** Whether the randomiser touches this tray. The face and accessories keep
   * what the child chose; only the outfit is thrown away. */
  randomised: boolean;
  label: MessageKey;
};

/**
 * Keyed by tray, so the lookup is total: adding a tray to the model is a
 * compile error here until it is defined, and no fallback branch is needed.
 */
const BY_ID: Record<TraySlot, TrayDefinition> = {
  hair: {
    id: 'hair',
    slot: 'hairFront',
    palette: 'hair',
    focus: THUMB_FOCUS.hair,
    label: 'tray.hair',
    randomised: true,
  },
  top: {
    id: 'top',
    slot: 'top',
    palette: 'fabric',
    focus: THUMB_FOCUS.top,
    label: 'tray.top',
    randomised: true,
  },
  bottom: {
    id: 'bottom',
    slot: 'bottom',
    palette: 'fabric',
    focus: THUMB_FOCUS.bottom,
    label: 'tray.bottom',
    randomised: true,
  },
  shoes: {
    id: 'shoes',
    slot: 'shoes',
    palette: 'fabric',
    focus: THUMB_FOCUS.shoes,
    label: 'tray.shoes',
    randomised: true,
  },
  brows: {
    id: 'brows',
    slot: 'brows',
    palette: 'hair',
    focus: THUMB_FOCUS.brows,
    label: 'tray.brows',
    randomised: false,
  },
  lips: {
    id: 'lips',
    slot: 'lips',
    palette: 'makeup',
    focus: THUMB_FOCUS.lips,
    label: 'tray.lips',
    randomised: false,
  },
  blush: {
    id: 'blush',
    slot: 'blush',
    palette: 'makeup',
    focus: THUMB_FOCUS.blush,
    label: 'tray.blush',
    randomised: false,
  },
  accessoryHead: {
    id: 'accessoryHead',
    slot: 'accessoryHead',
    palette: 'fabric',
    focus: THUMB_FOCUS.accessoryHead,
    label: 'tray.accessoryHead',
    randomised: false,
  },
};

export const trayById = (id: TraySlot): TrayDefinition => BY_ID[id];

/** On screen in the order the model declares, so the two cannot disagree. */
export const TRAYS: readonly TrayDefinition[] = SELECTABLE_SLOTS.map(trayById);

/** The trays the randomiser replaces: the outfit, not the doll's own face. */
export const RANDOM_TRAYS: readonly TrayDefinition[] = TRAYS.filter((tray) => tray.randomised);

/**
 * The tray a slot belongs to, for the times something starts from the doll
 * rather than from a tray. Both hair slots answer with the one hair tray,
 * because the child only ever sees one.
 */
export const trayForSlot = (slot: Slot): TrayDefinition | undefined =>
  slot === 'hairBack' ? BY_ID.hair : TRAYS.find((tray) => tray.slot === slot);

/**
 * One choosable thing in a tray.
 *
 * Each item carries the action that applies it, so the tray never branches on
 * whether it is showing a hairstyle or a garment.
 */
export type TrayItem = {
  id: string;
  render: (color: string) => ReactNode;
  apply: (color: string) => LookAction;
  /** Its own accessible name, for an item that is not just another piece. */
  label?: MessageKey;
  /**
   * Whether choosing it also opens the axes that shape it.
   *
   * The randomiser leaves these alone: landing on one would open an editor
   * with no gesture from the child, and it could only ever draw the piece at
   * its default axes anyway, which is a fixed piece wearing a disguise.
   */
  shaped?: boolean;
};

const hairItem = (hair: HairStyle, params?: PartParams): TrayItem => ({
  id: hair.id,
  // Both halves, so the thumbnail shows the hairstyle the child will get.
  render: (color) => (
    <>
      {hair.back(color)}
      {hair.front(color)}
    </>
  ),
  apply: (color) => ({ type: 'applyHair', hair, color, ...(params ? { params } : {}) }),
});

/**
 * The drawn hairstyles, then the one she shapes herself.
 *
 * Last, and carrying her current axes rather than the defaults, so its
 * thumbnail shows the hair she already made instead of a stranger's.
 */
const hairItems = (custom?: PartParams): TrayItem[] => [
  ...HAIR_STYLES.map((hair) => hairItem(hair)),
  { ...hairItem(customHair(custom), toHairParams(custom)), label: 'hair.custom', shaped: true },
];

const partItems = (slot: Slot): TrayItem[] =>
  PARTS_BY_SLOT[slot].map((part) => ({
    id: part.id,
    render: part.render,
    apply: (color) => ({ type: 'applyPart', part, color }),
  }));

export const trayItems = (tray: TrayDefinition, custom?: PartParams): TrayItem[] =>
  tray.id === 'hair' ? hairItems(custom) : partItems(tray.slot);

/** The axes of the generated hairstyle she is wearing, if she is wearing it. */
export const customHairParams = (look: Look): PartParams | undefined =>
  look.equipped.hairFront?.partId === CUSTOM_HAIR_ID ? look.equipped.hairFront.params : undefined;

/** The item currently worn in this tray, if any. */
export const equippedIn = (look: Look, tray: TrayDefinition): string | undefined =>
  look.equipped[tray.slot]?.partId;

/** What a tray shows as its own icon: what is worn, else the first choice. */
export const trayIcon = (look: Look, tray: TrayDefinition): TrayItem | undefined => {
  const items = trayItems(tray, customHairParams(look));
  const worn = equippedIn(look, tray);

  return items.find((item) => item.id === worn) ?? items[0];
};

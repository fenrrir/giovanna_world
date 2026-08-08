import type { ReactNode } from 'react';

import { THUMB_FOCUS, type Box } from '../anchors';
import type { MessageKey } from '../i18n';
import type { LookAction } from '../model/reducer';
import { SELECTABLE_SLOTS, type Slot, type TraySlot } from '../model/slots';
import type { Look, Palette } from '../model/types';
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
  },
  top: { id: 'top', slot: 'top', palette: 'fabric', focus: THUMB_FOCUS.top, label: 'tray.top' },
  bottom: {
    id: 'bottom',
    slot: 'bottom',
    palette: 'fabric',
    focus: THUMB_FOCUS.bottom,
    label: 'tray.bottom',
  },
  shoes: {
    id: 'shoes',
    slot: 'shoes',
    palette: 'fabric',
    focus: THUMB_FOCUS.shoes,
    label: 'tray.shoes',
  },
  accessoryHead: {
    id: 'accessoryHead',
    slot: 'accessoryHead',
    palette: 'fabric',
    focus: THUMB_FOCUS.accessoryHead,
    label: 'tray.accessoryHead',
  },
};

export const trayById = (id: TraySlot): TrayDefinition => BY_ID[id];

/** On screen in the order the model declares, so the two cannot disagree. */
export const TRAYS: readonly TrayDefinition[] = SELECTABLE_SLOTS.map(trayById);

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
};

const hairItems = (): TrayItem[] =>
  HAIR_STYLES.map((hair) => ({
    id: hair.id,
    // Both halves, so the thumbnail shows the hairstyle the child will get.
    render: (color) => (
      <>
        {hair.back(color)}
        {hair.front(color)}
      </>
    ),
    apply: (color) => ({ type: 'applyHair', hair, color }),
  }));

const partItems = (slot: Slot): TrayItem[] =>
  PARTS_BY_SLOT[slot].map((part) => ({
    id: part.id,
    render: part.render,
    apply: (color) => ({ type: 'applyPart', part, color }),
  }));

export const trayItems = (tray: TrayDefinition): TrayItem[] =>
  tray.id === 'hair' ? hairItems() : partItems(tray.slot);

/** The item currently worn in this tray, if any. */
export const equippedIn = (look: Look, tray: TrayDefinition): string | undefined =>
  look.equipped[tray.slot]?.partId;

/** What a tray shows as its own icon: what is worn, else the first choice. */
export const trayIcon = (look: Look, tray: TrayDefinition): TrayItem | undefined => {
  const items = trayItems(tray);
  const worn = equippedIn(look, tray);

  return items.find((item) => item.id === worn) ?? items[0];
};

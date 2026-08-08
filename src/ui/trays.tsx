import type { ReactNode } from 'react';

import { THUMB_FOCUS, type Box } from '../anchors';
import type { MessageKey } from '../i18n';
import type { LookAction } from '../model/reducer';
import { SELECTABLE_SLOTS, type Slot, type TraySlot } from '../model/slots';
import type { HairStyle, Look, Palette, PartParams } from '../model/types';
import { HAIR_STYLES, PARTS_BY_SLOT } from '../parts/registry';
import { SHAPED_HAIR, SHAPED_OUTER, SHAPED_SOCKS, shapedParams, type ShapedFamily } from './shaped';

/**
 * What a tray is made of.
 *
 * The child sees four trays; the model has eleven slots. This module is the
 * one place that bridges the two, so the rest of the UI never has to know that
 * a hairstyle is secretly a pair of slots (SPEC section 7).
 */
export type Roll = 'always' | 'sometimes' | 'never';

export type TrayDefinition = {
  id: TraySlot;
  /** The slot whose equipped entry this tray reflects and recolours. */
  slot: Slot;
  palette: Palette;
  focus: Box;
  /**
   * How the dice treat this tray.
   *
   * `always` is the outfit, which is replaced whole. `sometimes` is what she
   * may or may not be wearing — a jacket, a bag — so the dice decide whether it
   * goes on at all, which is the only way one can also come off. `never` is the
   * face: not worn, and not the dice's to touch.
   */
  randomised: Roll;
  label: MessageKey;
  /** The family of pieces this tray lets her shape, if it has one. */
  shaped?: ShapedFamily;
};

/**
 * Keyed by tray, so the lookup is total: adding a tray to the model is a
 * compile error here until it is defined, and no fallback branch is needed.
 */
const BY_ID: Record<TraySlot, TrayDefinition> = {
  scene: {
    id: 'scene',
    slot: 'scene',
    palette: 'fabric',
    focus: THUMB_FOCUS.scene,
    label: 'tray.scene',
    /* Scenery rather than outfit, so the dice may set it or leave her on plain
       ground — the same treatment an accessory gets. */
    randomised: 'sometimes',
  },
  hair: {
    id: 'hair',
    slot: 'hairFront',
    palette: 'hair',
    focus: THUMB_FOCUS.hair,
    label: 'tray.hair',
    randomised: 'always',
    shaped: SHAPED_HAIR,
  },
  top: {
    id: 'top',
    slot: 'top',
    palette: 'fabric',
    focus: THUMB_FOCUS.top,
    label: 'tray.top',
    randomised: 'always',
  },
  bottom: {
    id: 'bottom',
    slot: 'bottom',
    palette: 'fabric',
    focus: THUMB_FOCUS.bottom,
    label: 'tray.bottom',
    randomised: 'always',
  },
  shoes: {
    id: 'shoes',
    slot: 'shoes',
    palette: 'fabric',
    focus: THUMB_FOCUS.shoes,
    label: 'tray.shoes',
    randomised: 'always',
  },
  brows: {
    id: 'brows',
    slot: 'brows',
    palette: 'hair',
    focus: THUMB_FOCUS.brows,
    label: 'tray.brows',
    randomised: 'never',
  },
  lips: {
    id: 'lips',
    slot: 'lips',
    palette: 'makeup',
    focus: THUMB_FOCUS.lips,
    label: 'tray.lips',
    randomised: 'never',
  },
  blush: {
    id: 'blush',
    slot: 'blush',
    palette: 'makeup',
    focus: THUMB_FOCUS.blush,
    label: 'tray.blush',
    randomised: 'never',
  },
  socks: {
    id: 'socks',
    slot: 'socks',
    palette: 'fabric',
    focus: THUMB_FOCUS.socks,
    label: 'tray.socks',
    /* Off the dice for the same reason as the jacket: its only piece is one she
     * shapes, and the randomiser never lands on those. */
    randomised: 'sometimes',
    shaped: SHAPED_SOCKS,
  },
  outer: {
    id: 'outer',
    slot: 'outer',
    palette: 'fabric',
    focus: THUMB_FOCUS.outer,
    label: 'tray.outer',
    /*
     * Off the dice for now: the only jacket there is is one she shapes, and the
     * randomiser never lands on those. Turn it on the day a ready-made jacket
     * joins it.
     */
    randomised: 'sometimes',
    shaped: SHAPED_OUTER,
  },
  handheld: {
    id: 'handheld',
    slot: 'handheld',
    palette: 'fabric',
    focus: THUMB_FOCUS.handheld,
    label: 'tray.handheld',
    /* An accessory rather than an outfit, so the dice leave it as she left it. */
    randomised: 'sometimes',
  },
  accessoryHead: {
    id: 'accessoryHead',
    slot: 'accessoryHead',
    palette: 'fabric',
    focus: THUMB_FOCUS.accessoryHead,
    label: 'tray.accessoryHead',
    randomised: 'sometimes',
  },
};

export const trayById = (id: TraySlot): TrayDefinition => BY_ID[id];

/** On screen in the order the model declares, so the two cannot disagree. */
export const TRAYS: readonly TrayDefinition[] = SELECTABLE_SLOTS.map(trayById);

/** The trays the dice may touch: everything worn, never the face. */
export const RANDOM_TRAYS: readonly TrayDefinition[] = TRAYS.filter(
  (tray) => tray.randomised !== 'never',
);

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

const hairItem = (hair: HairStyle): TrayItem => ({
  id: hair.id,
  // Both halves, so the thumbnail shows the hairstyle the child will get.
  render: (color) => (
    <>
      {hair.back(color)}
      {hair.front(color)}
    </>
  ),
  apply: (color) => ({ type: 'applyHair', hair, color }),
});

const partItems = (slot: Slot): TrayItem[] =>
  PARTS_BY_SLOT[slot].map((part) => ({
    id: part.id,
    render: part.render,
    apply: (color) => ({ type: 'applyPart', part, color }),
  }));

const readyMade = (tray: TrayDefinition): TrayItem[] =>
  tray.id === 'hair' ? HAIR_STYLES.map(hairItem) : partItems(tray.slot);

/** The axes of the shaped piece she is wearing in this tray, if she is. */
export const trayParams = (look: Look | undefined, tray: TrayDefinition): PartParams | undefined =>
  tray.shaped ? shapedParams(look, tray.slot, tray.shaped) : undefined;

/**
 * The ready-made pieces, then the one she shapes herself.
 *
 * Last, and carrying her current axes rather than the defaults, so its
 * thumbnail shows the piece she already made instead of a stranger's. The
 * registry holds the shaped piece as well, at its default axes, so that copy is
 * dropped rather than offered twice.
 */
export const trayItems = (tray: TrayDefinition, look?: Look): TrayItem[] => {
  const family = tray.shaped;

  if (!family) return readyMade(tray);

  const params = family.read(trayParams(look, tray));

  return [
    ...readyMade(tray).filter((item) => item.id !== family.id),
    {
      id: family.id,
      label: family.label,
      shaped: true,
      render: family.render(params),
      apply: (color) => family.apply(params, color),
    },
  ];
};

/** The item currently worn in this tray, if any. */
export const equippedIn = (look: Look, tray: TrayDefinition): string | undefined =>
  look.equipped[tray.slot]?.partId;

/** What a tray shows as its own icon: what is worn, else the first choice. */
export const trayIcon = (look: Look, tray: TrayDefinition): TrayItem | undefined => {
  const items = trayItems(tray, look);
  const worn = equippedIn(look, tray);

  return items.find((item) => item.id === worn) ?? items[0];
};

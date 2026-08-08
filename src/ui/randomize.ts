import { PALETTES } from '../model/palettes';
import { lookReducer } from '../model/reducer';
import { isPainted, type Slot } from '../model/slots';
import type { EquippedPart, Look, PartParams } from '../model/types';
import type { ShapedFamily } from './shaped';
import { RANDOM_TRAYS, trayItems, type TrayDefinition } from './trays';

/**
 * A new outfit over the doll the child already has: one piece per outfit tray,
 * and a colour for each.
 *
 * It builds on the doll in front of the child rather than on the default, so
 * her skin tone and the face she made survive the roll. Rebuilding from the
 * default would have thrown those away without ever looking like a bug.
 *
 * The generator is a parameter, not `Math.random`, so a test can pin exactly
 * which pieces come out. It lives beside the trays rather than in the model
 * because "one piece per tray" is what the child sees; the model has eleven
 * slots and no idea they are grouped into four.
 *
 * A tray whose only remaining choice is one she shapes herself comes out
 * untouched, which is the same answer it already gave for a tray with no
 * artwork at all.
 */

export type Rng = () => number;

const pick = <T>(items: readonly T[], rng: Rng): T | undefined =>
  items[Math.min(Math.floor(rng() * items.length), Math.max(items.length - 1, 0))];

/**
 * The doll with everything worn taken off, and nothing else touched.
 *
 * The dice give her a new outfit, so the old one has to come off first. Her
 * skin and her face are not worn; they are her, and they stay. Everything else
 * comes off and is then dressed again — which is how a jacket comes up on one
 * roll and not the next, rather than staying on for good once worn.
 */
const undressed = (look: Look): Look => {
  const entries = Object.entries(look.equipped) as [Slot, EquippedPart][];
  const equipped: Look['equipped'] = {};

  for (const [slot, entry] of entries) {
    if (isPainted(slot)) equipped[slot] = entry;
  }

  return { ...look, equipped };
};

/** How often a tray she may or may not be wearing comes up dressed. */
const WEARS_IT = 0.5;

/** Two decimals is finer than the panel's own step, and keeps the JSON short. */
const axis = (rng: Rng): number => Math.round(rng() * 100) / 100;

/**
 * A shape rolled from scratch.
 *
 * The dice used to skip generated pieces entirely, and the reason was sound at
 * the time: landing on one could only ever have drawn it at its default axes,
 * one fixed jacket wearing a disguise. Rolling the axes is what makes a
 * generated piece worth landing on, and what lets a jacket exist in the dice at
 * all now that the only jacket there is is one she shapes.
 */
const rollShape = (family: ShapedFamily, rng: Rng): PartParams => {
  const rolled: Record<string, number | string> = {};

  for (const { key } of family.axes) rolled[key] = axis(rng);

  const option = pick(family.choice.options, rng);

  if (option) rolled[family.choice.key] = option.value;

  return family.read(rolled);
};

/** One tray dressed: a piece, a colour, and a shape if the piece has one. */
const dress = (look: Look, tray: TrayDefinition, rng: Rng): Look => {
  const item = pick(trayItems(tray), rng);
  const color = pick(PALETTES[tray.palette], rng);

  if (!item || !color) return look;

  return lookReducer(
    look,
    item.shaped && tray.shaped
      ? tray.shaped.apply(rollShape(tray.shaped, rng), color)
      : item.apply(color),
  );
};

export const randomLook = (rng: Rng, current: Look): Look =>
  RANDOM_TRAYS.reduce<Look>(
    (look, tray) =>
      tray.randomised === 'sometimes' && rng() >= WEARS_IT ? look : dress(look, tray, rng),
    undressed(current),
  );

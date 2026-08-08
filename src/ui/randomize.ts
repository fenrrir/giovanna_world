import { PALETTES } from '../model/palettes';
import { lookReducer } from '../model/reducer';
import { isPainted, type Slot } from '../model/slots';
import type { EquippedPart, Look } from '../model/types';
import { RANDOM_TRAYS, trayItems } from './trays';

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
 * The dice give her a new outfit, so the old one has to come off first. Left
 * on, anything the dice do not own stays on through every roll — a jacket worn
 * once was on for good, and the only way back was to drag it off. Her skin and
 * her face are not worn; they are her, and they stay.
 */
const undressed = (look: Look): Look => {
  const entries = Object.entries(look.equipped) as [Slot, EquippedPart][];
  const equipped: Look['equipped'] = {};

  for (const [slot, entry] of entries) {
    if (isPainted(slot)) equipped[slot] = entry;
  }

  return { ...look, equipped };
};

export const randomLook = (rng: Rng, current: Look): Look =>
  RANDOM_TRAYS.reduce<Look>((look, tray) => {
    const item = pick(
      trayItems(tray).filter((candidate) => !candidate.shaped),
      rng,
    );
    const color = pick(PALETTES[tray.palette], rng);

    return item && color ? lookReducer(look, item.apply(color)) : look;
  }, undressed(current));

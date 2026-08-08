import { PALETTES } from '../model/palettes';
import { lookReducer } from '../model/reducer';
import type { Look } from '../model/types';
import { RANDOM_TRAYS, trayItems } from './trays';

/**
 * A new outfit over the doll the child already has: one piece per outfit tray,
 * and a colour for each.
 *
 * It builds on the current look rather than on the default, so everything the
 * randomiser does not own survives — the skin tone, the face and any accessory.
 * Rebuilding from the default would have quietly thrown those away, which is
 * the opposite of leaving them alone.
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

export const randomLook = (rng: Rng, current: Look): Look =>
  RANDOM_TRAYS.reduce<Look>((look, tray) => {
    const item = pick(
      trayItems(tray).filter((candidate) => !candidate.shaped),
      rng,
    );
    const color = pick(PALETTES[tray.palette], rng);

    return item && color ? lookReducer(look, item.apply(color)) : look;
  }, current);

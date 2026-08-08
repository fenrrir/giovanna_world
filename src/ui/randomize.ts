import { DEFAULT_LOOK } from '../model/defaults';
import { PALETTES } from '../model/palettes';
import { lookReducer } from '../model/reducer';
import type { Look } from '../model/types';
import { TRAYS, trayItems } from './trays';

/**
 * A whole look picked at random: skin tone, one piece per tray, and a colour
 * for each.
 *
 * The generator is a parameter, not `Math.random`, so a test can pin exactly
 * which pieces come out. It lives beside the trays rather than in the model
 * because "one piece per tray" is what the child sees; the model has eleven
 * slots and no idea they are grouped into four.
 */

export type Rng = () => number;

const pick = <T>(items: readonly T[], rng: Rng): T | undefined =>
  items[Math.min(Math.floor(rng() * items.length), Math.max(items.length - 1, 0))];

export const randomLook = (rng: Rng): Look =>
  TRAYS.reduce<Look>(
    (look, tray) => {
      const item = pick(trayItems(tray), rng);
      const color = pick(PALETTES[tray.palette], rng);

      return item && color ? lookReducer(look, item.apply(color)) : look;
    },
    // The palettes are fixed non-empty tuples, so the fallback is unreachable;
    // TypeScript cannot see that through a computed index.
    { ...DEFAULT_LOOK, skin: pick(PALETTES.skin, rng) ?? DEFAULT_LOOK.skin },
  );

import { describe, it } from 'vitest';

import { PALETTES } from '../../src/model/palettes';
import type { Look } from '../../src/model/types';
import { lookReducer } from '../../src/model/reducer';
import { TRAYS, trayItems } from '../../src/ui/trays';
import { DRESSED, HOLE_BACKDROP, drawLook, slug, writePreview } from './preview';

/**
 * Headless visual check of the doll and every part she can wear.
 *
 * What the files are made of, and why the magenta twin exists, is in
 * `preview.tsx`. This one walks the trays.
 */

const BARE: Look = { schemaVersion: 1, skin: PALETTES.skin[0], equipped: {} };

describe('preview', () => {
  it('writes the doll to preview/ for visual review', () => {
    writePreview('bare', drawLook(BARE));
    writePreview('dressed', drawLook(DRESSED));
    /* Named `holes` rather than `dressed-holes`: CLAUDE.md sends every session
       to this exact file, and it is the one the rule is about. */
    writePreview('holes', drawLook(DRESSED), HOLE_BACKDROP);
  });

  /**
   * One file per part, each on the standard canvas. A single wide sheet would
   * match /dev/sheet more closely, but Quick Look renders a wide SVG
   * unreliably, and a preview that cannot be trusted is worse than none.
   */
  it.each(TRAYS.map((tray) => [tray.id, tray] as const))(
    'writes each %s part over the body',
    (_id, tray) => {
      for (const item of trayItems(tray)) {
        /* Composed through the reducer, not by drawing the part over the body:
           hair occupies a slot behind the doll and one in front of it. */
        const look = lookReducer(
          { schemaVersion: 1, skin: PALETTES.skin[1], equipped: {} },
          item.apply(PALETTES[tray.palette][0]),
        );

        writePreview(`part-${slug(item.id)}`, drawLook(look));
        writePreview(`part-${slug(item.id)}-holes`, drawLook(look), HOLE_BACKDROP);
      }
    },
  );
});

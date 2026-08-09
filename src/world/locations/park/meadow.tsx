import { ANCHORS } from '../../../anchors';
import { PALETTES } from '../../../model/palettes';
import { MEADOW as MEADOW_SCENE } from '../../../parts/scene/meadow';
import type { Environment } from '../../registry';

/**
 * A meadow under an open sky, and the one place in the world that is outdoors.
 *
 * Borrowed from the part registry the same way the bedroom is, and on the same
 * terms: the artwork moves in here when `scene` stops being a slot.
 */
export const MEADOW: Environment = {
  id: 'park.meadow',
  floor: { y: ANCHORS.sole.y, scale: 1 },
  defaultColor: PALETTES.fabric[4],
  render: MEADOW_SCENE.render,
};

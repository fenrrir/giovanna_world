import { ANCHORS } from '../../../anchors';
import { PALETTES } from '../../../model/palettes';
import { BEDROOM as BEDROOM_SCENE } from '../../../parts/scene/bedroom';
import type { Environment } from '../../registry';

/**
 * Her room: a papered wall, a floor, and a window with the evening in it.
 *
 * The artwork is the backdrop she already had, borrowed rather than copied
 * while it still belongs to the part registry. It moves into this file whole
 * when `scene` leaves the slot taxonomy, and this import line goes with it.
 *
 * Her feet rest where they already rested and she stands the size she already
 * stood, so nothing about this room looks different for having become a place.
 * A room drawn for the world rather than inherited by it will ask for a smaller
 * scale, so that two dolls fit in it.
 */
export const BEDROOM: Environment = {
  id: 'house.bedroom',
  floor: { y: ANCHORS.sole.y, scale: 1 },
  defaultColor: PALETTES.fabric[0],
  render: BEDROOM_SCENE.render,
};

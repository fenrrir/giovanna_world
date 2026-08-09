import type { JSX, ReactNode } from 'react';

import type { Box } from '../anchors';
import type { MessageKey } from '../i18n';
import { useTranslation } from '../i18n';
import { ENVIRONMENTS, LOCATION_IDS, locationOf, type EnvironmentId } from '../model/places';
import { Thumb } from '../render/Thumb';
import { useWorld } from '../state/worldContext';
import type { World } from '../model/world';
import { MAP_SPOTS } from '../world/anchors';
import { ENVIRONMENTS_BY_ID, PLACE_FOCUS, WORLD_MAP, findLocation } from '../world/registry';
import { ScrollRail } from './ScrollRail';
import { TapTarget } from './TapTarget';
import styles from './controls.module.css';

/** One thing she can go to, drawn as a picture of itself. */
type Destination = {
  key: string;
  label: MessageKey;
  render: (color: string) => ReactNode;
  color: string;
  /** What part of the drawing to show. The whole of it, unless it is a place on the map. */
  focus: Box;
  selected: boolean;
  to: EnvironmentId | null;
};

const roomIn = (colors: World['colors'], id: EnvironmentId, here: EnvironmentId): Destination => ({
  key: id,
  label: 'place.go',
  render: ENVIRONMENTS_BY_ID[id].render,
  color: colors[id] ?? ENVIRONMENTS_BY_ID[id].defaultColor,
  focus: PLACE_FOCUS,
  selected: id === here,
  to: id,
});

/**
 * A location has no drawing of its own, so its picture is cut out of the map:
 * the same house she taps, at the spot the anchors put it. Showing the room
 * inside instead was tried and read as a different place altogether — she is
 * choosing the building she can see, and the picture has to be of that.
 */
const wayInto = (): Destination[] =>
  LOCATION_IDS.map((id): Destination => {
    const spot = MAP_SPOTS[id];

    return {
      key: id,
      label: 'place.enter',
      render: WORLD_MAP.render,
      color: WORLD_MAP.defaultColor,
      focus: { x: spot.x - spot.r, y: spot.y - spot.r, width: spot.r * 2, height: spot.r * 2 },
      selected: false,
      to: findLocation(id).entrance.id,
    };
  });

const theMap = (): Destination => ({
  key: 'map',
  label: 'place.map',
  render: WORLD_MAP.render,
  color: WORLD_MAP.defaultColor,
  focus: PLACE_FOCUS,
  selected: false,
  to: null,
});

/**
 * Everywhere she can go from where she is.
 *
 * On the map it is the locations; inside one it is the map and that location's
 * own rooms. That is the whole of what a location means on screen — the map
 * says which places exist, and being in one narrows the rail to its rooms.
 *
 * It stands where the scenery tray used to and it is the same gesture: tap a
 * picture and she is there. What changed is what the tap means. The place is no
 * longer something the doll wears, so it stays put when the doll changes and it
 * is not kept when an outfit is (SPEC section 4's rule, restated for a world:
 * every move is made by tapping a picture of the destination).
 */
export const PlaceRail = (): JSX.Element => {
  const { t } = useTranslation();
  const { world, dispatch } = useWorld();
  const here = world.here;

  const destinations =
    here === null
      ? wayInto()
      : [theMap(), ...ENVIRONMENTS[locationOf(here)].map((id) => roomIn(world.colors, id, here))];

  return (
    <div className={styles.column}>
      <ScrollRail>
        {destinations.map((destination) => (
          <li key={destination.key}>
            <TapTarget
              label={t(destination.label)}
              selected={destination.selected}
              onSelect={() => {
                dispatch({ type: 'goTo', here: destination.to });
              }}
            >
              <Thumb
                className={styles.thumb}
                render={destination.render}
                color={destination.color}
                focus={destination.focus}
                label={t(destination.label)}
              />
            </TapTarget>
          </li>
        ))}
      </ScrollRail>
    </div>
  );
};

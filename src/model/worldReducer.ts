import type { EnvironmentId } from './places';
import { lookReducer, type LookAction } from './reducer';
import {
  awayFrom,
  dressedDoll,
  lookingAt,
  nowDressing,
  painted,
  standing,
  withDressedDoll,
  type DollIndex,
  type World,
} from './world';

/**
 * The only place a World changes.
 *
 * Every action a tray already dispatches arrives wrapped in `dress` and is
 * handed straight to `lookReducer`, unchanged, against whichever doll she is
 * dressing. That is the whole point of the wrapper: the reducer that knows
 * about hair pairs and hidden slots does not learn there is a world above it,
 * and nothing that dispatches to it has to learn either.
 *
 * The five that are the world's own are the ones a `Look` cannot answer: who
 * she is dressing, where she is looking, who is standing where, and what colour
 * the room is.
 *
 * Every case is a single delegation. That is deliberate rather than tidy: the
 * moment a case grows a branch of its own this switch starts climbing towards
 * the complexity cap, and the helpers it calls are each testable alone.
 */
export type WorldAction =
  | { type: 'dress'; action: LookAction }
  | { type: 'dressDoll'; doll: DollIndex | null }
  | { type: 'goTo'; here: EnvironmentId | null }
  | { type: 'place'; doll: DollIndex; x: number }
  | { type: 'takeAway'; doll: DollIndex }
  | { type: 'paint'; color: string };

export const worldReducer = (world: World, action: WorldAction): World => {
  switch (action.type) {
    case 'dress': {
      const doll = dressedDoll(world);

      return doll === null ? world : withDressedDoll(world, lookReducer(doll, action.action));
    }

    case 'dressDoll':
      return nowDressing(world, action.doll);

    case 'goTo':
      return lookingAt(world, action.here);

    case 'place':
      return standing(world, action.doll, action.x);

    case 'takeAway':
      return awayFrom(world, action.doll);

    case 'paint':
      return painted(world, action.color);
  }
};

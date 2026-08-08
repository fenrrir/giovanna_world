import type { LookAction } from './reducer';
import { lookReducer } from './reducer';
import {
  dressedDoll,
  nowDressing,
  withDressedDoll,
  withScene,
  type Stage,
  type Standing,
} from './stage';
import type { EquippedPart } from './types';

/**
 * The only place a Stage changes.
 *
 * Every action a tray already dispatches arrives wrapped in `dress` and is
 * handed straight to `lookReducer`, unchanged, against whichever doll she is
 * dressing. That is the whole point of the wrapper: the reducer that knows
 * about hair pairs and hidden slots does not learn there are two dolls, and
 * nothing that dispatches to it has to learn either.
 *
 * The two actions that are the stage's own are the ones a `Look` cannot answer:
 * who she is dressing, and the sky above both of them.
 */
export type StageAction =
  | { type: 'dress'; action: LookAction }
  | { type: 'chooseDoll'; standing: Standing }
  | { type: 'setScene'; scene?: EquippedPart };

export const stageReducer = (stage: Stage, action: StageAction): Stage => {
  switch (action.type) {
    case 'dress':
      return withDressedDoll(stage, lookReducer(dressedDoll(stage), action.action));

    case 'chooseDoll':
      return nowDressing(stage, action.standing);

    case 'setScene':
      return withScene(stage, action.scene);
  }
};

import {
  useCallback,
  useRef,
  useState,
  type JSX,
  type PointerEvent as ReactPointerEvent,
} from 'react';

import { useTranslation } from '../i18n';
import type { EnvironmentId } from '../model/places';
import { DOLLS, type DollIndex } from '../model/world';
import { BODY, findPart } from '../parts/registry';
import { Scene, type Standing } from '../render/Scene';
import { useWorld } from '../state/worldContext';
import { dollTransform } from '../world/placement';
import { findEnvironment } from '../world/registry';
import { DollRail } from './DollRail';
import { PlaceRail } from './PlaceRail';
import { useDrag, type DragPoint } from './useDrag';
import styles from '../App.module.css';

type PlaceViewProps = {
  here: EnvironmentId;
};

/**
 * A room, with whoever is standing in it.
 *
 * Tapping a doll starts dressing her; dragging her off the room takes her away
 * again. The two are the same gesture the doll herself already has for her
 * clothes — tap to choose, drag off to remove — so there is one rule to learn
 * rather than two.
 *
 * The hit test is the browser's own, so it is per-pixel: she has to touch
 * painted artwork rather than a doll's bounding box. Two dolls standing close
 * together overlap at the edges, and a box would hand the finger the wrong one.
 *
 * Like the drag that undresses, this has no keyboard path. The rail beside it
 * does, and that is deliberately where both ways in live.
 */
export const PlaceView = ({ here }: PlaceViewProps): JSX.Element => {
  const { t } = useTranslation();
  const { world, dispatch } = useWorld();
  const stage = useRef<HTMLElement>(null);
  const canvas = useRef<HTMLDivElement>(null);
  const [grabbed, setGrabbed] = useState<DollIndex | null>(null);

  const environment = findEnvironment(here);
  const color = world.colors[here] ?? environment.defaultColor;

  const standing: Standing[] = DOLLS.flatMap((doll) => {
    const placement = world.placements[doll];

    return placement?.at === here
      ? [
          {
            doll,
            look: world.dolls[doll],
            transform: dollTransform(environment.floor, placement.x),
          },
        ]
      : [];
  });

  /**
   * SPEC section 13 asks for a generous drop target: the whole stage, not the
   * exact spot. A six-year-old aiming at a floorboard would miss every time.
   */
  const isInsideStage = useCallback(({ x, y }: DragPoint): boolean => {
    const box = stage.current?.getBoundingClientRect();

    return box !== undefined && x >= box.left && x <= box.right && y >= box.top && y <= box.bottom;
  }, []);

  const isOutsideStage = useCallback((point: DragPoint) => !isInsideStage(point), [isInsideStage]);

  /** Which doll a finger landed on, answered by the browser's own hit test. */
  const dollAt = useCallback((x: number, y: number): DollIndex | null => {
    const touched = document.elementFromPoint(x, y)?.closest('[data-doll]');
    const index = Number(touched?.getAttribute('data-doll'));

    return DOLLS.find((doll) => doll === index) ?? null;
  }, []);

  const { at, handlers } = useDrag({
    onDrop: () => {
      if (grabbed !== null) dispatch({ type: 'takeAway', doll: grabbed });
      setGrabbed(null);
    },
    /* No guard: `dressDoll` takes nobody as an answer, and releasing on nobody
       is exactly that. */
    onTap: () => {
      dispatch({ type: 'dressDoll', doll: grabbed });
      setGrabbed(null);
    },
    isInsideDropZone: isOutsideStage,
  });

  const onPointerDown = (event: ReactPointerEvent<HTMLElement>): void => {
    const doll = dollAt(event.clientX, event.clientY);

    if (doll === null) return;

    setGrabbed(doll);
    handlers.onPointerDown(event);
  };

  return (
    <>
      <section className={styles.stage} ref={stage}>
        <div
          className={styles.doll}
          ref={canvas}
          data-taking={at && grabbed !== null ? String(grabbed) : ''}
          {...handlers}
          onPointerDown={onPointerDown}
        >
          <Scene
            environment={environment}
            color={color}
            standing={standing}
            lookup={findPart}
            body={BODY}
            label={t('place.here')}
          />
        </div>
      </section>

      <DollRail
        here={here}
        stage={() => canvas.current?.getBoundingClientRect()}
        isInsideDropZone={isInsideStage}
      />
      <PlaceRail />
    </>
  );
};

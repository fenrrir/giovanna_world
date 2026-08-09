import type { JSX } from 'react';

import { useTranslation } from '../i18n';
import { cx } from '../lib/cx';
import type { Look } from '../model/types';
import { BODY, findPart } from '../parts/registry';
import { Doll } from '../render/Doll';
import { DollLayers } from '../render/DollLayers';
import { PLACE_FOCUS } from '../world/registry';
import { DragGhost } from './DragGhost';
import { useDrag, type DragPoint } from './useDrag';
import styles from './controls.module.css';

type PlacingDollProps = {
  look: Look;
  /** True while she is standing in the room on screen. */
  here: boolean;
  /** Tapped: put her here if she is not, dress her if she is. */
  onSelect: () => void;
  /** Dropped on the room: stand her exactly where the finger let go. */
  onPlace: (point: DragPoint) => void;
  isInsideDropZone: (point: DragPoint) => boolean;
};

/**
 * One doll in the rail: tap her, or carry her into the room.
 *
 * The same two gestures a piece of clothing has, and for the same reason — the
 * drag is the one a child reaches for (SPEC section 13), and the tap is what
 * works without it and from a keyboard.
 *
 * What differs is that the two do not do the same thing here. A tap stands her
 * at the next free spot; a drop stands her exactly where it landed. Where she
 * goes is the whole point of carrying her, so the drag has to mean more than
 * the tap rather than being a decoration over it.
 */
export const PlacingDoll = ({
  look,
  here,
  onSelect,
  onPlace,
  isInsideDropZone,
}: PlacingDollProps): JSX.Element => {
  const { t } = useTranslation();
  const { at, returning, handlers } = useDrag({
    onDrop: onPlace,
    onTap: onSelect,
    isInsideDropZone,
  });

  return (
    <>
      <button
        type="button"
        className={cx(styles.target, here && styles.selected, returning && styles.returning)}
        aria-label={t('doll.put')}
        aria-pressed={here}
        data-dragging={at ? 'true' : 'false'}
        {...handlers}
        onClick={(event) => {
          // A real pointer already chose on release; this is the keyboard path.
          if (event.detail === 0) onSelect();
        }}
      >
        <Doll
          className={styles.thumb}
          look={look}
          lookup={findPart}
          body={BODY}
          label={t('doll.put')}
        />
      </button>

      {at && (
        <DragGhost
          at={at}
          /* Her layers rather than a whole `Doll`: the ghost puts what it is
             given inside a canvas of its own, and a canvas inside a canvas
             draws nothing. */
          render={() => <DollLayers look={look} lookup={findPart} body={BODY} />}
          color=""
          focus={PLACE_FOCUS}
          label={t('doll.put')}
        />
      )}
    </>
  );
};

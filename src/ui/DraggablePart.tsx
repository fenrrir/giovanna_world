import type { JSX } from 'react';

import { useTranslation } from '../i18n';
import { cx } from '../lib/cx';
import { Thumb } from '../render/Thumb';
import { DragGhost } from './DragGhost';
import type { TrayDefinition, TrayItem } from './trays';
import { useDrag, type DragPoint } from './useDrag';
import styles from './controls.module.css';

type DraggablePartProps = {
  tray: TrayDefinition;
  item: TrayItem;
  color: string;
  worn: boolean;
  onChoose: () => void;
  isInsideDropZone: (point: DragPoint) => boolean;
};

/**
 * One piece in the tray. It can be tapped, or dragged onto the doll.
 *
 * Both gestures do the same thing; the drag exists because it is the one a
 * child reaches for (SPEC section 13). The piece is applied on release, so the
 * drag is a real gesture rather than a decoration over an already-done tap.
 */
export const DraggablePart = ({
  tray,
  item,
  color,
  worn,
  onChoose,
  isInsideDropZone,
}: DraggablePartProps): JSX.Element => {
  const { t } = useTranslation();
  const { at, returning, handlers } = useDrag({
    onDrop: onChoose,
    onTap: onChoose,
    isInsideDropZone,
  });

  const label = t('part.choose', { tray: t(tray.label) });

  return (
    <>
      <button
        type="button"
        className={cx(styles.target, worn && styles.selected, returning && styles.returning)}
        aria-label={label}
        aria-pressed={worn}
        data-dragging={at ? 'true' : 'false'}
        {...handlers}
        onClick={(event) => {
          // A real pointer already chose on release; this is the keyboard path.
          if (event.detail === 0) onChoose();
        }}
      >
        <Thumb
          className={styles.thumb}
          render={item.render}
          color={color}
          focus={tray.focus}
          label={t(tray.label)}
        />
      </button>

      {at && (
        <DragGhost
          at={at}
          render={item.render}
          color={color}
          focus={tray.focus}
          label={t(tray.label)}
        />
      )}
    </>
  );
};

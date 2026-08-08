import { useState, type JSX } from 'react';

import { VIEW_BOX_ATTR } from '../anchors';
import { useTranslation } from '../i18n';
import { PALETTES } from '../model/palettes';
import type { TraySlot } from '../model/slots';
import { BODY } from '../parts/registry';
import { TRAYS, trayById, trayItems, type TrayItem } from '../ui/trays';
import { AnchorOverlay } from './AnchorOverlay';
import styles from './Sheet.module.css';

/**
 * The contact sheet (SPEC section 11).
 *
 * Every part of a tray over the same body, side by side, at the same scale.
 * An anchor error — a sleeve that misses the shoulder, hair floating above the
 * skull, a hem cutting the knee — is invisible on one part and obvious here.
 */

type CellProps = { item: TrayItem; skin: string; color: string; anchors: boolean };

const Cell = ({ item, skin, color, anchors }: CellProps): JSX.Element => (
  <svg
    className={styles.cell}
    viewBox={VIEW_BOX_ATTR}
    preserveAspectRatio="xMidYMid meet"
    data-part={item.id}
  >
    {BODY.render(skin)}
    {item.render(color)}
    {anchors && <AnchorOverlay />}
  </svg>
);

export const Sheet = (): JSX.Element => {
  const { t } = useTranslation();
  const [trayId, setTrayId] = useState<TraySlot>('hair');
  const [skin, setSkin] = useState<string>(PALETTES.skin[0]);
  const [anchors, setAnchors] = useState(false);

  const tray = trayById(trayId);
  const items = trayItems(tray);
  const first = items[0];

  return (
    <div className={styles.sheet}>
      <h1>{t('dev.sheet.title')}</h1>

      <div className={styles.controls}>
        <label className={styles.control}>
          {t('dev.sheet.slot')}
          <select
            value={trayId}
            onChange={(event) => {
              setTrayId(event.target.value as TraySlot);
            }}
          >
            {TRAYS.map((candidate) => (
              <option key={candidate.id} value={candidate.id}>
                {t(candidate.label)}
              </option>
            ))}
          </select>
        </label>

        <label className={styles.control}>
          {t('dev.sheet.skinTone')}
          <select
            value={skin}
            onChange={(event) => {
              setSkin(event.target.value);
            }}
          >
            {PALETTES.skin.map((tone) => (
              <option key={tone} value={tone}>
                {tone}
              </option>
            ))}
          </select>
        </label>

        <label className={styles.control}>
          <input
            type="checkbox"
            checked={anchors}
            onChange={(event) => {
              setAnchors(event.target.checked);
            }}
          />
          {t('dev.sheet.showAnchors')}
        </label>
      </div>

      {first === undefined ? (
        <p className={styles.empty}>{t('dev.sheet.empty')}</p>
      ) : (
        <>
          <div className={styles.row} data-testid="parts-row">
            {items.map((item) => (
              <Cell
                key={item.id}
                item={item}
                skin={skin}
                color={PALETTES[tray.palette][0]}
                anchors={anchors}
              />
            ))}
          </div>

          <p className={styles.caption}>{t('dev.sheet.fabricRow')}</p>
          <div className={styles.row} data-testid="fabric-row">
            {PALETTES.fabric.map((color) => (
              <Cell key={color} item={first} skin={skin} color={color} anchors={anchors} />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

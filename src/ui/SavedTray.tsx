import { useState, type JSX } from 'react';

import { useTranslation } from '../i18n';
import { loadSavedLooks, lookSignature, saveSavedLooks, withSavedLook } from '../lib/storage';
import { sanitizeLook } from '../model/sanitize';
import type { Look } from '../model/types';
import { BODY, findPart } from '../parts/registry';
import { Doll } from '../render/Doll';
import { useLook } from '../state/lookContext';
import { ScrollRail } from './ScrollRail';
import { TapTarget } from './TapTarget';
import styles from './controls.module.css';

/** The star she presses to keep the doll in front of her. Drawn, never typed. */
const Star = (): JSX.Element => (
  <svg viewBox="0 0 24 24" className={styles.thumb} aria-hidden="true" focusable="false">
    <path
      d="M 12 3 L 14.6 9.2 L 21.2 9.7 L 16.2 14.1 L 17.7 20.6 L 12 17.1 L 6.3 20.6 L 7.8 14.1 L 2.8 9.7 L 9.4 10.2 Z"
      fill="currentColor"
    />
  </svg>
);

/**
 * A kept outfit, as the album should have stored it.
 *
 * `loadSavedLooks` knows nothing of the registry by design, so an entry kept by
 * an earlier version still carries whatever that version could wear — including
 * the backdrop, back when a place was something a doll wore. Nothing here has
 * to know that: a slot this version does not have is not a slot, and falls away
 * with every other piece that has left.
 */
const asOutfit = (look: Look): Look => sanitizeLook(look, findPart);

/**
 * The looks she chose to keep.
 *
 * A tray like any other, which is what let the album stay inside the game's one
 * level of navigation: it swaps into the same row the pieces use, so there is
 * no second surface and nothing to come back from (SPEC section 4).
 *
 * Its items are looks rather than pieces, so it does not go through
 * `TrayItem` — that type carries a colour and a slot, and a whole outfit has
 * neither. Forcing it through would have cost both of them their meaning.
 *
 * The star keeps the doll as she stands. It is not the save button SPEC
 * section 4 rules out: the current look is already saved, always. This is her
 * saying she wants to find this one again.
 */
export const SavedTray = (): JSX.Element => {
  const { t } = useTranslation();
  const { look, dispatch } = useLook();
  const [album, setAlbum] = useState<Look[]>(() => loadSavedLooks().map(asOutfit));

  const keep = (): void => {
    const next = withSavedLook(album, look);

    setAlbum(next);
    saveSavedLooks(next);
  };

  const worn = lookSignature(look);

  return (
    /* The same column the pieces stand in, minus the colours: there is nothing
       in a whole outfit for a single picker to paint. */
    <div className={styles.column}>
      <ScrollRail>
        <li>
          <TapTarget label={t('saved.keep')} selected={false} onSelect={keep}>
            <Star />
          </TapTarget>
        </li>

        {album.map((kept) => (
          <li key={lookSignature(kept)}>
            <TapTarget
              label={t('saved.wear')}
              selected={lookSignature(kept) === worn}
              onSelect={() => {
                /* Only ever an outfit now. Where she is standing belongs to the
                   world, so putting one back on cannot move her. */
                dispatch({ type: 'replaceLook', look: kept });
              }}
            >
              <Doll
                className={styles.thumb}
                look={kept}
                lookup={findPart}
                body={BODY}
                label={t('saved.wear')}
              />
            </TapTarget>
          </li>
        ))}
      </ScrollRail>
    </div>
  );
};

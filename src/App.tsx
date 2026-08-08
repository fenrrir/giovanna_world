import { useState, type JSX } from 'react';

import { useTranslation } from './i18n';
import type { TraySlot } from './model/slots';
import { BODY, findPart } from './parts/registry';
import { Doll } from './render/Doll';
import { useLook } from './state/lookContext';
import { ColorTray } from './ui/ColorTray';
import { PartTray } from './ui/PartTray';
import { SlotBar } from './ui/SlotBar';
import { trayById } from './ui/trays';
import styles from './App.module.css';

/**
 * The dress-up surface.
 *
 * Everything the child needs is on one screen: the doll, the four trays, the
 * pieces in the open tray and the colours. Opening a tray swaps the middle row
 * in place — no modal, no back button (SPEC section 4).
 */
export const App = (): JSX.Element => {
  const { t } = useTranslation();
  const { look } = useLook();
  const [active, setActive] = useState<TraySlot>('hair');
  const tray = trayById(active);

  return (
    <main className={styles.app}>
      <section className={styles.stage}>
        <Doll
          className={styles.doll}
          look={look}
          lookup={findPart}
          body={BODY}
          label={t('doll.label')}
        />
      </section>

      <section className={styles.panel}>
        <SlotBar active={active} onSelect={setActive} />
        <div className={styles.parts}>
          <PartTray tray={tray} />
        </div>
        <ColorTray tray={tray} />
      </section>
    </main>
  );
};

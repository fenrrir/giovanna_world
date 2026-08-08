import { useEffect, useState, type JSX } from 'react';

import { App } from './App';
import { Sheet } from './dev/Sheet';
import { I18nProvider } from './i18n';
import { LookProvider } from './state/LookProvider';

/** The hidden development route, kept off the child's path (SPEC section 11). */
export const DEV_SHEET_HASH = '#/dev/sheet';

/**
 * Hash routing rather than a router.
 *
 * GitHub Pages cannot rewrite paths, and the game itself has exactly one
 * level of navigation, so a routing library would be a dependency earning
 * nothing.
 */
const currentHash = (): string => globalThis.location.hash;

export const Root = (): JSX.Element => {
  const [hash, setHash] = useState(currentHash);

  useEffect(() => {
    const onHashChange = (): void => {
      setHash(currentHash());
    };

    globalThis.addEventListener('hashchange', onHashChange);

    return () => {
      globalThis.removeEventListener('hashchange', onHashChange);
    };
  }, []);

  return (
    <I18nProvider>
      <LookProvider>{hash.startsWith(DEV_SHEET_HASH) ? <Sheet /> : <App />}</LookProvider>
    </I18nProvider>
  );
};

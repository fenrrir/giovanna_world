import type { JSX } from 'react';

import styles from './App.module.css';

/**
 * The application shell. The dress-up surface is assembled here once the trays
 * and the doll renderer exist.
 */
export const App = (): JSX.Element => <main className={styles.app} />;

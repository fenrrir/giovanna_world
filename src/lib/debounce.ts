export type Debounced<Args extends unknown[]> = ((...args: Args) => void) & {
  /** Drops a pending call. */
  cancel: () => void;
  /** Runs a pending call now, instead of waiting out the delay. */
  flush: () => void;
};

/**
 * Collapses a burst of calls into one, `ms` after the last of them.
 *
 * Autosave uses this: the child dragging through a palette must not write to
 * localStorage on every colour (SPEC section 4). `flush` exists so a pending
 * write survives the component unmounting.
 */
export const debounce = <Args extends unknown[]>(
  fn: (...args: Args) => void,
  ms: number,
): Debounced<Args> => {
  let timer: ReturnType<typeof setTimeout> | undefined;
  let pending: Args | undefined;

  const cancel = (): void => {
    if (timer !== undefined) clearTimeout(timer);
    timer = undefined;
    pending = undefined;
  };

  // The timer fires this too, so the delayed path and the manual one cannot drift.
  const flush = (): void => {
    const args = pending;
    cancel();
    if (args) fn(...args);
  };

  const debounced = (...args: Args): void => {
    pending = args;

    if (timer !== undefined) clearTimeout(timer);

    timer = setTimeout(flush, ms);
  };

  debounced.cancel = cancel;
  debounced.flush = flush;

  return debounced;
};

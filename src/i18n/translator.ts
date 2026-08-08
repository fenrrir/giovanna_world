import type { MessageParams } from './types';

const PLACEHOLDER = /\{(\w+)\}/g;

/**
 * Looks a key up and substitutes `{placeholder}` values.
 *
 * An unknown key returns the key itself rather than throwing: a missing
 * translation must never become an error on a child's screen (SPEC section 4).
 * An unmatched placeholder is left in place, so the gap is visible in review
 * without breaking the render.
 */
export const translate = (
  catalogue: Record<string, string>,
  key: string,
  params?: MessageParams,
): string => {
  const message = catalogue[key] ?? key;

  if (!params) return message;

  return message.replace(PLACEHOLDER, (match, name: string) => {
    const value = params[name];

    return value === undefined ? match : String(value);
  });
};

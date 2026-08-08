/**
 * Joins class names, dropping the falsy ones.
 *
 * CSS module lookups are typed `string | undefined`, so composing them by hand
 * with template literals leaks "undefined" into the DOM. This keeps that from
 * ever happening.
 */
export const cx = (...parts: (string | false | undefined)[]): string =>
  parts.filter((part): part is string => Boolean(part)).join(' ');

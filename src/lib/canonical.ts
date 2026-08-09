const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

/**
 * JSON where the same content always comes out as the same text.
 *
 * Two identical outfits reach the album spelled differently: `sanitizeLook`
 * rebuilds `equipped` in iteration order and fills the painted slots in last,
 * while the reducer writes each piece in the order the child put it on. Plain
 * `JSON.stringify` calls those two different looks, so the album fills with
 * twins she cannot tell apart and none of them ever shows as the one she wears.
 *
 * A list keeps the order it was given: there, order is the content.
 */
export const canonicalJson = (value: unknown): string =>
  JSON.stringify(value, (_key, raw: unknown) =>
    isRecord(raw)
      ? Object.fromEntries(Object.entries(raw).sort(([a], [b]) => a.localeCompare(b)))
      : raw,
  );

/** Fold / shadow factor from the spec. */
export const FOLD = 0.78;

/** Highlight factor from the spec. */
export const HIGHLIGHT = 1.1;

const HEX = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

const clampChannel = (value: number): number => Math.min(255, Math.max(0, Math.round(value)));

const expand = (hex: string): string => hex.replace(/^#(\w)(\w)(\w)$/, '#$1$1$2$2$3$3');

/**
 * Derives a tone from a base colour by multiplying every channel by `factor`.
 *
 * A part receives one colour and derives every other tone through this helper,
 * so recolouring never breaks the artwork (SPEC section 9). Hardcoding a dark
 * variant of a recolourable colour is the bug this exists to prevent.
 */
export const shade = (hex: string, factor: number): string => {
  if (!HEX.test(hex)) {
    throw new Error(`Invalid hex colour: ${hex}`);
  }

  const full = expand(hex);
  const channels = [1, 3, 5].map((index) =>
    clampChannel(Number.parseInt(full.slice(index, index + 2), 16) * factor),
  );

  return `#${channels.map((channel) => channel.toString(16).padStart(2, '0')).join('')}`.toUpperCase();
};

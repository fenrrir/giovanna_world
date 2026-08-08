import type { Fringe } from './params';

/**
 * The opening the front layer leaves for the face.
 *
 * Every field arrives derived from an anchor, so a fringe builder never sees a
 * body coordinate and cannot hardcode one.
 */
export type FaceOpening = {
  cx: number;
  /** Half-width where the hair stops and the face begins. */
  wi: number;
  /** Top of the hair mass, and the height of the front layer below it. */
  crown: number;
  h: number;
  /** The eye line: the lowest a fringe is allowed to fall. */
  eyeY: number;
};

/** Where the fringe meets each temple, and the edge it draws between them. */
export type FringeEdge = { right: number; left: number; across: string };

const curve = (...points: number[]): string =>
  `C ${points.map((value) => String(Math.round(value))).join(' ')}`;

/**
 * The hairline when there is no fringe at all.
 *
 * One arc, bulging towards the crown. Drawing it as two sweeps converging on
 * the centre gives a widow's peak whatever the curvature (CLAUDE.md), and the
 * temples still have to be covered — "no fringe" means a bare forehead, not a
 * bare head.
 */
const bare = ({ cx, wi, crown, h }: FaceOpening): FringeEdge => {
  const y = crown + Math.round(h * 0.26);
  const lift = Math.round(h * 0.09);

  return {
    right: y,
    left: y,
    across: curve(cx + wi * 0.55, y - lift, cx - wi * 0.55, y - lift, cx - wi, y),
  };
};

/** A blunt fringe, level across the forehead with the faintest downward bow. */
const straight = ({ cx, wi, eyeY }: FaceOpening): FringeEdge => {
  const y = eyeY - 12;

  return {
    right: y,
    left: y,
    across: curve(cx + wi * 0.5, y + 5, cx - wi * 0.5, y + 5, cx - wi, y),
  };
};

/** Swept to one side: low over one brow, high at the opposite temple. */
const side = ({ cx, wi, crown, h, eyeY }: FaceOpening): FringeEdge => {
  const low = eyeY - 4;
  const high = crown + Math.round(h * 0.2);

  return {
    right: low,
    left: high,
    across: curve(cx + wi * 0.3, low + 8, cx - wi * 0.15, high + h * 0.22, cx - wi, high),
  };
};

/**
 * A centre parting: low at both temples, rising to a rounded apex.
 *
 * The two cubics meet with horizontal tangents, which is what keeps the parting
 * a curve rather than a point.
 */
const curtain = ({ cx, wi, crown, h, eyeY }: FaceOpening): FringeEdge => {
  const low = eyeY - 18;
  const apex = crown + Math.round(h * 0.13);
  const pull = Math.round(h * 0.22);

  return {
    right: low,
    left: low,
    across: [
      curve(cx + wi * 0.6, low - pull, cx + wi * 0.32, apex, cx, apex),
      curve(cx - wi * 0.32, apex, cx - wi * 0.6, low - pull, cx - wi, low),
    ].join(' '),
  };
};

/** The inner edge of the front layer, traversed right temple to left. */
export const fringeEdge = (fringe: Fringe, opening: FaceOpening): FringeEdge => {
  switch (fringe) {
    case 'none':
      return bare(opening);
    case 'straight':
      return straight(opening);
    case 'side':
      return side(opening);
    case 'curtain':
      return curtain(opening);
  }
};

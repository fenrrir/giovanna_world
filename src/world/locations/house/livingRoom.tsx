import type { ReactNode } from 'react';

import { VIEW_BOX } from '../../../anchors';
import { FOLD, HIGHLIGHT, shade } from '../../../lib/color';
import { PALETTES, WORLD_COLORS } from '../../../model/palettes';
import type { Environment } from '../../registry';

/**
 * The sitting room: a sofa against the wall, a rug, a picture and a plant.
 *
 * The first room drawn *for* the world rather than inherited from the days when
 * a place was a backdrop, and it is the one that answers what those two showed:
 * at full size a doll fills a room and reads as a giant standing in it. She
 * stands here at 0.62, which leaves the sofa behind her looking like furniture
 * rather than a footstool, and leaves two of them room to stand apart.
 *
 * The floor is low and the wall tall for the same reason: her head has to have
 * somewhere to be.
 */

const { width: W, height: H } = VIEW_BOX;

/** Where the wall meets the floor. Well above her feet, so the room has depth. */
const SKIRTING = 372;
const SKIRTING_HEIGHT = 10;

/** Where her feet rest, and how tall she stands in this room. */
const FLOOR = { y: 470, scale: 0.62 };

const SOFA = { x: 340, seat: 366, width: 210, height: 78 };

/**
 * Both are placed around where she stands rather than by eye.
 *
 * Two dolls land at a quarter and three quarters of the floor, which at this
 * scale is x 137–269 and 411–543. The plant sits past the second of those and
 * the picture hangs above the top of her head, so the room reads as furnished
 * rather than as things growing out of her.
 */
const PICTURE = { x: 118, y: 116, width: 96, height: 84 };
const PLANT = { x: 612, base: 392 };

/** The sofa, drawn from its own centre so nothing in it can drift. */
const sofa = (): ReactNode => {
  const { x, seat, width, height } = SOFA;
  const half = width / 2;

  return (
    <g>
      {/* Back first, then the seat over it, so the seat reads as in front. */}
      <rect x={x - half} y={seat - height} width={width} height={height} fill={WORLD_COLORS.roof} />
      <rect
        x={x - half + 14}
        y={seat - height + 12}
        width={half - 22}
        height={height - 26}
        fill={WORLD_COLORS.wall}
        opacity={0.35}
      />
      <rect
        x={x + 8}
        y={seat - height + 12}
        width={half - 22}
        height={height - 26}
        fill={WORLD_COLORS.wall}
        opacity={0.35}
      />

      <rect x={x - half - 16} y={seat} width={width + 32} height={34} fill={WORLD_COLORS.roof} />
      <rect x={x - half - 16} y={seat - 26} width={22} height={60} fill={WORLD_COLORS.roof} />
      <rect x={x + half - 6} y={seat - 26} width={22} height={60} fill={WORLD_COLORS.roof} />

      <rect x={x - half - 6} y={seat + 34} width={12} height={16} fill={WORLD_COLORS.wood} />
      <rect x={x + half - 6} y={seat + 34} width={12} height={16} fill={WORLD_COLORS.wood} />
    </g>
  );
};

const picture = (): ReactNode => (
  <g>
    <rect
      x={PICTURE.x}
      y={PICTURE.y}
      width={PICTURE.width}
      height={PICTURE.height}
      fill={WORLD_COLORS.wood}
    />
    <rect
      x={PICTURE.x + 10}
      y={PICTURE.y + 10}
      width={PICTURE.width - 20}
      height={PICTURE.height - 20}
      fill={WORLD_COLORS.pane}
    />
  </g>
);

/** A houseplant, the same green the trees outside are. A room is not a garden. */
const plant = (): ReactNode => (
  <g>
    <rect x={PLANT.x - 7} y={PLANT.base - 88} width={14} height={88} fill={WORLD_COLORS.wood} />
    <circle cx={PLANT.x} cy={PLANT.base - 104} r={28} fill={WORLD_COLORS.leaf} />
    <circle cx={PLANT.x - 30} cy={PLANT.base - 84} r={21} fill={WORLD_COLORS.leaf} />
    <circle cx={PLANT.x + 30} cy={PLANT.base - 80} r={19} fill={WORLD_COLORS.leaf} />
    <rect x={PLANT.x - 26} y={PLANT.base} width={52} height={40} fill={WORLD_COLORS.roof} />
  </g>
);

const render = (color: string): ReactNode => {
  const floor = shade(color, FOLD);
  const light = shade(color, HIGHLIGHT);

  return (
    <g>
      <rect x={0} y={0} width={W} height={H} fill={color} />

      {picture()}

      <rect x={0} y={SKIRTING} width={W} height={H - SKIRTING} fill={floor} />
      <rect x={0} y={SKIRTING} width={W} height={SKIRTING_HEIGHT} fill={light} />

      {/* The rug is under where she stands, which is what ties her to the floor
          rather than leaving her hovering over a flat colour. */}
      <ellipse cx={W / 2} cy={FLOOR.y} rx={244} ry={44} fill={light} />

      {sofa()}
      {plant()}
    </g>
  );
};

export const LIVING_ROOM: Environment = {
  id: 'house.livingRoom',
  floor: FLOOR,
  defaultColor: PALETTES.fabric[3],
  render,
};

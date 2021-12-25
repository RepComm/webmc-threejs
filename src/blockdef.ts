


export enum BlockType {
  AIR,
  STONE,
  DIRT,
  GRASS,

  UNKNOWN
}

/**Block.data0*/
export enum BlockShape {
  BLOCK,
  STAIR,
  SLAB,
  RAMP,
}
/**Block.data1*/
export type BlockVariant = number;

export enum VariantBlockFacing {
  NORTH,
  SOUTH,
  EAST,
  WEST
}
export enum ModifierBlockFacing {
  UPRIGHT,
  SIDEWAYS,
  UPSIDEDOWN
}

export enum VariantSlabPlacement {
  TOP,
  MIDDLE,
  BOTTOM
}
export enum ModifierSlabPlacement {
  UPRIGHT,
  NORTHSOUTH,
  EASTWEST
}

export const BlockTextureSlot = {
  UP: 0, MAIN: 0,
  SIDE: 1, NORTH: 1,
  SOUTH: 2,
  EAST: 3,
  WEST: 4,
  DOWN: 5,
}


import { Chunk } from "./chunk";
import { MeshBuilder } from "./meshbuilder";
import { addXYZ, copyXYZ, createXYZ, setXYZ, XYZ } from "./utils";
import { World } from "./world";

export interface CubeSidesShown {
  north: boolean;
  south: boolean;
  east: boolean;
  west: boolean;
  up: boolean;
  down: boolean;
}

export class BlockPosition {
  /**Index of the chunk this block is from*/
  chunkIndex: XYZ;
  /**Offset in the chunk of this block*/
  chunkspace: XYZ;
  /**Offset in the world of this block*/
  worldspace: XYZ;
  /**Offset in Block.BYTELENGTHs this block is found in it's chunk
   * 
   * To get byte offset in chunk binary, multiply by Block.BYTELENGTH
   */
  blockIndex: number;

  constructor() {
    this.chunkIndex = createXYZ();
    this.chunkspace = createXYZ();
    this.worldspace = createXYZ();
    this.blockIndex = 0;
  }
  setFromChunkPositionOOP(chunk: Chunk, position: XYZ, calcIndex: boolean = true) {
    setXYZ(this.chunkIndex, chunk.chunkIndexX, chunk.chunkIndexY, chunk.chunkIndexZ);

    copyXYZ(position, this.chunkspace);

    if (calcIndex) this.blockIndex = Chunk.positionToIndexOOP(this.chunkspace);

    //copy chunk's offset in the world
    copyXYZ(chunk.position, this.worldspace);

    //add the block offset in chunk space
    addXYZ(position, this.worldspace);
  }
  setFromChunkPosition(chunk: Chunk, x: number, y: number, z: number, calcIndex: boolean = true) {
    setXYZ(this.chunkIndex, chunk.chunkIndexX, chunk.chunkIndexY, chunk.chunkIndexZ);

    setXYZ(this.chunkspace, x, y, z);

    if (calcIndex) this.blockIndex = Chunk.positionToIndex(x, y, z);

    //copy chunk's offset in the world
    copyXYZ(chunk.position, this.worldspace);

    //add the block offset in chunk space
    this.worldspace.x += x;
    this.worldspace.y += y;
    this.worldspace.z += z;
  }
  setFromWorldPositionOOP(world: World, position: XYZ, calcIndex: boolean = true) {

    setXYZ(
      this.chunkIndex,
      Math.floor(position.x / Chunk.WIDTH),
      Math.floor(position.y / Chunk.HEIGHT),
      Math.floor(position.z / Chunk.DEPTH),
    );

    copyXYZ(position, this.worldspace);

    setXYZ(
      this.chunkspace,
      position.x % Chunk.WIDTH,
      position.y % Chunk.HEIGHT,
      position.z % Chunk.DEPTH
    );

    if (calcIndex) this.blockIndex = Chunk.positionToIndexOOP(this.chunkspace);
  }
  setFromWorldPosition(world: World, x: number, y: number, z: number, calcIndex: boolean = true) {
    setXYZ(
      this.chunkIndex,
      Math.floor(x / Chunk.WIDTH),
      Math.floor(y / Chunk.HEIGHT),
      Math.floor(z / Chunk.DEPTH),
    );

    setXYZ(this.worldspace, x, y, z);

    setXYZ(
      this.chunkspace,
      x % Chunk.WIDTH,
      y % Chunk.HEIGHT,
      z % Chunk.DEPTH
    );

    if (calcIndex) this.blockIndex = Chunk.positionToIndexOOP(this.chunkspace);
  }
}

export enum BlockType {
  AIR,
  STONE,
  DIRT,
  GRASS,

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
  TOP: 0, MAIN: 0,
  SIDE: 1, NORTH: 1,
  SOUTH: 2,
  EAST: 3,
  WEST: 4,
  DOWN: 5,
}

export class Block {
  static BYTELENGTH: number;

  type: BlockType;
  data0: BlockShape;
  data1: BlockVariant;

  chunk: Chunk;
  world: World;

  position: BlockPosition;

  sides: CubeSidesShown;

  renderCubeSize: XYZ;
  renderCubePos: XYZ;

  constructor() {
    this.position = new BlockPosition();
    this.type = BlockType.AIR;
    this.data0 = BlockShape.BLOCK;
    this.data1 = 0;
    this.chunk = null;
    this.world = null;
    this.sides = {
      north: true,
      south: true,
      east: true,
      west: true,
      up: true,
      down: true
    };
    this.renderCubeSize = createXYZ();
    this.renderCubePos = createXYZ();
  }
  get shape(): BlockShape {
    return this.data0;
  }
  set shape(s: BlockShape) {
    this.data0 = s;
  }
  get variant(): BlockVariant {
    return this.data1;
  }
  set variant(v: BlockVariant) {
    this.data1 = v;
  }
  /**Reads from current dataIndex
   * 
   * @param chunk 
   */
  readFromChunk(chunk: Chunk) {
    this.readFromData(chunk.view);
  }
  /**Reads from current dataIndex
   * @param view 
   */
  readFromData(view: DataView) {
    let idx = this.position.blockIndex * Block.BYTELENGTH;
    this.type = view.getUint8(idx);

    idx++;
    this.data0 = view.getUint8(idx);

    idx++;
    this.data1 = view.getUint8(idx);
  }
  writeToChunk(chunk: Chunk) {
    this.writeToData(chunk.view);
  }
  writeToData(view: DataView) {
    let idx = this.position.blockIndex * Block.BYTELENGTH;
    view.setUint8(idx, this.type);

    idx++;
    view.setUint8(idx, this.data0);

    idx++;
    view.setUint8(idx, this.data1);
  }
  isTransparent(): boolean {
    switch (this.type) {
      case BlockType.AIR:
        return true;
      default:
        break;
    }
    switch (this.shape) {
      case BlockShape.BLOCK:
        return this.variant !== 255;
      case BlockShape.SLAB:
      case BlockShape.STAIR:
        return true;
      default:
        break;
    }
    return false;
  }
  render(meshBuilder: MeshBuilder) {
    // console.log(this, this.position.chunkspace);

    if (this.type === BlockType.AIR) return;

    //TODO - set texture from type
    // console.log("Shape", this.shape);
    //subtype
    switch (this.shape) {
      case BlockShape.BLOCK:
        setXYZ(this.renderCubeSize, 0.5, (this.variant / 512), 0.5);

        meshBuilder.cubeOOP(
          this.position.chunkspace, this.renderCubeSize, this.sides, false
        );
        break;
      case BlockShape.STAIR:
        switch (this.variant) {
          case 0:
            break;
        }
        //top
        setXYZ(this.renderCubeSize, 0.5, 0.5, 0.25);
        meshBuilder.cubeOOP(this.position.chunkspace, this.renderCubeSize, this.sides, false);

        //bottom
        copyXYZ(this.position.chunkspace, this.renderCubePos);
        this.renderCubePos.z += 0.5;

        setXYZ(this.renderCubeSize, 0.5, 0.25, 0.25);
        meshBuilder.cubeOOP(this.renderCubePos, this.renderCubeSize, this.sides, false);

        break;
      case BlockShape.SLAB:
        setXYZ(this.renderCubeSize, 0.5, 0.25, 0.5);
        meshBuilder.cubeOOP(this.position.chunkspace, this.renderCubeSize, this.sides, false);

        break;
      case BlockShape.RAMP:

        break;
    }

  }
}
Block.BYTELENGTH = 3; //[0] type [1] extra1 [2] extra2

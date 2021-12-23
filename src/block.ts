
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
  chunk: XYZ;
  world: XYZ;
  dataIndex: number;

  constructor () {
    this.chunk = createXYZ();
    this.world = createXYZ();
    this.dataIndex = 0;
  }
  setFromChunkPositionOOP (chunk: Chunk, position: XYZ, calcIndex: boolean = true) {
    copyXYZ( position, this.chunk );

    if (calcIndex) this.dataIndex = Chunk.positionToIndexOOP (this.chunk);

    //copy chunk's offset in the world
    copyXYZ( chunk.position, this.world );

    //add the block offset in chunk space
    addXYZ ( position, this.world );
  }
  setFromChunkPosition (chunk: Chunk, x: number, y: number, z: number, calcIndex: boolean = true) {
    setXYZ(this.chunk, x, y, z);

    if (calcIndex) this.dataIndex = Chunk.positionToIndex(x, y, z);

    //copy chunk's offset in the world
    copyXYZ( chunk.position, this.world );

    //add the block offset in chunk space
    this.world.x += x;
    this.world.y += y;
    this.world.z += z;
  }
  setFromWorldPositionOOP (world: World, position: XYZ, calcIndex: boolean = true) {
    copyXYZ( position, this.world );

    setXYZ(
      this.chunk,
      position.x % Chunk.WIDTH,
      position.y % Chunk.HEIGHT,
      position.z % Chunk.DEPTH
    );

    if (calcIndex) this.dataIndex = Chunk.positionToIndexOOP(this.chunk);
  }
  setFromWorldPosition (world: World, x: number, y: number, z: number, calcIndex: boolean = true) {
    setXYZ( this.world, x, y, z );

    setXYZ(
      this.chunk,
      x % Chunk.WIDTH,
      y % Chunk.HEIGHT,
      z % Chunk.DEPTH
    );

    if (calcIndex) this.dataIndex = Chunk.positionToIndexOOP(this.chunk);
  }
}

export class Block {
  static BYTELENGTH: number;

  type: number;
  data0: number;
  data1: number;

  chunk: Chunk;
  world: World;

  position: BlockPosition;

  sides: CubeSidesShown;

  constructor() {
    this.position = new BlockPosition();
    this.type = 0;
    this.data0 = 0;
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
    let idx = this.position.dataIndex * Block.BYTELENGTH;
    this.type = view.getUint8(idx);

    idx++;
    this.data0 = view.getUint8(idx);

    idx++;
    this.data0 = view.getUint8(idx);
  }
  writeToChunk(chunk: Chunk) {
    this.writeToData(chunk.view);
  }
  writeToData(view: DataView) {
    let idx = this.position.dataIndex * Block.BYTELENGTH;
    view.setUint8(idx, this.type);

    idx++;
    view.setUint8(idx, this.data0);

    idx++;
    view.setUint8(idx, this.data1);
  }
  isTransparent(): boolean {
    return this.type === 0; //TODO - add other checks for transparency here
  }
  render(meshBuilder: MeshBuilder) {
    meshBuilder.cubeOOP(
      this.position.chunk, 0.5, this.sides
    );
  }
}
Block.BYTELENGTH = 2; //[0] type [1] extra1 [2] extra2

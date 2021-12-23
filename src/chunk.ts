
import { BufferGeometry, Material, Mesh, MeshNormalMaterial, Object3D, Vector3 } from "three";
import { Block } from "./block";
import { MeshBuilder } from "./meshbuilder";
import { XYZ, copyXYZ, addXYZ, floorXYZ, createXYZ, setXYZ } from "./utils";

export interface MeshDisplay {
  geometry: BufferGeometry;
  material: Material;
  mesh: Mesh;
}

export interface MultiMeshDisplay {
  [key: string]: MeshDisplay;
}

export class Chunk extends Object3D {
  static WIDTH: number;
  static HEIGHT: number;
  static DEPTH: number;
  static BLOCKCOUNT: number;

  static BYTELENGTH: number;

  static positionToIndexOOP(position: XYZ): number {
    // x + y*WIDTH + Z*WIDTH*DEPTH
    return (
      Math.floor(position.x) +
      Math.floor(position.y) * Chunk.WIDTH +
      Math.floor(position.z) * Chunk.WIDTH * Chunk.DEPTH
    );
  }
  static positionToIndex(x: number, y: number, z: number): number {
    return (
      Math.floor(x) +
      Math.floor(y) * Chunk.WIDTH +
      Math.floor(z) * Chunk.WIDTH * Chunk.DEPTH
    );
  }

  block: Block;
  blockPosition: XYZ;

  data: ArrayBuffer;
  view: DataView;

  meshBuilder: MeshBuilder;

  display: MultiMeshDisplay;

  constructor() {
    super();

    this.data = new ArrayBuffer(Chunk.BYTELENGTH);
    this.view = new DataView(this.data);

    this.block = new Block();
    this.blockPosition = createXYZ();

    this.meshBuilder = new MeshBuilder();

    this.display = {
      solid: {
        geometry: new BufferGeometry(),
        material: new MeshNormalMaterial(),
        mesh: new Mesh(this.display.solid.geometry, this.display.solid.material)
      },
      water: {
        geometry: new BufferGeometry(),
        material: new MeshNormalMaterial(),
        mesh: new Mesh(this.display.water.geometry, this.display.water.material)
      }
    }
    this.add(this.display.solid.mesh);
    this.add(this.display.water.mesh);
  }
  /**Populate block with data from the chunk
   * 
   * @param {XYZ} position when provided, the block is fetched from this as a chunk space coordinate
   * Otherwise, reads is performed from block.position.dataIndex
   * 
   */
  getBlockOOP(block: Block, position?: XYZ) {
    if (position) block.position.setFromChunkPositionOOP(this, position, true);
    block.readFromChunk(this);
  }
  getBlock(block: Block, x?: number, y?: number, z?: number) {
    if (x !== undefined) block.position.setFromChunkPosition(this, x, y, z, true);
    block.readFromChunk(this);
  }
  /**Writes to block.position.dataIndex
   * 
   * @param block 
   */
  setBlockOOP(block: Block, position?: XYZ) {
    if (position) block.position.setFromChunkPositionOOP(this, position);
    block.writeToChunk(this);
  }
  setBlock (block: Block, x?: number, y?: number, z?: number) {
    if (x !== undefined) block.position.setFromChunkPosition(this, x, y, z);
    block.writeToChunk(this);
  }
  render() {
    this.meshBuilder.clear();
    for (let ix = 0; ix < Chunk.WIDTH; ix++) {
      for (let iy = 0; iy < Chunk.HEIGHT; iy++) {
        for (let iz = 0; iz < Chunk.DEPTH; iz++) {
          setXYZ(this.blockPosition, ix, iy, iz);

          this.getBlockOOP(this.block, this.blockPosition);

          this.block.render(this.meshBuilder);
        }
      }
    }
    this.meshBuilder.build(this.display.solid.geometry);
  }
  sort() {

  }
  set chunkIndexX(x: number) {
    this.position.x = x * Chunk.WIDTH;
  }
  set chunkIndexY(y: number) {
    this.position.y = y * Chunk.HEIGHT;
  }
  set chunkIndexZ(z: number) {
    this.position.z = z * Chunk.DEPTH;
  }
  get chunkIndexX(): number {
    return Math.floor(this.position.x / Chunk.WIDTH);
  }
  get chunkIndexY(): number {
    return Math.floor(this.position.y / Chunk.HEIGHT);
  }
  get chunkIndexZ(): number {
    return Math.floor(this.position.z / Chunk.DEPTH);
  }
  generate() {
    for (let i = 0; i < Chunk.BLOCKCOUNT; i++) {

    }
  }
}

Chunk.WIDTH = 16;
Chunk.HEIGHT = 16;
Chunk.DEPTH = 16;

Chunk.BLOCKCOUNT = Chunk.WIDTH * Chunk.HEIGHT * Chunk.DEPTH;

Chunk.BYTELENGTH = Chunk.BLOCKCOUNT * Block.BYTELENGTH;

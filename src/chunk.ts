
import { BufferGeometry, Material, Mesh, MeshDepthMaterial, MeshDistanceMaterial, MeshNormalMaterial, MeshPhysicalMaterial, MeshStandardMaterial, MeshToonMaterial, Object3D, Vector3 } from "three";
import { Block } from "./block";
import { BlockShape, BlockType } from "./blockdef";
import { MeshBuilder } from "./meshbuilder";
import { XYZ, createXYZ, setXYZ } from "./utils";
import { World } from "./world";

export interface MeshDisplay {
  geometry: BufferGeometry;
  material: Material;
  mesh: Mesh;
}

export interface MultiMeshDisplay {
  [key: string]: MeshDisplay;
}

export function createMeshDisplay(
  geometry?: BufferGeometry,
  material?: Material,
  mesh?: Mesh
  ): MeshDisplay {
  if (!geometry) geometry = new BufferGeometry();
  if (!material) material = new MeshStandardMaterial();
  if (!mesh) mesh = new Mesh(geometry, material);

  return {
    geometry,
    material,
    mesh
  };
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
  static isPositionBounded(x: number, y: number, z: number): boolean {
    return (
      x > -1 && x < Chunk.WIDTH &&
      y > -1 && y < Chunk.HEIGHT &&
      z > -1 && z < Chunk.DEPTH
    );
  }
  static isPositionBoundedOOP(xyz: XYZ): boolean {
    return Chunk.isPositionBounded(xyz.x, xyz.y, xyz.z);
  }

  world: World;

  block: Block;
  blockPosition: XYZ;
  neighborBlock: Block;
  neighborBlockPosition: XYZ;

  data: ArrayBuffer;
  view: DataView;

  meshBuilder: MeshBuilder;

  display: MultiMeshDisplay;

  needsRender: boolean;

  constructor(world: World) {
    super();
    this.setWorld(world);

    this.data = new ArrayBuffer(Chunk.BYTELENGTH);
    this.view = new DataView(this.data);

    this.block = new Block();
    this.blockPosition = createXYZ();

    this.neighborBlock = new Block();
    this.neighborBlockPosition = createXYZ();

    this.meshBuilder = new MeshBuilder();

    console.log(this.world.chunkMaterial);

    this.display = {
      solid: createMeshDisplay(undefined, this.world.chunkMaterial, undefined),
      water: createMeshDisplay(undefined, this.world.chunkMaterial, undefined)
    }
    this.add(this.display.solid.mesh);
    this.add(this.display.water.mesh);

    this.needsRender = false;
  }
  setWorld (w: World): this {
    this.world = w;
    return this;
  }
  /**Populate block with data from the chunk
   * 
   * @param {XYZ} position when provided, the block is fetched from this as a chunk space coordinate
   * Otherwise, reads is performed from block.position.dataIndex
   * 
   */
  getBlockOOP(block: Block, position?: XYZ, checkNeighbors: boolean = true) {
    if (position) block.position.setFromChunkPositionOOP(this, position, true);
    block.readFromChunk(this);
    if (checkNeighbors) this.calcBlockNeighborData(block, position.x, position.y, position.z);
  }
  calcBlockNeighborData(block: Block, x: number, y: number, z: number) {
    /**
     * +Y = UP
     * -Y = DOWN
     * +Z = NORTH
     * -Z = SOUTH
     * +X = EAST
     * -X = WEST
     */
    if (Chunk.isPositionBounded(x, y + 1, z)) {
      this.getBlock(this.neighborBlock, x, y + 1, z, false);
      block.sides.up = this.neighborBlock.isTransparent();
    }

    if (Chunk.isPositionBounded(x, y - 1, z)) {
      this.getBlock(this.neighborBlock, x, y - 1, z, false);
      block.sides.down = this.neighborBlock.isTransparent();
    }

    if (Chunk.isPositionBounded(x, y, z + 1)) {
      this.getBlock(this.neighborBlock, x, y, z + 1, false);
      block.sides.north = this.neighborBlock.isTransparent();
    }

    if (Chunk.isPositionBounded(x, y, z - 1)) {
      this.getBlock(this.neighborBlock, x, y, z - 1, false);
      block.sides.south = this.neighborBlock.isTransparent();
    }

    if (Chunk.isPositionBounded(x + 1, y, z)) {
      this.getBlock(this.neighborBlock, x + 1, y, z, false);
      block.sides.east = this.neighborBlock.isTransparent();
    }

    if (Chunk.isPositionBounded(x - 1, y, z)) {
      this.getBlock(this.neighborBlock, x - 1, y, z, false);
      block.sides.west = this.neighborBlock.isTransparent();
    }
  }
  getBlock(block: Block, x?: number, y?: number, z?: number, checkNeighbors: boolean = true) {
    if (x !== undefined) block.position.setFromChunkPosition(this, x, y, z, true);
    block.readFromChunk(this);
    if (checkNeighbors) this.calcBlockNeighborData(block, x, y, z);
  }
  /**Writes to block.position.dataIndex
   * 
   * @param block 
   */
  setBlockOOP(block: Block, position?: XYZ) {
    if (position) block.position.setFromChunkPositionOOP(this, position);
    block.writeToChunk(this);
    this.needsRender = true;
  }
  setBlock(block: Block, x?: number, y?: number, z?: number) {
    if (x !== undefined) block.position.setFromChunkPosition(this, x, y, z);
    block.writeToChunk(this);
    this.needsRender = true;
  }
  tryRender() {
    if (this.needsRender) {
      this.render();
      this.needsRender = false;
    }
  }
  render() {
    // console.log("rendering chunk from data", this);
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
    // console.log(this.display.solid.geometry.attributes.position);
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
    let b = new Block();
    for (let i = 0; i < Chunk.BLOCKCOUNT; i++) {
      b.position.blockIndex = i;
      b.type = Math.floor(Math.random() * 3);

      b.shape = Math.floor(Math.random() * 3);
      b.variant = 255;
      // b.variant = Math.floor(Math.random() * 255);

      // console.log("set block", b.type);
      this.setBlock(b);
    }
  }
}

Chunk.WIDTH = 8;
Chunk.HEIGHT = 8;
Chunk.DEPTH = 8;

Chunk.BLOCKCOUNT = Chunk.WIDTH * Chunk.HEIGHT * Chunk.DEPTH;

Chunk.BYTELENGTH = Chunk.BLOCKCOUNT * Block.BYTELENGTH;


import { Object3D } from "three";
import { AltasBuilder, Atlas } from "./atlas";
import { Block, BlockTextureSlot, BlockType, VariantBlockFacing } from "./block";
import { Chunk } from "./chunk";
import { logXYZ, XYZ } from "./utils";

export class World extends Object3D {
  atlas: Atlas;

  chunkPool: Array<Chunk>;
  renderedChunks: Array<Chunk>;

  cachedGetSetBlockChunk: Chunk;

  constructor() {
    super();
    this.renderedChunks = new Array();
    this.chunkPool = new Array();
    this.init();
  }
  async init() {
    let atlasBuilder = new AltasBuilder();
    atlasBuilder.init({
      faceSize: { x: 16, y: 16 },
      width: 256,
      height: 256
    });
    await atlasBuilder.loadTexture(
      "./textures/block-stone.png",
      0, 0//BlockTextureSlot.MAIN
    );

    await atlasBuilder.loadTexture(
      "./textures/block-grass-top.png",
      3, 0
    );
    await atlasBuilder.loadTexture(
      "./textures/block-grass-side.png",
      3, 1
    );

    this.atlas = atlasBuilder.build();
    console.log("Loaded atlas", this.atlas);
  }
  sortRenderedChunks() {

  }
  getLoadedChunk(chunkX: number, chunkY: number, chunkZ: number): Chunk {
    for (let chunk of this.renderedChunks) {
      if (chunk.position.x === chunkX && chunk.position.y === chunkY && chunk.position.z === chunkZ) {
        return chunk;
      }
    }
    return null;
  }
  getLoadedChunkOOP(index: XYZ): Chunk {
    return this.getLoadedChunk(index.x, index.y, index.z);
  }
  getUnusedChunk(): Chunk {
    if (this.chunkPool.length > 0) {
      return this.chunkPool.pop();
    } else {
      return new Chunk();
    }
  }
  loadChunkIndex(chunkX: number, chunkY: number, chunkZ: number) {
    let c = this.getUnusedChunk();
    c.chunkIndexX = chunkX;
    c.chunkIndexY = chunkY;
    c.chunkIndexZ = chunkZ;
    c.needsRender = true;
    c.generate();
    this.renderedChunks.push(c);
    this.add(c);
  }
  isChunkIndexCached(index: XYZ): boolean {
    return (
      this.cachedGetSetBlockChunk &&
      this.cachedGetSetBlockChunk.chunkIndexX === index.x,
      this.cachedGetSetBlockChunk.chunkIndexY === index.y,
      this.cachedGetSetBlockChunk.chunkIndexZ === index.z
    );
  }
  setBlockOOP(block: Block, position?: XYZ) {
    if (position !== undefined) block.position.setFromWorldPositionOOP(this, position);
    let c: Chunk;
    if (!this.isChunkIndexCached(block.position.chunkIndex)) {
      c = this.cachedGetSetBlockChunk;
    } else {
      c = this.getLoadedChunkOOP(block.position.chunkIndex);
      if (c) this.cachedGetSetBlockChunk = c;
    }
    if (!c) throw `chunk index ${logXYZ(block.position.chunkIndex)} not loaded, cannot set block`;
    block.writeToChunk(c);
  }
  setBlock(block: Block, x?: number, y?: number, z?: number) {
    if (x !== undefined) block.position.setFromWorldPosition(this, x, y, z, true);
    let c: Chunk;
    if (!this.isChunkIndexCached(block.position.chunkIndex)) {
      c = this.cachedGetSetBlockChunk;
    } else {
      c = this.getLoadedChunkOOP(block.position.chunkIndex);
      if (c) this.cachedGetSetBlockChunk = c;
    }
    if (!c) throw `chunk index ${logXYZ(block.position.chunkIndex)} not loaded, cannot set block`;
    block.writeToChunk(c);
  }
}

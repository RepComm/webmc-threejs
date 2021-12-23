import { Object3D } from "three";
import { Block } from "./block";
import { Chunk } from "./chunk";
import { logXYZ, XYZ } from "./utils";

export class World extends Object3D {
  chunkPool: Array<Chunk>;
  renderedChunks: Array<Chunk>;

  cachedGetSetBlockChunk: Chunk;

  constructor () {
    super();
    this.renderedChunks = new Array();
    this.chunkPool = new Array();
  }
  sortRenderedChunks () {
    
  }
  getLoadedChunk (chunkX: number, chunkY: number, chunkZ: number): Chunk {
    for (let chunk of this.renderedChunks) {
      if (chunk.position.x === chunkX && chunk.position.y === chunkY && chunk.position.z === chunkZ) {
        return chunk;
      }
    }
    return null;
  }
  getLoadedChunkOOP (index: XYZ): Chunk {
    return this.getLoadedChunk(index.x, index.y, index.z);
  }
  getUnusedChunk (): Chunk {
    if (this.chunkPool.length > 0) {
      return this.chunkPool.pop();
    } else {
      return new Chunk();
    }
  }
  loadChunkIndex (chunkX: number, chunkY: number, chunkZ: number) {
    let c = this.getUnusedChunk();
    c.chunkIndexX = chunkX;
    c.chunkIndexY = chunkY;
    c.chunkIndexZ = chunkZ;
    c.needsRender = true;
    c.generate();
    this.renderedChunks.push(c);
    this.add(c);
  }
  isChunkIndexCached (index: XYZ): boolean {
    return (
      this.cachedGetSetBlockChunk &&
      this.cachedGetSetBlockChunk.chunkIndexX === index.x,
      this.cachedGetSetBlockChunk.chunkIndexY === index.y,
      this.cachedGetSetBlockChunk.chunkIndexZ === index.z
    );
  }
  setBlockOOP (block: Block, position?: XYZ) {
    if (position !== undefined) block.position.setFromWorldPositionOOP(this, position);
    let c: Chunk;
    if (!this.isChunkIndexCached(block.position.chunkIndex)) {
      c = this.cachedGetSetBlockChunk;
    } else {
      c = this.getLoadedChunkOOP (block.position.chunkIndex);
      if (c) this.cachedGetSetBlockChunk = c;
    }
    if (!c) throw `chunk index ${logXYZ(block.position.chunkIndex)} not loaded, cannot set block`;
    block.writeToChunk(c);
  }
  setBlock (block: Block, x?: number, y?: number, z?: number) {
    if (x !== undefined) block.position.setFromWorldPosition(this, x, y, z, true);
    let c: Chunk;
    if (!this.isChunkIndexCached(block.position.chunkIndex)) {
      c = this.cachedGetSetBlockChunk;
    } else {
      c = this.getLoadedChunkOOP (block.position.chunkIndex);
      if (c) this.cachedGetSetBlockChunk = c;
    }
    if (!c) throw `chunk index ${logXYZ(block.position.chunkIndex)} not loaded, cannot set block`;
    block.writeToChunk(c);
  }
}

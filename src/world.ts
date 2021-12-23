import { Block } from "./block";
import { Chunk } from "./chunk";
import { XYZ } from "./utils";

export class World {
  chunkPool: Array<Chunk>;
  renderedChunks: Array<Chunk>;

  constructor () {
    this.renderedChunks = new Array();
    this.chunkPool = new Array();
  }
  sortRenderedChunks () {
    
  }
  getLoadedChunk (chunkX: number, chunkY: number, chunkZ: number) {
    for (let chunk of this.renderedChunks) {
      if (chunk.position.x === chunkX && chunk.position.y === chunkY && chunk.position.z === chunkZ) {
        return chunk;
      }
    }
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
  }
  setBlockOOP (block: Block, position?: XYZ) {
    if (position !== undefined) block.position.setFromWorldPositionOOP(this, position);
    
  }
  setBlock (block: Block, x?: number, y?: number, z?: number) {
    if (x !== undefined) block.position.setFromWorldPosition(this, x, y, z, true);

  }
}

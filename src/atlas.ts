
import { BlockType, VariantBlockFacing } from "./block";
import { CanvasTexture, NearestFilter, RepeatWrapping, Texture, UVMapping } from "three";
import { XY } from "./utils";

/**UV Quad from the texture atlas
 * All coordinates are in normalized 0..1 space
 */
export interface UVQuad extends XY {
  w: number;
  h: number;
  /**Only used while generating the atlas, internal use only*/
  src?: CanvasImageSource;
}

export type BlockUVs = {
  [key in VariantBlockFacing]?: UVQuad;
};

export interface Atlas {
  texture: Texture;
  type: {
    [key in BlockType]?: BlockUVs;
  };
  faceSize: XY;
}

export type BlockTextureSlot = number;

export interface AtlasConfig {
  faceSize: XY;
  width: number;
  height: number;
}

export class AltasBuilder {
  atlas: Atlas;
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  config: AtlasConfig;
  usedWidth: number;
  usedHeight: number;

  constructor() {
    this.canvas = document.createElement("canvas");
    this.ctx = this.canvas.getContext("2d");
    this.usedHeight = 0;
    this.usedWidth = 0;
  }
  init(config: AtlasConfig) {
    this.config = config;
    this.clear();
  }
  uToX(u: number): number {
    return u * this.config.width;
  }
  vToY(v: number): number {
    return v * this.config.height;
  }
  xToU(x: number): number {
    return x / this.config.width;
  }
  yToV(y: number): number {
    return y / this.config.height;
  }
  addTexture(texture: CanvasImageSource, type: BlockType, slotid: BlockTextureSlot = 0) {
    let uv = this.atlas.type[type];
    if (!uv) uv = this.atlas.type[type] = {};

    if (this.usedWidth >= this.config.width) {
      this.usedWidth = 0;
      this.usedHeight += this.config.faceSize.y;
    }

    if (this.usedHeight >= this.config.height) throw `No more room on atlas, consider using a larger atlas, or smaller faceSize`;
    
    let slot = uv[slotid] as UVQuad;
    if (!slot) slot = uv[slotid] = {
      x: 0, y: 0, w: 0, h: 0
    };
    slot.x = this.xToU( this.usedWidth );
    slot.y = this.yToV( this.usedHeight );
    slot.w = this.xToU ( this.config.faceSize.x );
    slot.h = this.yToV (this.config.faceSize.y );
    
    this.usedWidth += this.config.faceSize.x;

    slot.src = texture;
  }
  loadTexture (url: string, type: BlockType, slotid: BlockTextureSlot = 0): Promise<void> {
    return new Promise(async (_resolve, _reject)=>{
      try {
        let img = document.createElement("img");
        img.src = url;
        document.body.appendChild(img);
        img.onload = ()=>{
          console.log("image loaded from url", url, img);
          this.addTexture(img, type, slotid);
          img.remove();
          _resolve();
        }
      } catch (ex) {
        _reject(ex);
        return;
      }
    });
  }
  clear() {
    this.atlas = {
      texture: null,
      type: {},
      faceSize: {...this.config.faceSize}
    };
  }
  setCanvasActivation(active: boolean) {
    if (active) {
      this.canvas.width = this.config.width;
      this.canvas.height = this.config.height;
      this.canvas.style.display = "block";
      document.body.appendChild(this.canvas);
    } else {
      this.canvas.style.display = "none";
      this.canvas.remove();
    }
  }
  render() {
    let typeid: number;
    let uvConfig: BlockUVs;

    let slotid: number;
    let quad: UVQuad;

    for (let typeidn in this.atlas.type) {
      typeid = parseInt(typeidn);
      uvConfig = this.atlas.type[typeid] as BlockUVs;

      for (let slotidn in uvConfig) {
        slotid = parseInt(slotidn);
        quad = uvConfig[slotid];
        if (!quad.src) throw `Cannot render texture atlas quad.src was falsey, expected CanvasImageSource`;
        
        this.ctx.drawImage(
          quad.src,
          this.uToX(quad.x),
          this.vToY(quad.y),
          this.uToX(quad.w),
          this.vToY(quad.h)
        );
      }
    }
  }
  build(): Atlas {
    this.setCanvasActivation(true);

    this.render();

    //create texture from canvas
    this.atlas.texture = new CanvasTexture(
      this.canvas,
      UVMapping,
      RepeatWrapping,
      RepeatWrapping,
      NearestFilter,
      NearestFilter
    );

    this.setCanvasActivation(false);
    return this.atlas;
  }
}

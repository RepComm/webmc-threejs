
import { BufferGeometry, Float32BufferAttribute } from "three";
import { CubeSidesShown } from "./block";
import { XYZ } from "./utils";

export class MeshBuilder {
  verticies: Array<number>;
  // faces: Array<number>;

  constructor() {
    this.verticies = new Array();
  }
  build(out: BufferGeometry) {
    out.setAttribute(
      "position",
      new Float32BufferAttribute(
        this.verticies, 3
      )
    );
    out.computeVertexNormals();
  }
  clearVerticies() {
    this.verticies.length = 0;
  }
  // clearFaces () {
  //   this.faces.length = 0;
  // }
  clear() {
    this.clearVerticies();
    // this.clearFaces();
  }
  polygon(...verticies: Array<number>) {
    if (verticies.length % 3 !== 0) throw `vertex count is not a multiple of 3!`;
    // let idx = this.verticies.length;
    // let triangleCount = verticies.length / 3;

    // for (let i=0; i<triangleCount; i++) {
    //   idx ++;
    //   this.faces.push(idx);
    // }

    this.verticies.push(...verticies);
  }
  /**Clockwise triangle
   * 0----1
   * |  /
   * | /
   * 2
   */
  tri(
    x0: number, y0: number, z0: number,
    x1: number, y1: number, z1: number,
    x2: number, y2: number, z2: number
  ) {
    this.polygon(
      x0, y0, z0,
      x1, y1, z1,
      x2, y2, z2
    );
  }
  triOOP(
    _0: XYZ, _1: XYZ, _2: XYZ
  ) {
    this.tri(
      _0.x, _0.y, _0.z,
      _1.x, _1.y, _1.z,
      _2.x, _2.y, _2.z
    );
  }
  /**Clockwise quadrangle
   * 0----1
   * |  / |
   * | /  |
   * 3----2
   */
  quad(
    x0: number, y0: number, z0: number,
    x1: number, y1: number, z1: number,
    x2: number, y2: number, z2: number,
    x3: number, y3: number, z3: number
  ) {
    this.polygon(
      x0, y0, z0,
      x1, y1, z1,
      x3, y3, z3,

      x1, y1, z1,
      x2, y2, z2,
      x3, y3, z3
    );
  }
  quadOOP(_0: XYZ, _1: XYZ, _2: XYZ, _3: XYZ) {
    this.quad(
      _0.x, _0.y, _0.z,
      _1.x, _1.y, _1.z,
      _2.x, _2.y, _2.z,
      _3.x, _3.y, _3.z,
    );
  }
  /**Generate mesh for a cube
   * 
   * @param cx 
   * @param cy 
   * @param cz 
   * @param radius 
   * @param n 
   * @param s 
   * @param e 
   * @param w 
   * @param u 
   * @param d 
   * @param center when true, cube is centered around cx, cy, cx, otherwise the min corner is used
   */
  cube(
    cx: number, cy: number, cz: number,
    radius: number,
    n: boolean, s: boolean,
    e: boolean, w: boolean,
    u: boolean, d: boolean,
    center: boolean = false
  ) {
    let diameter = radius * 2;
    let north: number;
    let south: number;
    let east: number;
    let west: number;
    let up: number;
    let down: number;

    if (center) {
      north = cz + radius;
      south = cz - radius;
      east = cx + radius;
      west = cx - radius;
      up = cy + radius;
      down = cy - radius;
    } else {
      north = cz + diameter;
      south = cz;
      east = cx + diameter;
      west = cx;
      up = cy + diameter;
      down = cy;
    }

    /**UP quad*/
    if (u) {
      this.quad(
        west, up, north,
        east, up, north,
        east, up, south,
        west, up, south
      );
    }

    /**DOWN quad*/
    if (d) {
      this.quad(
        west, down, north,
        west, down, south,
        east, down, south,
        east, down, north,
      );
    }

    /**NORTH quad*/
    if (n) {
      this.quad(
        east, up, north,
        west, up, north,
        west, down, north,
        east, down, north,
      );
    }

    /**SOUTH quad*/
    if (s) {
      this.quad(
        west, up, south,
        east, up, south,
        east, down, south,
        west, down, south
      );
    }

    /**EAST quad*/
    if (e) {
      this.quad(
        east, up, south,
        east, up, north,
        east, down, north,
        east, down, south
      );
    }

    /**WEST quad*/
    if (w) {
      this.quad(
        west, up, north,
        west, up, south,
        west, down, south,
        west, down, north
      );
    }

  }
  /**Generate mesh for a cube
   * 
   * @param c center or corner
   * @param radius radius from the center of the cube
   * @param sides which sides to render
   * @param center center the verticies or use `c` as minimum corner
   */
  cubeOOP(
    c: XYZ,
    radius: number,
    sides: CubeSidesShown,
    center: boolean = false
  ) {
    this.cube(
      c.x, c.y, c.z,
      radius,
      sides.north,
      sides.south,
      sides.east,
      sides.west,
      sides.up,
      sides.down,
      center
    );
  }
}

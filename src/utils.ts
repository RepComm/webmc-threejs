import { Vector3 } from "three";

export interface XYZ {
  x: number;
  y: number;
  z: number;
}

export function copyXYZ (from: XYZ, to: XYZ) {
  to.x = from.x;
  to.y = from.y;
  to.z = from.z;
}
export function addXYZ (from: XYZ, to: XYZ) {
  to.x += from.x;
  to.y += from.y;
  to.z += from.z;
}
export function floorXYZ (out: XYZ) {
  out.x = Math.floor(out.x);
  out.y = Math.floor(out.y);
  out.z = Math.floor(out.z);
}
export function createXYZ (x: number = 0, y: number = 0, z: number = 0) {
  return {
    x, y, z
  };
}
export function setXYZ (out: XYZ, x: number = 0, y: number = 0, z: number = 0) {
  out.x = x;
  out.y = y;
  out.z = z;
}
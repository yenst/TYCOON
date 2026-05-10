import { TILE_W, TILE_H } from "./config";

const HALF_W = TILE_W / 2;
const HALF_H = TILE_H / 2;

export interface Grid {
  gx: number;
  gy: number;
}
export interface Screen {
  x: number;
  y: number;
}

export function gridToScreen(gx: number, gy: number): Screen {
  return {
    x: (gx - gy) * HALF_W,
    y: (gx + gy) * HALF_H,
  };
}

export function screenToGrid(x: number, y: number): Grid {
  const gx = (x / HALF_W + y / HALF_H) / 2;
  const gy = (y / HALF_H - x / HALF_W) / 2;
  return { gx: Math.floor(gx), gy: Math.floor(gy) };
}

export function depth(gx: number, gy: number): number {
  return gx + gy;
}

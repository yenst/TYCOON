import type { Park } from "./state/Park";
import { MAP_W, MAP_H } from "./config";

const DIRS: Array<[number, number]> = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
];

function inBounds(gx: number, gy: number): boolean {
  return gx >= 0 && gx < MAP_W && gy >= 0 && gy < MAP_H;
}

/**
 * Returns the shortest grid path (excluding start, including goal) from
 * (sx,sy) to the nearest tile satisfying `isGoal`, walking only over tiles
 * where `isWalkable` is true. Returns null if unreachable.
 */
export function bfs(
  sx: number,
  sy: number,
  isWalkable: (gx: number, gy: number) => boolean,
  isGoal: (gx: number, gy: number) => boolean,
): Array<[number, number]> | null {
  const visited = new Uint8Array(MAP_W * MAP_H);
  const parent = new Int32Array(MAP_W * MAP_H);
  parent.fill(-1);
  const idx = (gx: number, gy: number) => gy * MAP_W + gx;

  const queue: Array<[number, number]> = [[sx, sy]];
  visited[idx(sx, sy)] = 1;

  let goal: [number, number] | null = null;

  while (queue.length > 0) {
    const cur = queue.shift()!;
    const [cx, cy] = cur;

    if (isGoal(cx, cy) && !(cx === sx && cy === sy)) {
      goal = [cx, cy];
      break;
    }

    for (const [dx, dy] of DIRS) {
      const nx = cx + dx;
      const ny = cy + dy;
      if (!inBounds(nx, ny)) continue;
      if (visited[idx(nx, ny)]) continue;
      if (!isWalkable(nx, ny) && !isGoal(nx, ny)) continue;
      visited[idx(nx, ny)] = 1;
      parent[idx(nx, ny)] = idx(cx, cy);
      queue.push([nx, ny]);
    }
  }

  if (!goal) return null;

  const path: Array<[number, number]> = [];
  let cur = idx(goal[0], goal[1]);
  const startIdx = idx(sx, sy);
  while (cur !== startIdx && cur !== -1) {
    const gx = cur % MAP_W;
    const gy = Math.floor(cur / MAP_W);
    path.push([gx, gy]);
    cur = parent[cur]!;
  }
  return path.reverse();
}

/** Returns true if any tile orthogonally adjacent to the given footprint is `path`. */
export function hasAdjacentPath(
  park: Park,
  gx: number,
  gy: number,
  w: number,
  h: number,
): boolean {
  for (let y = gy; y < gy + h; y++) {
    for (let x = gx; x < gx + w; x++) {
      for (const [dx, dy] of DIRS) {
        const nx = x + dx;
        const ny = y + dy;
        if (nx >= gx && nx < gx + w && ny >= gy && ny < gy + h) continue;
        if (!inBounds(nx, ny)) continue;
        if (park.tiles[ny]![nx] === "path") return true;
      }
    }
  }
  return false;
}

/** Returns the path tiles orthogonally adjacent to the footprint (inside-bounds, "path" only). */
export function adjacentPathTiles(
  park: Park,
  gx: number,
  gy: number,
  w: number,
  h: number,
): Array<[number, number]> {
  const out: Array<[number, number]> = [];
  const seen = new Set<number>();
  for (let y = gy; y < gy + h; y++) {
    for (let x = gx; x < gx + w; x++) {
      for (const [dx, dy] of DIRS) {
        const nx = x + dx;
        const ny = y + dy;
        if (nx >= gx && nx < gx + w && ny >= gy && ny < gy + h) continue;
        if (!inBounds(nx, ny)) continue;
        if (park.tiles[ny]![nx] !== "path") continue;
        const key = ny * MAP_W + nx;
        if (seen.has(key)) continue;
        seen.add(key);
        out.push([nx, ny]);
      }
    }
  }
  return out;
}

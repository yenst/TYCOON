import {
  MAP_W,
  MAP_H,
  STARTING_CASH,
  ENTRANCE_GX,
  ENTRANCE_GY,
  RIDES,
  SCORE_PER_RIDE,
  SCORE_PER_PATH,
  SCORE_PER_VISITOR_SERVED,
  GUEST_SPAWN_INTERVAL_MS,
  GUEST_MAX,
  type RideType,
} from "../config";

export type Tile = "grass" | "path";

export interface RideInstance {
  id: string;
  type: RideType;
  gx: number;
  gy: number;
}

export interface ParkSnapshot {
  v: 1;
  tiles: Tile[][];
  rides: RideInstance[];
  cash: number;
  currentDay?: number;
  dayProgressMs?: number;
  totalServed?: number;
}

let _nextRideId = 1;
function newRideId(): string {
  return `r${_nextRideId++}`;
}

export class Park {
  tiles: Tile[][];
  rides: RideInstance[] = [];
  cash: number = STARTING_CASH;
  currentDay: number = 1;
  dayProgressMs: number = 0;
  totalServed: number = 0;
  /** Transient — current riders per ride id; not serialized. */
  ridersPerRide: Map<string, number> = new Map();

  constructor() {
    this.tiles = [];
    for (let y = 0; y < MAP_H; y++) {
      const row: Tile[] = [];
      for (let x = 0; x < MAP_W; x++) row.push("grass");
      this.tiles.push(row);
    }
    // Pre-place starter path next to entrance (entrance itself is rendered as a sprite,
    // but the tile under it is path so guests can step off).
    this.tiles[ENTRANCE_GY]![ENTRANCE_GX] = "path";
    if (ENTRANCE_GX + 1 < MAP_W) this.tiles[ENTRANCE_GY]![ENTRANCE_GX + 1] = "path";
  }

  inBounds(gx: number, gy: number): boolean {
    return gx >= 0 && gx < MAP_W && gy >= 0 && gy < MAP_H;
  }

  isPath(gx: number, gy: number): boolean {
    if (!this.inBounds(gx, gy)) return false;
    return this.tiles[gy]![gx] === "path";
  }

  isGrass(gx: number, gy: number): boolean {
    if (!this.inBounds(gx, gy)) return false;
    return this.tiles[gy]![gx] === "grass";
  }

  /** Returns true if (gx,gy) lies inside any ride's footprint. */
  rideAt(gx: number, gy: number): RideInstance | null {
    for (const r of this.rides) {
      const def = RIDES[r.type];
      if (gx >= r.gx && gx < r.gx + def.width && gy >= r.gy && gy < r.gy + def.height) {
        return r;
      }
    }
    return null;
  }

  /** Returns true if entrance occupies (gx,gy). Entrance is permanent. */
  isEntrance(gx: number, gy: number): boolean {
    return gx === ENTRANCE_GX && gy === ENTRANCE_GY;
  }

  paintPath(gx: number, gy: number, cost: number): boolean {
    if (!this.inBounds(gx, gy)) return false;
    if (this.tiles[gy]![gx] === "path") return false;
    if (this.rideAt(gx, gy)) return false;
    if (this.cash < cost) return false;
    this.tiles[gy]![gx] = "path";
    this.cash -= cost;
    return true;
  }

  canPlaceRide(type: RideType, gx: number, gy: number): boolean {
    const def = RIDES[type];
    if (this.cash < def.cost) return false;
    for (let y = gy; y < gy + def.height; y++) {
      for (let x = gx; x < gx + def.width; x++) {
        if (!this.inBounds(x, y)) return false;
        if (this.tiles[y]![x] !== "grass") return false;
        if (this.rideAt(x, y)) return false;
        if (this.isEntrance(x, y)) return false;
      }
    }
    return true;
  }

  placeRide(type: RideType, gx: number, gy: number): RideInstance | null {
    if (!this.canPlaceRide(type, gx, gy)) return null;
    const def = RIDES[type];
    const ride: RideInstance = { id: newRideId(), type, gx, gy };
    this.rides.push(ride);
    this.cash -= def.cost;
    return ride;
  }

  /** Returns ['path' | 'ride' | null] describing what was removed. */
  demolish(gx: number, gy: number): "path" | "ride" | null {
    if (!this.inBounds(gx, gy)) return null;
    if (this.isEntrance(gx, gy)) return null;
    const ride = this.rideAt(gx, gy);
    if (ride) {
      this.rides = this.rides.filter((r) => r.id !== ride.id);
      this.ridersPerRide.delete(ride.id);
      return "ride";
    }
    if (this.tiles[gy]![gx] === "path") {
      this.tiles[gy]![gx] = "grass";
      return "path";
    }
    return null;
  }

  ridersOn(rideId: string): number {
    return this.ridersPerRide.get(rideId) ?? 0;
  }

  pathTileCount(): number {
    let n = 0;
    for (const row of this.tiles) for (const t of row) if (t === "path") n++;
    return n;
  }

  parkScore(): number {
    return (
      this.rides.length * SCORE_PER_RIDE +
      this.pathTileCount() * SCORE_PER_PATH +
      this.totalServed * SCORE_PER_VISITOR_SERVED
    );
  }

  /**
   * Spawn interval shrinks as the park's score grows: at score 0 we use the
   * configured base, by score 500 we're roughly twice as fast, capped at 400ms.
   */
  recommendedSpawnIntervalMs(): number {
    const score = this.parkScore();
    return Math.max(400, Math.round(GUEST_SPAWN_INTERVAL_MS / (1 + score / 400)));
  }

  recommendedMaxGuests(): number {
    const score = this.parkScore();
    return Math.min(GUEST_MAX, 8 + Math.floor(score / 12));
  }

  canEnterRide(ride: RideInstance): boolean {
    if (!this.rides.some((r) => r.id === ride.id)) return false;
    const def = RIDES[ride.type];
    return this.ridersOn(ride.id) < def.maxRiders;
  }

  enterRide(ride: RideInstance): boolean {
    if (!this.canEnterRide(ride)) return false;
    this.ridersPerRide.set(ride.id, this.ridersOn(ride.id) + 1);
    return true;
  }

  exitRide(ride: RideInstance): void {
    const next = Math.max(0, this.ridersOn(ride.id) - 1);
    this.ridersPerRide.set(ride.id, next);
  }

  toJSON(): ParkSnapshot {
    return {
      v: 1,
      tiles: this.tiles,
      rides: this.rides,
      cash: this.cash,
      currentDay: this.currentDay,
      dayProgressMs: this.dayProgressMs,
      totalServed: this.totalServed,
    };
  }

  static fromJSON(snap: ParkSnapshot): Park {
    const p = new Park();
    if (snap.v !== 1) return p;
    if (Array.isArray(snap.tiles) && snap.tiles.length === MAP_H) {
      p.tiles = snap.tiles;
    }
    p.rides = Array.isArray(snap.rides) ? snap.rides : [];
    p.cash = typeof snap.cash === "number" ? snap.cash : STARTING_CASH;
    p.currentDay = typeof snap.currentDay === "number" ? snap.currentDay : 1;
    p.dayProgressMs = typeof snap.dayProgressMs === "number" ? snap.dayProgressMs : 0;
    p.totalServed = typeof snap.totalServed === "number" ? snap.totalServed : 0;
    // Make sure ride id counter doesn't collide with loaded ones
    for (const r of p.rides) {
      const n = parseInt(r.id.slice(1), 10);
      if (!Number.isNaN(n) && n >= _nextRideId) _nextRideId = n + 1;
    }
    return p;
  }
}


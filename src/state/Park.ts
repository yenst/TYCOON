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
import { generateScenery, type SceneryItem } from "../entities/Scenery";
import { adjacentPathTiles } from "../pathfind";

export type Tile = "grass" | "path" | "water" | "bridge";

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
  scenery?: SceneryItem[];
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
  scenery: SceneryItem[] = [];
  /** Transient — current riders per ride id; not serialized. */
  ridersPerRide: Map<string, number> = new Map();
  /** Transient — per-stand slot positions and which guest holds each slot. */
  standSlots: Map<string, { gx: number; gy: number; occupant: string | null }[]> = new Map();
  /**
   * Transient — count of guests currently *en route* to each ride. Used so
   * planning sees the ride as full before the actual occupants arrive, instead
   * of letting 5 guests march toward a 2-slot stand and 3 of them bounce.
   */
  committedPerRide: Map<string, number> = new Map();

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
    // One-off scenery scatter outside the playable area, persisted with the save.
    this.scenery = generateScenery();
  }

  inBounds(gx: number, gy: number): boolean {
    return gx >= 0 && gx < MAP_W && gy >= 0 && gy < MAP_H;
  }

  isPath(gx: number, gy: number): boolean {
    if (!this.inBounds(gx, gy)) return false;
    const t = this.tiles[gy]![gx];
    // Bridges count as path for pathfinding + adjacency.
    return t === "path" || t === "bridge";
  }

  isGrass(gx: number, gy: number): boolean {
    if (!this.inBounds(gx, gy)) return false;
    return this.tiles[gy]![gx] === "grass";
  }

  isWater(gx: number, gy: number): boolean {
    if (!this.inBounds(gx, gy)) return false;
    return this.tiles[gy]![gx] === "water";
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
    if (this.tiles[gy]![gx] !== "grass") return false;
    if (this.rideAt(gx, gy)) return false;
    if (this.cash < cost) return false;
    this.tiles[gy]![gx] = "path";
    this.cash -= cost;
    return true;
  }

  paintWater(gx: number, gy: number, cost: number): boolean {
    if (!this.inBounds(gx, gy)) return false;
    if (this.tiles[gy]![gx] !== "grass") return false;
    if (this.rideAt(gx, gy)) return false;
    if (this.isEntrance(gx, gy)) return false;
    if (this.cash < cost) return false;
    this.tiles[gy]![gx] = "water";
    this.cash -= cost;
    return true;
  }

  paintBridge(gx: number, gy: number, cost: number): boolean {
    if (!this.inBounds(gx, gy)) return false;
    if (this.tiles[gy]![gx] !== "water") return false;
    if (this.cash < cost) return false;
    this.tiles[gy]![gx] = "bridge";
    this.cash -= cost;
    return true;
  }

  canPlaceRide(type: RideType, gx: number, gy: number): boolean {
    const def = RIDES[type];
    if (this.cash < def.cost) return false;
    const isDecor = def.category === "decoration";
    for (let y = gy; y < gy + def.height; y++) {
      for (let x = gx; x < gx + def.width; x++) {
        if (!this.inBounds(x, y)) return false;
        const t = this.tiles[y]![x];
        // Decorations may sit on grass or path (lamps, benches alongside paths).
        // Rides and stands still require flat grass.
        if (isDecor) {
          if (t !== "grass" && t !== "path") return false;
        } else if (t !== "grass") {
          return false;
        }
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
    if (def.category === "stand") this.refreshStandSlots(ride);
    return ride;
  }

  /**
   * Stands serve guests at adjacent path tiles. Slots are the first `maxRiders`
   * orthogonally-adjacent path tiles found at placement time. Re-derived on
   * demand so adding paths later opens up new slots.
   */
  refreshStandSlots(ride: RideInstance) {
    const def = RIDES[ride.type];
    if (def.category !== "stand") return;
    const existing = this.standSlots.get(ride.id) ?? [];
    const candidates: Array<[number, number]> = [];
    if (def.slotPattern === "sw_line") {
      // "Front pair" — two slots side by side along screen-x in front of the
      // stand: the SW-adjacent tile and the SE-adjacent tile. Both project at
      // the same screen-y so they read as a horizontal queue.
      const sw: [number, number] = [ride.gx, ride.gy + def.height];
      const se: [number, number] = [ride.gx + def.width, ride.gy + def.height - 1];
      for (const [sx, sy] of [sw, se]) {
        if (this.isPath(sx, sy)) candidates.push([sx, sy]);
      }
    } else {
      // Default: any orthogonally-adjacent path tile.
      candidates.push(...adjacentPathTiles(this, ride.gx, ride.gy, def.width, def.height));
    }
    const next: { gx: number; gy: number; occupant: string | null }[] = [];
    for (let i = 0; i < def.maxRiders && i < candidates.length; i++) {
      const [gx, gy] = candidates[i]!;
      const prior = existing.find((s) => s.gx === gx && s.gy === gy);
      next.push({ gx, gy, occupant: prior?.occupant ?? null });
    }
    this.standSlots.set(ride.id, next);
  }

  standSlotsFor(rideId: string): { gx: number; gy: number; occupant: string | null }[] {
    return this.standSlots.get(rideId) ?? [];
  }

  /** True if (gx,gy) is a stand slot currently held by some guest. */
  isStandSlotOccupied(gx: number, gy: number): boolean {
    for (const slots of this.standSlots.values()) {
      for (const s of slots) {
        if (s.occupant !== null && s.gx === gx && s.gy === gy) return true;
      }
    }
    return false;
  }

  /** Returns ['path' | 'ride' | null] describing what was removed. */
  demolish(gx: number, gy: number): "path" | "ride" | null {
    if (!this.inBounds(gx, gy)) return null;
    if (this.isEntrance(gx, gy)) return null;
    const ride = this.rideAt(gx, gy);
    if (ride) {
      this.rides = this.rides.filter((r) => r.id !== ride.id);
      this.ridersPerRide.delete(ride.id);
      this.standSlots.delete(ride.id);
      return "ride";
    }
    const t = this.tiles[gy]![gx];
    if (t === "path" || t === "water") {
      this.tiles[gy]![gx] = "grass";
      return "path";
    }
    if (t === "bridge") {
      this.tiles[gy]![gx] = "water";
      return "path";
    }
    return null;
  }

  ridersOn(rideId: string): number {
    const slots = this.standSlots.get(rideId);
    if (slots) return slots.filter((s) => s.occupant !== null).length;
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
    if (def.category === "stand") {
      // Lazily refresh in case paths were added after placement.
      this.refreshStandSlots(ride);
      return this.standSlots.get(ride.id)?.some((s) => s.occupant === null) ?? false;
    }
    return this.ridersOn(ride.id) < def.maxRiders;
  }

  /**
   * Forecast-aware: includes guests already on their way. Used at plan time to
   * stop new guests piling toward a ride that's effectively full.
   */
  canTargetRide(ride: RideInstance): boolean {
    if (!this.rides.some((r) => r.id === ride.id)) return false;
    const def = RIDES[ride.type];
    const occupants =
      def.category === "stand"
        ? (this.standSlots.get(ride.id)?.filter((s) => s.occupant !== null).length ?? 0)
        : (this.ridersPerRide.get(ride.id) ?? 0);
    const incoming = this.committedPerRide.get(ride.id) ?? 0;
    return occupants + incoming < def.maxRiders;
  }

  commitToRide(rideId: string): void {
    this.committedPerRide.set(rideId, (this.committedPerRide.get(rideId) ?? 0) + 1);
  }

  uncommitFromRide(rideId: string): void {
    const v = this.committedPerRide.get(rideId) ?? 0;
    if (v <= 1) this.committedPerRide.delete(rideId);
    else this.committedPerRide.set(rideId, v - 1);
  }

  /**
   * For rides: increments the occupant counter and returns null.
   * For stands: claims the first free slot and returns its grid position; the
   * guest should walk to that exact tile and stay there until exitRide.
   */
  enterRide(
    ride: RideInstance,
    guestId: string,
    atGx?: number,
    atGy?: number,
  ): { gx: number; gy: number } | true | false {
    const def = RIDES[ride.type];
    if (def.category === "stand") {
      this.refreshStandSlots(ride);
      const slots = this.standSlots.get(ride.id);
      if (!slots) return false;
      // Prefer the slot the guest is already standing on, if it's free.
      let pick = slots.find(
        (s) => s.occupant === null && atGx !== undefined && s.gx === atGx && s.gy === atGy,
      );
      if (!pick) pick = slots.find((s) => s.occupant === null);
      if (!pick) return false;
      pick.occupant = guestId;
      return { gx: pick.gx, gy: pick.gy };
    }
    if (!this.canEnterRide(ride)) return false;
    this.ridersPerRide.set(ride.id, this.ridersOn(ride.id) + 1);
    return true;
  }

  exitRide(ride: RideInstance, guestId: string): void {
    const def = RIDES[ride.type];
    if (def.category === "stand") {
      const slots = this.standSlots.get(ride.id);
      if (slots) {
        const owned = slots.find((s) => s.occupant === guestId);
        if (owned) owned.occupant = null;
      }
      return;
    }
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
      scenery: this.scenery,
    };
  }

  static fromJSON(snap: ParkSnapshot): Park {
    const p = new Park();
    if (snap.v !== 1) return p;
    if (Array.isArray(snap.tiles) && snap.tiles.length === MAP_H) {
      p.tiles = snap.tiles;
    }
    // Drop any rides whose type isn't in RIDES anymore (e.g., removed in a code update).
    p.rides = (Array.isArray(snap.rides) ? snap.rides : []).filter(
      (r) => RIDES[r.type] !== undefined,
    );
    p.cash = typeof snap.cash === "number" ? snap.cash : STARTING_CASH;
    p.currentDay = typeof snap.currentDay === "number" ? snap.currentDay : 1;
    p.dayProgressMs = typeof snap.dayProgressMs === "number" ? snap.dayProgressMs : 0;
    p.totalServed = typeof snap.totalServed === "number" ? snap.totalServed : 0;
    // Keep scenery if the save has it, else seed a fresh ring for old saves.
    p.scenery = Array.isArray(snap.scenery) && snap.scenery.length > 0 ? snap.scenery : generateScenery();
    // Rebuild stand slots from loaded rides (transient — not in the snapshot).
    for (const ride of p.rides) {
      if (RIDES[ride.type].category === "stand") p.refreshStandSlots(ride);
    }
    // Make sure ride id counter doesn't collide with loaded ones
    for (const r of p.rides) {
      const n = parseInt(r.id.slice(1), 10);
      if (!Number.isNaN(n) && n >= _nextRideId) _nextRideId = n + 1;
    }
    return p;
  }
}


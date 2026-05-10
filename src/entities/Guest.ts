import Phaser from "phaser";
import { Park, type RideInstance } from "../state/Park";
import { RIDES } from "../config";
import { gridToScreen, depth } from "../iso";
import { GUEST_STEP_MS, ENTRANCE_GX, ENTRANCE_GY, GUEST_VARIANT_COUNT } from "../config";
import { bfs, adjacentPathTiles } from "../pathfind";
import { GUEST_WALK_ANIMS, guestStaticKey, type GuestDir } from "./GuestAssets";

type State = "spawned" | "walking_to_ride" | "riding" | "leaving";

const IDLE_GIVE_UP_MS = 30_000;

let _nextGuestId = 1;

export class Guest {
  id: string;
  gx: number;
  gy: number;
  state: State = "spawned";
  path: Array<[number, number]> = [];
  pathIdx = 0;
  stepTimer = 0;
  rideTimer = 0;
  idleTimer = 0;
  targetRide: RideInstance | null = null;
  facing: GuestDir = "se";
  variant: number;
  /** Last direction the walk anim was playing for, to avoid restarting every frame. */
  private playingWalkDir: GuestDir | null = null;

  scene: Phaser.Scene;
  sprite: Phaser.GameObjects.Sprite;
  park: Park;

  constructor(scene: Phaser.Scene, park: Park, gx: number, gy: number) {
    this.id = `g${_nextGuestId++}`;
    this.scene = scene;
    this.park = park;
    this.gx = gx;
    this.gy = gy;
    this.variant = 1 + Math.floor(Math.random() * GUEST_VARIANT_COUNT);
    const s = gridToScreen(gx, gy);
    this.sprite = scene.add.sprite(s.x, s.y, guestStaticKey(this.variant, this.facing));
    this.sprite.setOrigin(0.5, 0.9);
    this.sprite.setDepth(depth(gx, gy) + 0.6);
  }

  private walkAnimKey(): string | null {
    return GUEST_WALK_ANIMS[this.variant]?.[this.facing] ?? null;
  }

  private playWalk() {
    const animKey = this.walkAnimKey();
    if (!animKey) {
      this.stopWalk();
      this.sprite.setTexture(guestStaticKey(this.variant, this.facing));
      return;
    }
    if (this.playingWalkDir !== this.facing) {
      this.sprite.play(animKey);
      this.playingWalkDir = this.facing;
    }
  }

  private stopWalk() {
    if (this.playingWalkDir !== null) {
      this.sprite.stop();
      this.playingWalkDir = null;
    }
    this.sprite.setTexture(guestStaticKey(this.variant, this.facing));
  }

  private updateSprite() {
    const s = gridToScreen(this.gx, this.gy);
    this.sprite.x = s.x;
    this.sprite.y = s.y;
    this.sprite.setDepth(depth(this.gx, this.gy) + 0.6);
    if (this.state === "walking_to_ride" || this.state === "leaving") this.playWalk();
    else this.stopWalk();
  }

  /** Picks the closest reachable ride with capacity and computes a path to a path-tile adjacent to it. */
  private planToRide(): boolean {
    if (this.park.rides.length === 0) return false;
    // For each ride that still has space, compute set of adjacent path tiles.
    const adjSet = new Set<number>();
    const rideByTile = new Map<number, RideInstance>();
    for (const ride of this.park.rides) {
      if (!this.park.canEnterRide(ride)) continue;
      const def = RIDES[ride.type];
      const tiles = adjacentPathTiles(this.park, ride.gx, ride.gy, def.width, def.height);
      for (const [x, y] of tiles) {
        const key = y * 10000 + x;
        adjSet.add(key);
        if (!rideByTile.has(key)) rideByTile.set(key, ride);
      }
    }
    if (adjSet.size === 0) return false;

    const result = bfs(
      this.gx,
      this.gy,
      (x, y) => this.park.isPath(x, y),
      (x, y) => adjSet.has(y * 10000 + x),
    );
    if (!result || result.length === 0) return false;
    this.path = result;
    this.pathIdx = 0;
    const last = result[result.length - 1]!;
    this.targetRide = rideByTile.get(last[1] * 10000 + last[0]) ?? null;
    return this.targetRide !== null;
  }

  private planToExit(): boolean {
    const result = bfs(
      this.gx,
      this.gy,
      (x, y) => this.park.isPath(x, y),
      (x, y) => x === ENTRANCE_GX && y === ENTRANCE_GY,
    );
    if (!result || result.length === 0) return false;
    this.path = result;
    this.pathIdx = 0;
    return true;
  }

  /** Advance the guest one tick. Returns true if guest should be despawned. */
  tick(dtMs: number): boolean {
    if (this.state === "spawned") {
      if (this.planToRide()) {
        this.state = "walking_to_ride";
        this.idleTimer = 0;
        this.playWalk();
        return false;
      }
      // No reachable ride yet — wait visibly at entrance, retry next tick.
      this.idleTimer += dtMs;
      if (this.idleTimer < IDLE_GIVE_UP_MS) return false;
      // Gave up waiting — leave (or despawn instantly if at exit).
      if (!this.planToExit()) return true;
      this.state = "leaving";
      this.playWalk();
      return false;
    }

    if (this.state === "riding") {
      this.rideTimer -= dtMs;
      if (this.rideTimer <= 0) {
        // Pay out, free the slot, exit ride.
        if (this.targetRide) {
          const def = RIDES[this.targetRide.type];
          this.park.cash += def.pricePerRide;
          this.park.exitRide(this.targetRide);
          this.park.totalServed += 1;
        }
        this.sprite.setVisible(true);
        if (this.planToExit()) {
          this.state = "leaving";
          this.playWalk();
        } else {
          return true;
        }
      }
      return false;
    }

    // walking_to_ride or leaving: step along path
    this.stepTimer -= dtMs;
    if (this.stepTimer > 0) return false;
    this.stepTimer = GUEST_STEP_MS;

    if (this.pathIdx >= this.path.length) {
      // Reached end of path
      if (this.state === "walking_to_ride" && this.targetRide) {
        // Try to enter — could be full now since we planned a while ago.
        if (!this.park.enterRide(this.targetRide)) {
          // Full → try to find another ride; if none, give up and leave.
          this.targetRide = null;
          if (this.planToRide()) return false;
          if (this.planToExit()) {
            this.state = "leaving";
            return false;
          }
          return true;
        }
        this.sprite.setVisible(false);
        this.stopWalk();
        const def = RIDES[this.targetRide.type];
        this.rideTimer = def.rideDurationMs;
        this.state = "riding";
        return false;
      }
      if (this.state === "leaving") {
        // At entrance — despawn
        return true;
      }
      return true;
    }

    const next = this.path[this.pathIdx]!;
    // If the next tile is no longer walkable (demolished), re-plan.
    if (!this.park.isPath(next[0], next[1])) {
      const ok = this.state === "walking_to_ride" ? this.planToRide() : this.planToExit();
      if (!ok) return true;
      return false;
    }

    const dx = next[0] - this.gx;
    const dy = next[1] - this.gy;
    // Each grid step is a screen diagonal in iso projection:
    //   +gx → down-right (SE), -gx → up-left (NW)
    //   +gy → down-left  (SW), -gy → up-right (NE)
    if (dx === 1) this.facing = "se";
    else if (dx === -1) this.facing = "nw";
    else if (dy === 1) this.facing = "sw";
    else if (dy === -1) this.facing = "ne";

    this.gx = next[0];
    this.gy = next[1];
    this.pathIdx++;
    this.updateSprite();
    return false;
  }

  destroy() {
    this.sprite.destroy();
  }
}

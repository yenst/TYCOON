import Phaser from "phaser";
import { Park, type RideInstance } from "../state/Park";
import { RIDES } from "../config";
import { gridToScreen, depth } from "../iso";
import {
  GUEST_STEP_MS,
  ENTRANCE_GX,
  ENTRANCE_GY,
  GUEST_VARIANT_COUNT,
  GUEST_SCALE,
  HUNGER_PER_SECOND,
  HUNGER_EAT_THRESHOLD,
  HUNGER_MAX,
} from "../config";
import type { AttractionCategory } from "../config";
import { bfs, adjacentPathTiles } from "../pathfind";
import { GUEST_WALK_ANIMS, guestStaticKey, type GuestDir } from "./GuestAssets";

/**
 * Only variants that have walk animations are eligible to spawn. Variants
 * without walks would visually stand still while moving (their static sprite
 * just slides along), which reads as broken.
 */
const SPAWNABLE_VARIANTS: number[] = Object.keys(GUEST_WALK_ANIMS).map((v) => Number(v));

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
  hunger = 0;
  ridesWanted = 0;
  standsWanted = 0;
  lastVisitedRideId: string | null = null;
  targetRide: RideInstance | null = null;
  /** True while this guest counts toward `park.committedPerRide[targetRide.id]`. */
  private _committed = false;
  facing: GuestDir = "se";
  variant: number;
  /** Active position tween between tiles, so motion isn't a per-step teleport. */
  private moveTween: Phaser.Tweens.Tween | null = null;
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
    this.variant =
      SPAWNABLE_VARIANTS[Math.floor(Math.random() * SPAWNABLE_VARIANTS.length)] ??
      1 + Math.floor(Math.random() * GUEST_VARIANT_COUNT);
    // Each guest has appetite for a few rides and a few stands; they keep
    // visiting until both are exhausted (hunger can override toward a stand).
    this.ridesWanted = 2 + Math.floor(Math.random() * 4); // 2..5
    this.standsWanted = 1 + Math.floor(Math.random() * 3); // 1..3
    const s = gridToScreen(gx, gy);
    this.sprite = scene.add.sprite(s.x, s.y, guestStaticKey(this.variant, this.facing));
    this.sprite.setOrigin(0.5, 0.9);
    this.sprite.setScale(GUEST_SCALE);
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

  /** Set the next target ride and manage commit/uncommit bookkeeping. */
  private setTargetRide(ride: RideInstance | null) {
    if (this._committed && this.targetRide) {
      this.park.uncommitFromRide(this.targetRide.id);
      this._committed = false;
    }
    this.targetRide = ride;
    if (ride) {
      this.park.commitToRide(ride.id);
      this._committed = true;
    }
  }

  /**
   * Drop the inbound reservation but keep the targetRide reference (used at
   * arrival, when we're about to either enter or bounce — the commitment has
   * served its purpose).
   */
  private releaseCommitOnly() {
    if (this._committed && this.targetRide) {
      this.park.uncommitFromRide(this.targetRide.id);
      this._committed = false;
    }
  }

  private updateSprite() {
    const s = gridToScreen(this.gx, this.gy);
    this.sprite.setDepth(depth(this.gx, this.gy) + 0.6);
    if (this.state === "walking_to_ride" || this.state === "leaving") {
      this.playWalk();
      // Tween from current screen position to the new tile over one step.
      if (this.moveTween) this.moveTween.stop();
      this.moveTween = this.scene.tweens.add({
        targets: this.sprite,
        x: s.x,
        y: s.y,
        duration: GUEST_STEP_MS,
        ease: "Linear",
      });
    } else {
      this.stopWalk();
      if (this.moveTween) {
        this.moveTween.stop();
        this.moveTween = null;
      }
      this.sprite.x = s.x;
      this.sprite.y = s.y;
    }
  }

  /** Picks the closest reachable attraction of the desired category and paths to a tile adjacent to it. */
  private planToAttraction(category: AttractionCategory, excludeId: string | null = null): boolean {
    if (this.park.rides.length === 0) return false;
    const adjSet = new Set<number>();
    const rideByTile = new Map<number, RideInstance>();
    for (const ride of this.park.rides) {
      if (excludeId && ride.id === excludeId) continue;
      const def = RIDES[ride.type];
      if (def.category !== category) continue;
      // Use forecast-aware capacity so we don't pile onto a ride that's
      // effectively already full counting incoming guests.
      if (!this.park.canTargetRide(ride)) continue;
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
      (x, y) => this.park.isPath(x, y) && !this.park.isStandSlotOccupied(x, y),
      (x, y) => adjSet.has(y * 10000 + x),
    );
    if (!result || result.length === 0) return false;
    this.path = result;
    this.pathIdx = 0;
    const last = result[result.length - 1]!;
    const ride = rideByTile.get(last[1] * 10000 + last[0]) ?? null;
    this.setTargetRide(ride);
    return ride !== null;
  }

  /**
   * Pick the next attraction. Hungry guests with appetite for food prefer a
   * stand; otherwise visit a ride if they still want one. The just-visited ride
   * is excluded so guests vary their route — falling back to it only if there's
   * truly no alternative.
   */
  private planToRide(): boolean {
    const hungry = this.hunger >= HUNGER_EAT_THRESHOLD;
    if (hungry && this.standsWanted > 0) {
      if (this.planToAttraction("stand", this.lastVisitedRideId)) return true;
      if (this.planToAttraction("stand")) return true;
    }
    if (this.ridesWanted > 0) {
      if (this.planToAttraction("ride", this.lastVisitedRideId)) return true;
      if (this.planToAttraction("ride")) return true;
    }
    // Out of explicit desires — if still hungry, grab any stand
    if (hungry) {
      if (this.planToAttraction("stand")) return true;
    }
    return false;
  }

  private planToExit(): boolean {
    const result = bfs(
      this.gx,
      this.gy,
      (x, y) => this.park.isPath(x, y) && !this.park.isStandSlotOccupied(x, y),
      (x, y) => x === ENTRANCE_GX && y === ENTRANCE_GY,
    );
    if (!result || result.length === 0) return false;
    this.path = result;
    this.pathIdx = 0;
    return true;
  }

  /** Advance the guest one tick. Returns true if guest should be despawned. */
  tick(dtMs: number): boolean {
    // Hunger accumulates whenever the guest is in the park (not while riding —
    // they're occupied — but yes while walking, leaving, or idling).
    if (this.state !== "riding") {
      this.hunger = Math.min(HUNGER_MAX, this.hunger + (HUNGER_PER_SECOND * dtMs) / 1000);
    }

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
        // Pay out, free the slot, mark served, decrement desires.
        let wasStand = false;
        let visitedId: string | null = null;
        if (this.targetRide) {
          const def = RIDES[this.targetRide.type];
          wasStand = def.category === "stand";
          this.park.cash += def.pricePerRide;
          this.park.exitRide(this.targetRide, this.id);
          this.park.totalServed += 1;
          visitedId = this.targetRide.id;
          if (wasStand) {
            this.hunger = 0;
            this.standsWanted = Math.max(0, this.standsWanted - 1);
          } else {
            this.ridesWanted = Math.max(0, this.ridesWanted - 1);
          }
        }
        this.sprite.setVisible(true);
        this.setTargetRide(null);
        this.lastVisitedRideId = visitedId;
        // Re-plan — guest keeps roaming until rides/stands desires hit 0.
        if (this.planToRide()) {
          this.state = "walking_to_ride";
          this.playWalk();
        } else if (this.planToExit()) {
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
        // Reservation has served its purpose — release it before attempting entry.
        this.releaseCommitOnly();
        // Try to enter — could be full now since we planned a while ago.
        const result = this.park.enterRide(this.targetRide, this.id);
        if (result === false) {
          // Full → try to find another ride; if none, give up and leave.
          this.setTargetRide(null);
          if (this.planToRide()) return false;
          if (this.planToExit()) {
            this.state = "leaving";
            return false;
          }
          return true;
        }
        const def = RIDES[this.targetRide.type];
        if (def.category === "stand" && typeof result === "object") {
          // Stand: tween onto the assigned slot tile, face the stand, stay visible.
          const ride = this.targetRide;
          this.gx = result.gx;
          this.gy = result.gy;
          // Face the stand: pick the iso direction matching (slot → stand) vector.
          const standCx = ride.gx + (def.width - 1) / 2;
          const standCy = ride.gy + (def.height - 1) / 2;
          const ddx = standCx - this.gx;
          const ddy = standCy - this.gy;
          if (Math.abs(ddx) >= Math.abs(ddy)) this.facing = ddx >= 0 ? "se" : "nw";
          else this.facing = ddy >= 0 ? "sw" : "ne";
          this.stopWalk();
          const s = gridToScreen(this.gx, this.gy);
          if (this.moveTween) this.moveTween.stop();
          this.moveTween = this.scene.tweens.add({
            targets: this.sprite,
            x: s.x,
            y: s.y,
            duration: 200,
            ease: "Linear",
          });
          this.sprite.setDepth(depth(this.gx, this.gy) + 0.7);
        } else {
          // Ride: disappear inside.
          this.sprite.setVisible(false);
          this.stopWalk();
        }
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
    const isFinalTile = this.pathIdx === this.path.length - 1;
    // Re-plan if the next tile is no longer walkable (demolished, or someone
    // claimed it as a stand slot since we last planned). Exception: the very
    // last tile of the path is allowed to be an occupied stand slot if we're
    // about to step onto it as our destination (handled by enterRide logic).
    const blocked =
      !this.park.isPath(next[0], next[1]) ||
      (!isFinalTile && this.park.isStandSlotOccupied(next[0], next[1]));
    if (blocked) {
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
    if (this.moveTween) {
      this.moveTween.stop();
      this.moveTween = null;
    }
    // Drop any inbound reservation so a despawned guest doesn't keep blocking a slot.
    this.releaseCommitOnly();
    this.sprite.destroy();
  }
}


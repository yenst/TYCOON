import Phaser from "phaser";
import { Park } from "../state/Park";
import { SaveManager } from "../state/SaveManager";
import { Guest } from "../entities/Guest";
import { RideSprite } from "../entities/Ride";
import { gridToScreen, screenToGrid, depth } from "../iso";
import {
  MAP_W,
  MAP_H,
  TILE_W,
  TILE_H,
  ENTRANCE_GX,
  ENTRANCE_GY,
  GUEST_SPAWN_INTERVAL_MS,
  GUEST_MAX,
  PATH_COST,
  RIDES,
  AUTOSAVE_INTERVAL_MS,
  ZOOM_MIN,
  ZOOM_MAX,
  ZOOM_DEFAULT,
  PAN_KEY_PX_PER_SEC,
  DAY_DURATION_MS,
  type RideType,
} from "../config";

export type BuildMode = "select" | "path" | "carousel" | "demolish";

export class GameScene extends Phaser.Scene {
  park!: Park;
  tileSprites: Phaser.GameObjects.Image[][] = [];
  rideSprites: Map<string, RideSprite> = new Map();
  guests: Guest[] = [];
  spawnTimer = 0;
  paused = false;
  mode: BuildMode = "select";
  entranceSprite!: Phaser.GameObjects.Image;
  cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  isPainting = false;
  lastPaintedKey: number | null = null;
  saveTimer = 0;
  previewMain!: Phaser.GameObjects.Image;
  previewFootprint: Phaser.GameObjects.Image[] = [];
  hoverGx = -1;
  hoverGy = -1;
  activeSaveId: string | null = null;

  constructor() {
    super("Game");
  }

  create() {
    // Resolve which save slot we're playing.
    const id = SaveManager.activeId();
    if (!id) {
      // No active slot — bounce back to menu.
      this.scene.start("Menu");
      return;
    }
    this.activeSaveId = id;

    // Reset all collections — Phaser keeps the scene instance alive across
    // stop/start, so previously held references point at already-destroyed
    // objects. Touching them later would explode in Frame.updateUVs.
    this.tileSprites = [];
    this.rideSprites = new Map();
    this.guests = [];
    this.previewFootprint = [];
    this.spawnTimer = 0;
    this.saveTimer = 0;
    this.paused = false;
    this.mode = "select";
    this.isPainting = false;
    this.lastPaintedKey = null;

    const snap = SaveManager.load(id);
    const park = snap ? Park.fromJSON(snap) : new Park();
    this.park = park;
    (this as any).game.registry.set("park", park);
    (this as any).game.registry.set("game", this);

    this.renderTiles();
    this.renderEntrance();
    this.renderRides();
    this.setupPreview();
    this.setupCamera();
    this.setupInput();
  }

  private setupPreview() {
    this.previewMain = this.add.image(0, 0, "tile_path");
    this.previewMain.setOrigin(0.5, 0.5);
    this.previewMain.setAlpha(0.55);
    this.previewMain.setVisible(false);
    this.previewFootprint = [];
  }

  private renderTiles() {
    this.tileSprites = [];
    for (let y = 0; y < MAP_H; y++) {
      const row: Phaser.GameObjects.Image[] = [];
      for (let x = 0; x < MAP_W; x++) {
        const s = gridToScreen(x, y);
        const key = this.park.tiles[y]![x] === "path" ? "tile_path" : "tile_grass";
        const img = this.add.image(s.x, s.y, key);
        img.setOrigin(0.5, 0.5);
        img.setDepth(depth(x, y));
        row.push(img);
      }
      this.tileSprites.push(row);
    }
  }

  private renderEntrance() {
    const s = gridToScreen(ENTRANCE_GX, ENTRANCE_GY);
    this.entranceSprite = this.add.image(s.x, s.y, "entrance");
    this.entranceSprite.setOrigin(0.5, 0.85);
    this.entranceSprite.setDepth(depth(ENTRANCE_GX, ENTRANCE_GY) + 0.5);
  }

  private renderRides() {
    for (const r of this.park.rides) {
      const sprite = new RideSprite(this, r);
      this.rideSprites.set(r.id, sprite);
    }
  }

  resetWorld() {
    if (this.activeSaveId) SaveManager.reset(this.activeSaveId);
    for (const row of this.tileSprites) for (const img of row) img.destroy();
    for (const spr of this.rideSprites.values()) spr.destroy();
    for (const g of this.guests) g.destroy();
    this.entranceSprite?.destroy();
    this.tileSprites = [];
    this.rideSprites.clear();
    this.guests = [];
    this.spawnTimer = 0;
    this.saveTimer = 0;
    this.lastPaintedKey = null;
    this.isPainting = false;
    this.park = new Park();
    this.renderTiles();
    this.renderEntrance();
  }

  private setupCamera() {
    const cam = this.cameras.main;
    // Compute world bounds from projected tile corners.
    const corners = [
      gridToScreen(0, 0),
      gridToScreen(MAP_W - 1, 0),
      gridToScreen(0, MAP_H - 1),
      gridToScreen(MAP_W - 1, MAP_H - 1),
    ];
    const xs = corners.map((c) => c.x);
    const ys = corners.map((c) => c.y);
    const minX = Math.min(...xs) - TILE_W;
    const maxX = Math.max(...xs) + TILE_W;
    const minY = Math.min(...ys) - TILE_H * 2;
    const maxY = Math.max(...ys) + TILE_H * 2;
    cam.setBounds(minX, minY, maxX - minX, maxY - minY);
    cam.setZoom(ZOOM_DEFAULT);
    // Center on the entrance, offset slightly so it sits in the lower-left
    // (most of the buildable area is to the upper-right of it).
    const e = gridToScreen(ENTRANCE_GX + 4, ENTRANCE_GY - 2);
    cam.centerOn(e.x, e.y);
    cam.setBackgroundColor("#fafafa");
  }

  private setupInput() {
    this.cursors = this.input.keyboard!.createCursorKeys();
    // Spacebar = pause toggle, handled in UIScene as well.

    // Wheel: ctrlKey (pinch on Mac) → zoom; else pan (two-finger trackpad scroll).
    this.input.on(
      "wheel",
      (
        _pointer: Phaser.Input.Pointer,
        _over: Phaser.GameObjects.GameObject[],
        deltaX: number,
        deltaY: number,
        _deltaZ: number,
        event?: WheelEvent,
      ) => {
        const cam = this.cameras.main;
        const isPinch = event && event.ctrlKey;
        if (isPinch) {
          const factor = Math.exp(-deltaY * 0.01);
          cam.setZoom(Phaser.Math.Clamp(cam.zoom * factor, ZOOM_MIN, ZOOM_MAX));
        } else {
          // Two-finger trackpad scroll OR plain mouse wheel.
          // Heuristic: deltaX != 0 → trackpad pan; else mouse wheel zoom.
          if (Math.abs(deltaX) > 0.5) {
            cam.scrollX += deltaX / cam.zoom;
            cam.scrollY += deltaY / cam.zoom;
          } else {
            const factor = Math.exp(-deltaY * 0.001);
            cam.setZoom(Phaser.Math.Clamp(cam.zoom * factor, ZOOM_MIN, ZOOM_MAX));
          }
        }
      },
    );

    this.input.on("pointerdown", (p: Phaser.Input.Pointer) => {
      if (this.paused) return;
      this.isPainting = true;
      this.lastPaintedKey = null;
      this.handlePointer(p);
    });
    this.input.on("pointermove", (p: Phaser.Input.Pointer) => {
      this.updatePreview(p);
      if (!this.isPainting) return;
      if (this.paused) return;
      this.handlePointer(p);
    });
    this.input.on("pointerup", () => {
      this.isPainting = false;
      this.lastPaintedKey = null;
    });
    this.input.on("pointerout", () => this.hidePreview());
  }

  private hidePreview() {
    this.previewMain.setVisible(false);
    for (const f of this.previewFootprint) f.setVisible(false);
  }

  private ensureFootprintCount(n: number) {
    while (this.previewFootprint.length < n) {
      const img = this.add.image(0, 0, "tile_grass");
      img.setOrigin(0.5, 0.5);
      img.setAlpha(0.4);
      img.setVisible(false);
      this.previewFootprint.push(img);
    }
  }

  private updatePreview(p: Phaser.Input.Pointer) {
    const { gx, gy } = screenToGrid(p.worldX, p.worldY);
    this.hoverGx = gx;
    this.hoverGy = gy;
    const inMap = gx >= 0 && gx < MAP_W && gy >= 0 && gy < MAP_H;
    if (this.mode === "select" || !inMap) {
      this.hidePreview();
      return;
    }

    if (this.mode === "path") {
      const s = gridToScreen(gx, gy);
      const ok =
        this.park.isGrass(gx, gy) &&
        this.park.cash >= PATH_COST &&
        !this.park.isEntrance(gx, gy);
      this.previewMain.setTexture("tile_path");
      this.previewMain.setOrigin(0.5, 0.5);
      this.previewMain.setPosition(s.x, s.y);
      this.previewMain.setDepth(depth(gx, gy) + 0.2);
      this.previewMain.setAlpha(0.6);
      this.previewMain.setTint(ok ? 0xffffff : 0xff7799);
      this.previewMain.setVisible(true);
      for (const f of this.previewFootprint) f.setVisible(false);
      return;
    }

    if (this.mode === "carousel") {
      const def = RIDES.carousel;
      const ok = this.park.canPlaceRide("carousel", gx, gy);
      this.ensureFootprintCount(def.width * def.height);
      let i = 0;
      for (let dy = 0; dy < def.height; dy++) {
        for (let dx = 0; dx < def.width; dx++) {
          const fx = gx + dx;
          const fy = gy + dy;
          const fs = gridToScreen(fx, fy);
          const f = this.previewFootprint[i++]!;
          f.setPosition(fs.x, fs.y);
          f.setDepth(depth(fx, fy) + 0.15);
          f.setAlpha(0.5);
          f.setTint(ok ? 0xb6f5d6 : 0xff8da9);
          f.setVisible(true);
        }
      }
      // Hide any extra footprint tiles from previous larger preview
      for (let j = i; j < this.previewFootprint.length; j++) {
        this.previewFootprint[j]!.setVisible(false);
      }
      const cx = gx + (def.width - 1) / 2;
      const cy = gy + (def.height - 1) / 2;
      const s = gridToScreen(cx, cy);
      this.previewMain.setTexture("ride_carousel");
      this.previewMain.setOrigin(0.5, 0.85);
      this.previewMain.setPosition(s.x, s.y);
      this.previewMain.setDepth(depth(gx + def.width - 1, gy + def.height - 1) + 0.6);
      this.previewMain.setAlpha(0.6);
      this.previewMain.setTint(ok ? 0xffffff : 0xff7799);
      this.previewMain.setVisible(true);
      return;
    }

    if (this.mode === "demolish") {
      const ride = this.park.rideAt(gx, gy);
      const target = ride
        ? { gx: ride.gx, gy: ride.gy, w: RIDES[ride.type].width, h: RIDES[ride.type].height }
        : { gx, gy, w: 1, h: 1 };
      const removable =
        !this.park.isEntrance(gx, gy) &&
        (this.park.isPath(gx, gy) || ride !== null);
      this.ensureFootprintCount(target.w * target.h);
      let i = 0;
      for (let dy = 0; dy < target.h; dy++) {
        for (let dx = 0; dx < target.w; dx++) {
          const fx = target.gx + dx;
          const fy = target.gy + dy;
          const fs = gridToScreen(fx, fy);
          const f = this.previewFootprint[i++]!;
          f.setTexture("tile_grass");
          f.setPosition(fs.x, fs.y);
          f.setDepth(depth(fx, fy) + 0.2);
          f.setAlpha(0.55);
          f.setTint(removable ? 0xff5577 : 0x888888);
          f.setVisible(true);
        }
      }
      for (let j = i; j < this.previewFootprint.length; j++) {
        this.previewFootprint[j]!.setVisible(false);
      }
      this.previewMain.setVisible(false);
      return;
    }

    this.hidePreview();
  }

  private handlePointer(p: Phaser.Input.Pointer) {
    const cam = this.cameras.main;
    const wx = p.worldX;
    const wy = p.worldY;
    const { gx, gy } = screenToGrid(wx, wy);
    if (gx < 0 || gx >= MAP_W || gy < 0 || gy >= MAP_H) return;
    const key = gy * MAP_W + gx;
    if (key === this.lastPaintedKey) return;
    this.lastPaintedKey = key;

    if (this.mode === "path") {
      if (this.park.paintPath(gx, gy, PATH_COST)) {
        this.refreshTile(gx, gy);
      }
    } else if (this.mode === "carousel") {
      this.tryPlaceRide("carousel", gx, gy);
    } else if (this.mode === "demolish") {
      const result = this.park.demolish(gx, gy);
      if (result === "path") {
        this.refreshTile(gx, gy);
      } else if (result === "ride") {
        // Find and remove the sprite (we removed from park.rides already).
        for (const [id, spr] of this.rideSprites) {
          if (!this.park.rides.find((r) => r.id === id)) {
            spr.destroy();
            this.rideSprites.delete(id);
          }
        }
      }
    }
    void cam;
  }

  private tryPlaceRide(type: RideType, gx: number, gy: number) {
    // The pointer is at one tile; treat that tile as the top-left of the footprint.
    const ride = this.park.placeRide(type, gx, gy);
    if (!ride) {
      this.flashRed(gx, gy);
      return;
    }
    const sprite = new RideSprite(this, ride);
    this.rideSprites.set(ride.id, sprite);
  }

  private flashRed(gx: number, gy: number) {
    const img = this.tileSprites[gy]?.[gx];
    if (!img) return;
    img.setTint(0xff5577);
    this.time.delayedCall(180, () => img.clearTint());
  }

  refreshTile(gx: number, gy: number) {
    const img = this.tileSprites[gy]?.[gx];
    if (!img) return;
    const key = this.park.tiles[gy]![gx] === "path" ? "tile_path" : "tile_grass";
    img.setTexture(key);
  }

  override update(_time: number, delta: number) {
    // Camera pan via arrow keys.
    const cam = this.cameras.main;
    const speed = (PAN_KEY_PX_PER_SEC * delta) / 1000 / cam.zoom;
    if (this.cursors.left?.isDown) cam.scrollX -= speed;
    if (this.cursors.right?.isDown) cam.scrollX += speed;
    if (this.cursors.up?.isDown) cam.scrollY -= speed;
    if (this.cursors.down?.isDown) cam.scrollY += speed;

    if (this.paused) return;

    // Advance the in-game day clock.
    this.park.dayProgressMs += delta;
    while (this.park.dayProgressMs >= DAY_DURATION_MS) {
      this.park.dayProgressMs -= DAY_DURATION_MS;
      this.park.currentDay += 1;
    }

    // Spawn guests.
    this.spawnTimer += delta;
    if (this.spawnTimer >= GUEST_SPAWN_INTERVAL_MS && this.guests.length < GUEST_MAX) {
      this.spawnTimer = 0;
      const g = new Guest(this, this.park, ENTRANCE_GX, ENTRANCE_GY);
      this.guests.push(g);
    }

    // Tick guests.
    const survivors: Guest[] = [];
    for (const g of this.guests) {
      const done = g.tick(delta);
      if (done) {
        g.destroy();
      } else {
        survivors.push(g);
      }
    }
    this.guests = survivors;

    // Refresh capacity labels and spin state from authoritative park counts.
    const camZoom = this.cameras.main.zoom;
    for (const [id, sprite] of this.rideSprites) {
      const count = this.park.ridersOn(id);
      sprite.setCapacity(count);
      sprite.matchCameraZoom(camZoom);
      if (count > 0) sprite.startSpin();
      else sprite.stopSpin();
    }

    // Autosave.
    this.saveTimer += delta;
    if (this.saveTimer >= AUTOSAVE_INTERVAL_MS) {
      this.saveTimer = 0;
      if (this.activeSaveId) SaveManager.save(this.activeSaveId, this.park.toJSON());
    }
  }

  flushSave() {
    if (this.activeSaveId) SaveManager.save(this.activeSaveId, this.park.toJSON());
  }

  returnToMenu() {
    this.flushSave();
    SaveManager.setActive(null);
    this.scene.stop("UI");
    this.scene.start("Menu");
  }
}

void RIDES; // tree-shake guard



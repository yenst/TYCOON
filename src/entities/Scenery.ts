import Phaser from "phaser";
import { gridToScreen, depth } from "../iso";
import { MAP_W, MAP_H, TILE_W, TILE_H } from "../config";

import cherryTreeUrl from "../../public/assets/scenery/cherry_tree.png" with { type: "file" };
import mintTreeUrl from "../../public/assets/scenery/mint_tree.png" with { type: "file" };
import lavenderTreeUrl from "../../public/assets/scenery/lavender_tree.png" with { type: "file" };
import berryBushUrl from "../../public/assets/scenery/berry_bush.png" with { type: "file" };
import flowerPatchUrl from "../../public/assets/scenery/flower_patch.png" with { type: "file" };
import worldBackgroundUrl from "../../public/assets/scenery/world_background.png" with { type: "file" };

export type SceneryType =
  | "cherry_tree"
  | "mint_tree"
  | "lavender_tree"
  | "berry_bush"
  | "flower_patch";

interface SceneryDef {
  textureKey: string;
  /** Relative weight used during random placement. */
  weight: number;
  /** Visual scale — bushes / flowers are smaller than trees. */
  scale: number;
}

const DEFS: Record<SceneryType, SceneryDef> = {
  cherry_tree: { textureKey: "scenery_cherry_tree", weight: 3, scale: 1.0 },
  mint_tree: { textureKey: "scenery_mint_tree", weight: 3, scale: 1.0 },
  lavender_tree: { textureKey: "scenery_lavender_tree", weight: 2, scale: 1.0 },
  berry_bush: { textureKey: "scenery_berry_bush", weight: 4, scale: 0.85 },
  flower_patch: { textureKey: "scenery_flower_patch", weight: 5, scale: 0.85 },
};

const TYPE_ORDER: SceneryType[] = ["cherry_tree", "mint_tree", "lavender_tree", "berry_bush", "flower_patch"];

export interface SceneryItem {
  type: SceneryType;
  gx: number;
  gy: number;
}

export const SceneryAssets = {
  preload(scene: Phaser.Scene) {
    scene.load.image("scenery_cherry_tree", cherryTreeUrl);
    scene.load.image("scenery_mint_tree", mintTreeUrl);
    scene.load.image("scenery_lavender_tree", lavenderTreeUrl);
    scene.load.image("scenery_berry_bush", berryBushUrl);
    scene.load.image("scenery_flower_patch", flowerPatchUrl);
    scene.load.image("world_background", worldBackgroundUrl);
  },
};

/**
 * Render a single artist-composed image as the world backdrop. Sized to cover
 * the full extended camera bounds and placed behind every tile via negative
 * depth, so the playable iso grid sits on top of it.
 */
export function renderWorldBackground(scene: Phaser.Scene): Phaser.GameObjects.Image {
  // Centre on the map's visual middle: avg of corner projections.
  const c0 = gridToScreen(0, 0);
  const c1 = gridToScreen(MAP_W - 1, MAP_H - 1);
  const cx = (c0.x + c1.x) / 2;
  const cy = (c0.y + c1.y) / 2;
  const img = scene.add.image(cx, cy, "world_background");
  img.setDepth(-1000);
  // Scale to cover the extended camera bounds (map projection + ~8 tile pad).
  const wantedW = (MAP_W + 16) * TILE_W;
  const wantedH = (MAP_H + 16) * TILE_H * 2; // *2 because iso half-height
  const tex = img.texture.getSourceImage();
  const srcW = (tex as { width: number }).width || img.width;
  const srcH = (tex as { height: number }).height || img.height;
  const scale = Math.max(wantedW / srcW, wantedH / srcH);
  img.setScale(scale);
  return img;
}

/**
 * Procedurally seed a "scenery belt" around the park. Used once at park
 * creation; the resulting list is saved with the park so it stays stable.
 *
 * Algorithm: every tile in a `RING` band outside the playable map has a
 * `density`-weighted chance to spawn scenery, picked by weighted random.
 */
// Procedural scenery scatter is currently disabled — looks too cluttered.
// Kept around for future use; new parks just get an empty list and the world
// background image (rendered separately in GameScene) handles "outside" visuals.
export function generateScenery(): SceneryItem[] {
  return [];
}

/** Renders all scenery items as world sprites with iso depth sorting. */
export function renderScenery(scene: Phaser.Scene, items: SceneryItem[]): Phaser.GameObjects.Image[] {
  const sprites: Phaser.GameObjects.Image[] = [];
  for (const item of items) {
    const def = DEFS[item.type];
    const s = gridToScreen(item.gx, item.gy);
    const img = scene.add.image(s.x, s.y, def.textureKey);
    img.setOrigin(0.5, 0.85);
    img.setScale(def.scale);
    img.setDepth(depth(item.gx, item.gy) + 0.4);
    sprites.push(img);
  }
  return sprites;
}




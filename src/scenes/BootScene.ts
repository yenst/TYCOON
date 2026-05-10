import Phaser from "phaser";
import { RideAssets } from "../entities/Ride";
import { GuestAssets } from "../entities/GuestAssets";

import tileGrassUrl from "../../public/assets/tiles/grass.png" with { type: "file" };
import tilePathUrl from "../../public/assets/tiles/path.png" with { type: "file" };
import entranceUrl from "../../public/assets/buildings/entrance.png" with { type: "file" };

export class BootScene extends Phaser.Scene {
  constructor() {
    super("Boot");
  }

  preload() {
    this.load.image("tile_grass", tileGrassUrl);
    this.load.image("tile_path", tilePathUrl);
    this.load.image("entrance", entranceUrl);
    RideAssets.preload(this);
    GuestAssets.preload(this);
  }

  create() {
    // Pixel-art textures stay NEAREST; everything else (text, etc.) defaults
    // to LINEAR thanks to the global render config.
    for (const key of this.textures.getTextureKeys()) {
      this.textures.get(key).setFilter(Phaser.Textures.FilterMode.NEAREST);
    }
    RideAssets.registerAnims(this);
    GuestAssets.registerAnims(this);
    this.scene.start("Menu");
  }
}

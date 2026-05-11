import Phaser from "phaser";
import { RideAssets } from "../entities/Ride";
import { GuestAssets } from "../entities/GuestAssets";
import { SceneryAssets } from "../entities/Scenery";

import tileGrassUrl from "../../public/assets/tiles/grass.png" with { type: "file" };
import tilePathUrl from "../../public/assets/tiles/path.png" with { type: "file" };
import tileWater0 from "../../public/assets/tiles/water_anim/00.png" with { type: "file" };
import tileWater1 from "../../public/assets/tiles/water_anim/01.png" with { type: "file" };
import tileWater2 from "../../public/assets/tiles/water_anim/02.png" with { type: "file" };
import tileWater3 from "../../public/assets/tiles/water_anim/03.png" with { type: "file" };
import tileBridgeUrl from "../../public/assets/tiles/bridge.png" with { type: "file" };
import entranceUrl from "../../public/assets/buildings/entrance.png" with { type: "file" };
import logoUrl from "../../public/assets/ui/logo.png" with { type: "file" };

export class BootScene extends Phaser.Scene {
  constructor() {
    super("Boot");
  }

  preload() {
    this.load.image("tile_grass", tileGrassUrl);
    this.load.image("tile_path", tilePathUrl);
    this.load.image("tile_water_0", tileWater0);
    this.load.image("tile_water_1", tileWater1);
    this.load.image("tile_water_2", tileWater2);
    this.load.image("tile_water_3", tileWater3);
    this.load.image("tile_water", tileWater0); // base key (used for static lookups + preview)
    this.load.image("tile_bridge", tileBridgeUrl);
    this.load.image("entrance", entranceUrl);
    this.load.image("logo", logoUrl);
    RideAssets.preload(this);
    GuestAssets.preload(this);
    SceneryAssets.preload(this);
  }

  create() {
    // Pixel-art textures stay NEAREST; everything else (text, etc.) defaults
    // to LINEAR thanks to the global render config.
    for (const key of this.textures.getTextureKeys()) {
      this.textures.get(key).setFilter(Phaser.Textures.FilterMode.NEAREST);
    }
    RideAssets.registerAnims(this);
    GuestAssets.registerAnims(this);
    if (!this.anims.exists("water_shimmer")) {
      this.anims.create({
        key: "water_shimmer",
        frames: [
          { key: "tile_water_0" },
          { key: "tile_water_1" },
          { key: "tile_water_2" },
          { key: "tile_water_3" },
        ],
        frameRate: 1.2,
        repeat: -1,
      });
    }
    this.scene.start("Menu");
  }
}

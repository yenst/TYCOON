import Phaser from "phaser";
import { RideAssets } from "../entities/Ride";

import tileGrassUrl from "../../public/assets/tile_grass.png" with { type: "file" };
import tilePathUrl from "../../public/assets/tile_path.png" with { type: "file" };
import entranceUrl from "../../public/assets/entrance.png" with { type: "file" };

import guestV1Se from "../../public/assets/guest_v1_se.png" with { type: "file" };
import guestV1Sw from "../../public/assets/guest_v1_sw.png" with { type: "file" };
import guestV1Ne from "../../public/assets/guest_v1_ne.png" with { type: "file" };
import guestV1Nw from "../../public/assets/guest_v1_nw.png" with { type: "file" };

import guestV2Se from "../../public/assets/guest_v2_se.png" with { type: "file" };
import guestV2Sw from "../../public/assets/guest_v2_sw.png" with { type: "file" };
import guestV2Ne from "../../public/assets/guest_v2_ne.png" with { type: "file" };
import guestV2Nw from "../../public/assets/guest_v2_nw.png" with { type: "file" };

import guestV3Se from "../../public/assets/guest_v3_se.png" with { type: "file" };
import guestV3Sw from "../../public/assets/guest_v3_sw.png" with { type: "file" };
import guestV3Ne from "../../public/assets/guest_v3_ne.png" with { type: "file" };
import guestV3Nw from "../../public/assets/guest_v3_nw.png" with { type: "file" };

import guestV4Se from "../../public/assets/guest_v4_se.png" with { type: "file" };
import guestV4Sw from "../../public/assets/guest_v4_sw.png" with { type: "file" };
import guestV4Ne from "../../public/assets/guest_v4_ne.png" with { type: "file" };
import guestV4Nw from "../../public/assets/guest_v4_nw.png" with { type: "file" };

import guestV5Se from "../../public/assets/guest_v5_se.png" with { type: "file" };
import guestV5Sw from "../../public/assets/guest_v5_sw.png" with { type: "file" };
import guestV5Ne from "../../public/assets/guest_v5_ne.png" with { type: "file" };
import guestV5Nw from "../../public/assets/guest_v5_nw.png" with { type: "file" };

import guestV6Se from "../../public/assets/guest_v6_se.png" with { type: "file" };
import guestV6Sw from "../../public/assets/guest_v6_sw.png" with { type: "file" };
import guestV6Ne from "../../public/assets/guest_v6_ne.png" with { type: "file" };
import guestV6Nw from "../../public/assets/guest_v6_nw.png" with { type: "file" };

import guestV7Se from "../../public/assets/guest_v7_se.png" with { type: "file" };
import guestV7Sw from "../../public/assets/guest_v7_sw.png" with { type: "file" };
import guestV7Ne from "../../public/assets/guest_v7_ne.png" with { type: "file" };
import guestV7Nw from "../../public/assets/guest_v7_nw.png" with { type: "file" };

import guestV8Se from "../../public/assets/guest_v8_se.png" with { type: "file" };
import guestV8Sw from "../../public/assets/guest_v8_sw.png" with { type: "file" };
import guestV8Ne from "../../public/assets/guest_v8_ne.png" with { type: "file" };
import guestV8Nw from "../../public/assets/guest_v8_nw.png" with { type: "file" };

import guestV9Se from "../../public/assets/guest_v9_se.png" with { type: "file" };
import guestV9Sw from "../../public/assets/guest_v9_sw.png" with { type: "file" };
import guestV9Ne from "../../public/assets/guest_v9_ne.png" with { type: "file" };
import guestV9Nw from "../../public/assets/guest_v9_nw.png" with { type: "file" };

import guestV10Se from "../../public/assets/guest_v10_se.png" with { type: "file" };
import guestV10Sw from "../../public/assets/guest_v10_sw.png" with { type: "file" };
import guestV10Ne from "../../public/assets/guest_v10_ne.png" with { type: "file" };
import guestV10Nw from "../../public/assets/guest_v10_nw.png" with { type: "file" };

const GUEST_URLS: Record<number, Record<"se" | "sw" | "ne" | "nw", string>> = {
  1: { se: guestV1Se, sw: guestV1Sw, ne: guestV1Ne, nw: guestV1Nw },
  2: { se: guestV2Se, sw: guestV2Sw, ne: guestV2Ne, nw: guestV2Nw },
  3: { se: guestV3Se, sw: guestV3Sw, ne: guestV3Ne, nw: guestV3Nw },
  4: { se: guestV4Se, sw: guestV4Sw, ne: guestV4Ne, nw: guestV4Nw },
  5: { se: guestV5Se, sw: guestV5Sw, ne: guestV5Ne, nw: guestV5Nw },
  6: { se: guestV6Se, sw: guestV6Sw, ne: guestV6Ne, nw: guestV6Nw },
  7: { se: guestV7Se, sw: guestV7Sw, ne: guestV7Ne, nw: guestV7Nw },
  8: { se: guestV8Se, sw: guestV8Sw, ne: guestV8Ne, nw: guestV8Nw },
  9: { se: guestV9Se, sw: guestV9Sw, ne: guestV9Ne, nw: guestV9Nw },
  10: { se: guestV10Se, sw: guestV10Sw, ne: guestV10Ne, nw: guestV10Nw },
};

export class BootScene extends Phaser.Scene {
  constructor() {
    super("Boot");
  }

  preload() {
    this.load.image("tile_grass", tileGrassUrl);
    this.load.image("tile_path", tilePathUrl);
    this.load.image("entrance", entranceUrl);
    RideAssets.preload(this);
    for (const [vStr, dirs] of Object.entries(GUEST_URLS)) {
      const v = Number(vStr);
      this.load.image(`guest_v${v}_se`, dirs.se);
      this.load.image(`guest_v${v}_sw`, dirs.sw);
      this.load.image(`guest_v${v}_ne`, dirs.ne);
      this.load.image(`guest_v${v}_nw`, dirs.nw);
    }
  }

  create() {
    // Force NEAREST sampling on every loaded image texture so the pixel-art
    // sprites stay crisp; Text textures (created later by Phaser) default to
    // LINEAR which keeps menu/HUD text smooth.
    for (const key of this.textures.getTextureKeys()) {
      const tex = this.textures.get(key);
      tex.setFilter(Phaser.Textures.FilterMode.NEAREST);
    }
    RideAssets.registerAnims(this);
    this.scene.start("Menu");
  }
}



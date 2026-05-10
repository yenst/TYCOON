import Phaser from "phaser";
import { GUEST_VARIANT_COUNT } from "../config";

import v1Se from "../../public/assets/guests/v1/se.png" with { type: "file" };
import v1Sw from "../../public/assets/guests/v1/sw.png" with { type: "file" };
import v1Ne from "../../public/assets/guests/v1/ne.png" with { type: "file" };
import v1Nw from "../../public/assets/guests/v1/nw.png" with { type: "file" };
import v2Se from "../../public/assets/guests/v2/se.png" with { type: "file" };
import v2Sw from "../../public/assets/guests/v2/sw.png" with { type: "file" };
import v2Ne from "../../public/assets/guests/v2/ne.png" with { type: "file" };
import v2Nw from "../../public/assets/guests/v2/nw.png" with { type: "file" };
import v3Se from "../../public/assets/guests/v3/se.png" with { type: "file" };
import v3Sw from "../../public/assets/guests/v3/sw.png" with { type: "file" };
import v3Ne from "../../public/assets/guests/v3/ne.png" with { type: "file" };
import v3Nw from "../../public/assets/guests/v3/nw.png" with { type: "file" };
import v4Se from "../../public/assets/guests/v4/se.png" with { type: "file" };
import v4Sw from "../../public/assets/guests/v4/sw.png" with { type: "file" };
import v4Ne from "../../public/assets/guests/v4/ne.png" with { type: "file" };
import v4Nw from "../../public/assets/guests/v4/nw.png" with { type: "file" };
import v5Se from "../../public/assets/guests/v5/se.png" with { type: "file" };
import v5Sw from "../../public/assets/guests/v5/sw.png" with { type: "file" };
import v5Ne from "../../public/assets/guests/v5/ne.png" with { type: "file" };
import v5Nw from "../../public/assets/guests/v5/nw.png" with { type: "file" };
import v6Se from "../../public/assets/guests/v6/se.png" with { type: "file" };
import v6Sw from "../../public/assets/guests/v6/sw.png" with { type: "file" };
import v6Ne from "../../public/assets/guests/v6/ne.png" with { type: "file" };
import v6Nw from "../../public/assets/guests/v6/nw.png" with { type: "file" };
import v7Se from "../../public/assets/guests/v7/se.png" with { type: "file" };
import v7Sw from "../../public/assets/guests/v7/sw.png" with { type: "file" };
import v7Ne from "../../public/assets/guests/v7/ne.png" with { type: "file" };
import v7Nw from "../../public/assets/guests/v7/nw.png" with { type: "file" };
import v8Se from "../../public/assets/guests/v8/se.png" with { type: "file" };
import v8Sw from "../../public/assets/guests/v8/sw.png" with { type: "file" };
import v8Ne from "../../public/assets/guests/v8/ne.png" with { type: "file" };
import v8Nw from "../../public/assets/guests/v8/nw.png" with { type: "file" };
import v9Se from "../../public/assets/guests/v9/se.png" with { type: "file" };
import v9Sw from "../../public/assets/guests/v9/sw.png" with { type: "file" };
import v9Ne from "../../public/assets/guests/v9/ne.png" with { type: "file" };
import v9Nw from "../../public/assets/guests/v9/nw.png" with { type: "file" };
import v10Se from "../../public/assets/guests/v10/se.png" with { type: "file" };
import v10Sw from "../../public/assets/guests/v10/sw.png" with { type: "file" };
import v10Ne from "../../public/assets/guests/v10/ne.png" with { type: "file" };
import v10Nw from "../../public/assets/guests/v10/nw.png" with { type: "file" };

// Walk animation frames — currently only v10 has them.
import v10WalkSe0 from "../../public/assets/guests/v10/walk/se_00.png" with { type: "file" };
import v10WalkSe1 from "../../public/assets/guests/v10/walk/se_01.png" with { type: "file" };
import v10WalkSe2 from "../../public/assets/guests/v10/walk/se_02.png" with { type: "file" };
import v10WalkSe3 from "../../public/assets/guests/v10/walk/se_03.png" with { type: "file" };
import v10WalkSe4 from "../../public/assets/guests/v10/walk/se_04.png" with { type: "file" };
import v10WalkSe5 from "../../public/assets/guests/v10/walk/se_05.png" with { type: "file" };
import v10WalkSw0 from "../../public/assets/guests/v10/walk/sw_00.png" with { type: "file" };
import v10WalkSw1 from "../../public/assets/guests/v10/walk/sw_01.png" with { type: "file" };
import v10WalkSw2 from "../../public/assets/guests/v10/walk/sw_02.png" with { type: "file" };
import v10WalkSw3 from "../../public/assets/guests/v10/walk/sw_03.png" with { type: "file" };
import v10WalkSw4 from "../../public/assets/guests/v10/walk/sw_04.png" with { type: "file" };
import v10WalkSw5 from "../../public/assets/guests/v10/walk/sw_05.png" with { type: "file" };
import v10WalkNe0 from "../../public/assets/guests/v10/walk/ne_00.png" with { type: "file" };
import v10WalkNe1 from "../../public/assets/guests/v10/walk/ne_01.png" with { type: "file" };
import v10WalkNe2 from "../../public/assets/guests/v10/walk/ne_02.png" with { type: "file" };
import v10WalkNe3 from "../../public/assets/guests/v10/walk/ne_03.png" with { type: "file" };
import v10WalkNe4 from "../../public/assets/guests/v10/walk/ne_04.png" with { type: "file" };
import v10WalkNe5 from "../../public/assets/guests/v10/walk/ne_05.png" with { type: "file" };
import v10WalkNw0 from "../../public/assets/guests/v10/walk/nw_00.png" with { type: "file" };
import v10WalkNw1 from "../../public/assets/guests/v10/walk/nw_01.png" with { type: "file" };
import v10WalkNw2 from "../../public/assets/guests/v10/walk/nw_02.png" with { type: "file" };
import v10WalkNw3 from "../../public/assets/guests/v10/walk/nw_03.png" with { type: "file" };
import v10WalkNw4 from "../../public/assets/guests/v10/walk/nw_04.png" with { type: "file" };
import v10WalkNw5 from "../../public/assets/guests/v10/walk/nw_05.png" with { type: "file" };

export type GuestDir = "se" | "sw" | "ne" | "nw";

const STATIC_URLS: Record<number, Record<GuestDir, string>> = {
  1: { se: v1Se, sw: v1Sw, ne: v1Ne, nw: v1Nw },
  2: { se: v2Se, sw: v2Sw, ne: v2Ne, nw: v2Nw },
  3: { se: v3Se, sw: v3Sw, ne: v3Ne, nw: v3Nw },
  4: { se: v4Se, sw: v4Sw, ne: v4Ne, nw: v4Nw },
  5: { se: v5Se, sw: v5Sw, ne: v5Ne, nw: v5Nw },
  6: { se: v6Se, sw: v6Sw, ne: v6Ne, nw: v6Nw },
  7: { se: v7Se, sw: v7Sw, ne: v7Ne, nw: v7Nw },
  8: { se: v8Se, sw: v8Sw, ne: v8Ne, nw: v8Nw },
  9: { se: v9Se, sw: v9Sw, ne: v9Ne, nw: v9Nw },
  10: { se: v10Se, sw: v10Sw, ne: v10Ne, nw: v10Nw },
};

const V10_WALK: Record<GuestDir, string[]> = {
  se: [v10WalkSe0, v10WalkSe1, v10WalkSe2, v10WalkSe3, v10WalkSe4, v10WalkSe5],
  sw: [v10WalkSw0, v10WalkSw1, v10WalkSw2, v10WalkSw3, v10WalkSw4, v10WalkSw5],
  ne: [v10WalkNe0, v10WalkNe1, v10WalkNe2, v10WalkNe3, v10WalkNe4, v10WalkNe5],
  nw: [v10WalkNw0, v10WalkNw1, v10WalkNw2, v10WalkNw3, v10WalkNw4, v10WalkNw5],
};

/** Animations that exist for a given variant — keyed by direction. */
export const GUEST_WALK_ANIMS: Record<number, Record<GuestDir, string>> = {
  10: { se: "guest_v10_walk_se", sw: "guest_v10_walk_sw", ne: "guest_v10_walk_ne", nw: "guest_v10_walk_nw" },
};

const walkFrameKey = (variant: number, dir: GuestDir, idx: number) =>
  `guest_v${variant}_walk_${dir}_${idx.toString().padStart(2, "0")}`;

export const guestStaticKey = (variant: number, dir: GuestDir) => `guest_v${variant}_${dir}`;

export const GuestAssets = {
  preload(scene: Phaser.Scene) {
    for (let v = 1; v <= GUEST_VARIANT_COUNT; v++) {
      const dirs = STATIC_URLS[v];
      if (!dirs) continue;
      for (const d of ["se", "sw", "ne", "nw"] as GuestDir[]) {
        scene.load.image(guestStaticKey(v, d), dirs[d]);
      }
    }
    // v10 walk frames
    for (const d of ["se", "sw", "ne", "nw"] as GuestDir[]) {
      const frames = V10_WALK[d];
      for (let i = 0; i < frames.length; i++) {
        scene.load.image(walkFrameKey(10, d, i), frames[i]!);
      }
    }
  },

  registerAnims(scene: Phaser.Scene) {
    for (const d of ["se", "sw", "ne", "nw"] as GuestDir[]) {
      const key = GUEST_WALK_ANIMS[10]![d];
      if (scene.anims.exists(key)) continue;
      const frames = V10_WALK[d].map((_, i) => ({ key: walkFrameKey(10, d, i) }));
      scene.anims.create({
        key,
        frames,
        frameRate: 10,
        repeat: -1,
      });
    }
  },
};

import Phaser from "phaser";
import { type RideInstance } from "../state/Park";
import { RIDES } from "../config";
import { gridToScreen, depth } from "../iso";
import { crispText } from "../util/crispText";

import rideCarouselUrl from "../../public/assets/ride_carousel.png" with { type: "file" };
import carouselAnim00 from "../../public/assets/ride_carousel_anim_00.png" with { type: "file" };
import carouselAnim01 from "../../public/assets/ride_carousel_anim_01.png" with { type: "file" };
import carouselAnim02 from "../../public/assets/ride_carousel_anim_02.png" with { type: "file" };
import carouselAnim03 from "../../public/assets/ride_carousel_anim_03.png" with { type: "file" };
import carouselAnim04 from "../../public/assets/ride_carousel_anim_04.png" with { type: "file" };
import carouselAnim05 from "../../public/assets/ride_carousel_anim_05.png" with { type: "file" };
import carouselAnim06 from "../../public/assets/ride_carousel_anim_06.png" with { type: "file" };
import carouselAnim07 from "../../public/assets/ride_carousel_anim_07.png" with { type: "file" };
import carouselAnim08 from "../../public/assets/ride_carousel_anim_08.png" with { type: "file" };
import carouselAnim09 from "../../public/assets/ride_carousel_anim_09.png" with { type: "file" };
import carouselAnim10 from "../../public/assets/ride_carousel_anim_10.png" with { type: "file" };
import carouselAnim11 from "../../public/assets/ride_carousel_anim_11.png" with { type: "file" };
import carouselAnim12 from "../../public/assets/ride_carousel_anim_12.png" with { type: "file" };
import carouselAnim13 from "../../public/assets/ride_carousel_anim_13.png" with { type: "file" };
import carouselAnim14 from "../../public/assets/ride_carousel_anim_14.png" with { type: "file" };
import carouselAnim15 from "../../public/assets/ride_carousel_anim_15.png" with { type: "file" };

const CAROUSEL_ANIM_FRAMES: string[] = [
  carouselAnim00, carouselAnim01, carouselAnim02, carouselAnim03,
  carouselAnim04, carouselAnim05, carouselAnim06, carouselAnim07,
  carouselAnim08, carouselAnim09, carouselAnim10, carouselAnim11,
  carouselAnim12, carouselAnim13, carouselAnim14, carouselAnim15,
];
const carouselAnimKey = (i: number) => `ride_carousel_anim_${i.toString().padStart(2, "0")}`;

const RIDE_ANIM_KEYS: Record<string, string> = {
  carousel: "carousel_spin",
};

/** Static helpers for ride assets — call from BootScene. */
export const RideAssets = {
  preload(scene: Phaser.Scene) {
    scene.load.image("ride_carousel", rideCarouselUrl);
    for (let i = 0; i < CAROUSEL_ANIM_FRAMES.length; i++) {
      scene.load.image(carouselAnimKey(i), CAROUSEL_ANIM_FRAMES[i]!);
    }
  },
  registerAnims(scene: Phaser.Scene) {
    if (!scene.anims.exists("carousel_spin")) {
      scene.anims.create({
        key: "carousel_spin",
        frames: CAROUSEL_ANIM_FRAMES.map((_, i) => ({ key: carouselAnimKey(i) })),
        frameRate: 12,
        repeat: -1,
      });
    }
  },
};

export class RideSprite {
  scene: Phaser.Scene;
  data: RideInstance;
  sprite: Phaser.GameObjects.Sprite;
  spinning = false;
  capacityBg: Phaser.GameObjects.Rectangle;
  capacityText: Phaser.GameObjects.Text;
  lastRiders = -1;

  constructor(scene: Phaser.Scene, data: RideInstance) {
    this.scene = scene;
    this.data = data;
    const def = RIDES[data.type];
    // Anchor the sprite at the centre of the footprint, base touching the back-most tile.
    const cx = data.gx + (def.width - 1) / 2;
    const cy = data.gy + (def.height - 1) / 2;
    const s = gridToScreen(cx, cy);
    this.sprite = scene.add.sprite(s.x, s.y, def.textureKey);
    // Origin: bottom-centre so the sprite stands on the tile rather than floats.
    this.sprite.setOrigin(0.5, 0.85);
    // Depth: use the back corner of the footprint so it sorts behind tiles in front.
    const baseDepth = depth(data.gx + def.width - 1, data.gy + def.height - 1) + 0.5;
    this.sprite.setDepth(baseDepth);

    // Capacity label floats above the ride. crispText() handles text being
    // rasterized at higher density and using LINEAR sampling so pixelArt:true
    // doesn't make the digits chunky.
    const labelY = s.y - this.sprite.displayHeight * 0.85 - 14;
    this.capacityBg = scene.add
      .rectangle(s.x, labelY, 56, 22, 0xffffff, 0.96)
      .setOrigin(0.5, 0.5)
      .setStrokeStyle(1, 0xe5e7eb)
      .setDepth(baseDepth + 0.05);
    this.capacityText = crispText(
      scene.add.text(s.x, labelY, `0/${def.maxRiders}`, {
        color: "#111827",
        fontFamily: "system-ui, sans-serif",
        fontSize: "13px",
        fontStyle: "600",
      }),
    )
      .setOrigin(0.5, 0.55)
      .setDepth(baseDepth + 0.06);
  }

  setCapacity(current: number) {
    const def = RIDES[this.data.type];
    if (current !== this.lastRiders) {
      this.lastRiders = current;
      this.capacityText.setText(`${current}/${def.maxRiders}`);
    }
    if (current >= def.maxRiders) {
      this.capacityBg.setFillStyle(0x111827, 1);
      this.capacityText.setColor("#ffffff");
    } else {
      this.capacityBg.setFillStyle(0xffffff, 0.96);
      this.capacityText.setColor("#111827");
    }
  }

  /**
   * Counter-scale the floating label by 1/zoom so it stays a constant size on
   * screen regardless of camera zoom. Without this the label rasterizes at one
   * resolution then gets stretched/squashed by the camera, going chunky/blurry.
   */
  matchCameraZoom(camZoom: number) {
    if (camZoom <= 0) return;
    const inv = 1 / camZoom;
    this.capacityText.setScale(inv);
    this.capacityBg.setScale(inv);
  }

  startSpin() {
    if (this.spinning) return;
    const animKey = RIDE_ANIM_KEYS[this.data.type];
    if (!animKey || !this.scene.anims.exists(animKey)) return;
    this.sprite.play(animKey);
    this.spinning = true;
  }

  stopSpin() {
    if (!this.spinning) return;
    this.sprite.stop();
    this.sprite.setTexture(RIDES[this.data.type].textureKey);
    this.spinning = false;
  }

  destroy() {
    this.sprite.destroy();
    this.capacityBg.destroy();
    this.capacityText.destroy();
  }
}



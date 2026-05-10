import Phaser from "phaser";
import { type RideInstance } from "../state/Park";
import { RIDES } from "../config";
import { gridToScreen, depth } from "../iso";
import { crispText } from "../util/crispText";

import rideCarouselUrl from "../../public/assets/rides/carousel.png" with { type: "file" };
import rideSwingsUrl from "../../public/assets/rides/swings.png" with { type: "file" };
import rideBumperCarsUrl from "../../public/assets/rides/bumper_cars.png" with { type: "file" };
import rideFerrisWheelUrl from "../../public/assets/rides/ferris_wheel.png" with { type: "file" };
// Carousel anim frames
import carouselAnim00 from "../../public/assets/rides/carousel_anim/00.png" with { type: "file" };
import carouselAnim01 from "../../public/assets/rides/carousel_anim/01.png" with { type: "file" };
import carouselAnim02 from "../../public/assets/rides/carousel_anim/02.png" with { type: "file" };
import carouselAnim03 from "../../public/assets/rides/carousel_anim/03.png" with { type: "file" };
import carouselAnim04 from "../../public/assets/rides/carousel_anim/04.png" with { type: "file" };
import carouselAnim05 from "../../public/assets/rides/carousel_anim/05.png" with { type: "file" };
import carouselAnim06 from "../../public/assets/rides/carousel_anim/06.png" with { type: "file" };
import carouselAnim07 from "../../public/assets/rides/carousel_anim/07.png" with { type: "file" };
import carouselAnim08 from "../../public/assets/rides/carousel_anim/08.png" with { type: "file" };
import carouselAnim09 from "../../public/assets/rides/carousel_anim/09.png" with { type: "file" };
import carouselAnim10 from "../../public/assets/rides/carousel_anim/10.png" with { type: "file" };
import carouselAnim11 from "../../public/assets/rides/carousel_anim/11.png" with { type: "file" };
import carouselAnim12 from "../../public/assets/rides/carousel_anim/12.png" with { type: "file" };
import carouselAnim13 from "../../public/assets/rides/carousel_anim/13.png" with { type: "file" };
import carouselAnim14 from "../../public/assets/rides/carousel_anim/14.png" with { type: "file" };
import carouselAnim15 from "../../public/assets/rides/carousel_anim/15.png" with { type: "file" };
// Swings anim frames
import swingsAnim00 from "../../public/assets/rides/swings_anim/00.png" with { type: "file" };
import swingsAnim01 from "../../public/assets/rides/swings_anim/01.png" with { type: "file" };
import swingsAnim02 from "../../public/assets/rides/swings_anim/02.png" with { type: "file" };
import swingsAnim03 from "../../public/assets/rides/swings_anim/03.png" with { type: "file" };
import swingsAnim04 from "../../public/assets/rides/swings_anim/04.png" with { type: "file" };
import swingsAnim05 from "../../public/assets/rides/swings_anim/05.png" with { type: "file" };
import swingsAnim06 from "../../public/assets/rides/swings_anim/06.png" with { type: "file" };
import swingsAnim07 from "../../public/assets/rides/swings_anim/07.png" with { type: "file" };
import swingsAnim08 from "../../public/assets/rides/swings_anim/08.png" with { type: "file" };
import swingsAnim09 from "../../public/assets/rides/swings_anim/09.png" with { type: "file" };
import swingsAnim10 from "../../public/assets/rides/swings_anim/10.png" with { type: "file" };
import swingsAnim11 from "../../public/assets/rides/swings_anim/11.png" with { type: "file" };
import swingsAnim12 from "../../public/assets/rides/swings_anim/12.png" with { type: "file" };
import swingsAnim13 from "../../public/assets/rides/swings_anim/13.png" with { type: "file" };
import swingsAnim14 from "../../public/assets/rides/swings_anim/14.png" with { type: "file" };
import swingsAnim15 from "../../public/assets/rides/swings_anim/15.png" with { type: "file" };
// Bumper cars anim frames
import bumperCarsAnim00 from "../../public/assets/rides/bumper_cars_anim/00.png" with { type: "file" };
import bumperCarsAnim01 from "../../public/assets/rides/bumper_cars_anim/01.png" with { type: "file" };
import bumperCarsAnim02 from "../../public/assets/rides/bumper_cars_anim/02.png" with { type: "file" };
import bumperCarsAnim03 from "../../public/assets/rides/bumper_cars_anim/03.png" with { type: "file" };
import bumperCarsAnim04 from "../../public/assets/rides/bumper_cars_anim/04.png" with { type: "file" };
import bumperCarsAnim05 from "../../public/assets/rides/bumper_cars_anim/05.png" with { type: "file" };
import bumperCarsAnim06 from "../../public/assets/rides/bumper_cars_anim/06.png" with { type: "file" };
import bumperCarsAnim07 from "../../public/assets/rides/bumper_cars_anim/07.png" with { type: "file" };
import bumperCarsAnim08 from "../../public/assets/rides/bumper_cars_anim/08.png" with { type: "file" };
import bumperCarsAnim09 from "../../public/assets/rides/bumper_cars_anim/09.png" with { type: "file" };
import bumperCarsAnim10 from "../../public/assets/rides/bumper_cars_anim/10.png" with { type: "file" };
import bumperCarsAnim11 from "../../public/assets/rides/bumper_cars_anim/11.png" with { type: "file" };
import bumperCarsAnim12 from "../../public/assets/rides/bumper_cars_anim/12.png" with { type: "file" };
import bumperCarsAnim13 from "../../public/assets/rides/bumper_cars_anim/13.png" with { type: "file" };
import bumperCarsAnim14 from "../../public/assets/rides/bumper_cars_anim/14.png" with { type: "file" };
import bumperCarsAnim15 from "../../public/assets/rides/bumper_cars_anim/15.png" with { type: "file" };
// Ferris wheel anim frames
import ferrisWheelAnim00 from "../../public/assets/rides/ferris_wheel_anim/00.png" with { type: "file" };
import ferrisWheelAnim01 from "../../public/assets/rides/ferris_wheel_anim/01.png" with { type: "file" };
import ferrisWheelAnim02 from "../../public/assets/rides/ferris_wheel_anim/02.png" with { type: "file" };
import ferrisWheelAnim03 from "../../public/assets/rides/ferris_wheel_anim/03.png" with { type: "file" };
import ferrisWheelAnim04 from "../../public/assets/rides/ferris_wheel_anim/04.png" with { type: "file" };
import ferrisWheelAnim05 from "../../public/assets/rides/ferris_wheel_anim/05.png" with { type: "file" };
import ferrisWheelAnim06 from "../../public/assets/rides/ferris_wheel_anim/06.png" with { type: "file" };
import ferrisWheelAnim07 from "../../public/assets/rides/ferris_wheel_anim/07.png" with { type: "file" };
import ferrisWheelAnim08 from "../../public/assets/rides/ferris_wheel_anim/08.png" with { type: "file" };
import ferrisWheelAnim09 from "../../public/assets/rides/ferris_wheel_anim/09.png" with { type: "file" };
import ferrisWheelAnim10 from "../../public/assets/rides/ferris_wheel_anim/10.png" with { type: "file" };
import ferrisWheelAnim11 from "../../public/assets/rides/ferris_wheel_anim/11.png" with { type: "file" };
import ferrisWheelAnim12 from "../../public/assets/rides/ferris_wheel_anim/12.png" with { type: "file" };
import ferrisWheelAnim13 from "../../public/assets/rides/ferris_wheel_anim/13.png" with { type: "file" };
import ferrisWheelAnim14 from "../../public/assets/rides/ferris_wheel_anim/14.png" with { type: "file" };
import ferrisWheelAnim15 from "../../public/assets/rides/ferris_wheel_anim/15.png" with { type: "file" };

const RIDE_ANIM_FRAMES: Record<string, string[]> = {
  carousel: [carouselAnim00, carouselAnim01, carouselAnim02, carouselAnim03, carouselAnim04, carouselAnim05, carouselAnim06, carouselAnim07, carouselAnim08, carouselAnim09, carouselAnim10, carouselAnim11, carouselAnim12, carouselAnim13, carouselAnim14, carouselAnim15],
  swings: [swingsAnim00, swingsAnim01, swingsAnim02, swingsAnim03, swingsAnim04, swingsAnim05, swingsAnim06, swingsAnim07, swingsAnim08, swingsAnim09, swingsAnim10, swingsAnim11, swingsAnim12, swingsAnim13, swingsAnim14, swingsAnim15],
  bumper_cars: [bumperCarsAnim00, bumperCarsAnim01, bumperCarsAnim02, bumperCarsAnim03, bumperCarsAnim04, bumperCarsAnim05, bumperCarsAnim06, bumperCarsAnim07, bumperCarsAnim08, bumperCarsAnim09, bumperCarsAnim10, bumperCarsAnim11, bumperCarsAnim12, bumperCarsAnim13, bumperCarsAnim14, bumperCarsAnim15],
  ferris_wheel: [ferrisWheelAnim00, ferrisWheelAnim01, ferrisWheelAnim02, ferrisWheelAnim03, ferrisWheelAnim04, ferrisWheelAnim05, ferrisWheelAnim06, ferrisWheelAnim07, ferrisWheelAnim08, ferrisWheelAnim09, ferrisWheelAnim10, ferrisWheelAnim11, ferrisWheelAnim12, ferrisWheelAnim13, ferrisWheelAnim14, ferrisWheelAnim15],
};

const animFrameKey = (rideType: string, i: number) =>
  `ride_${rideType}_anim_${i.toString().padStart(2, "0")}`;
const animKey = (rideType: string) => `${rideType}_spin`;

const RIDE_ANIM_KEYS: Record<string, string> = {
  carousel: animKey("carousel"),
  swings: animKey("swings"),
  bumper_cars: animKey("bumper_cars"),
  ferris_wheel: animKey("ferris_wheel"),
};

/** Static helpers for ride assets — call from BootScene. */
export const RideAssets = {
  preload(scene: Phaser.Scene) {
    scene.load.image("ride_carousel", rideCarouselUrl);
    scene.load.image("ride_swings", rideSwingsUrl);
    scene.load.image("ride_bumper_cars", rideBumperCarsUrl);
    scene.load.image("ride_ferris_wheel", rideFerrisWheelUrl);
    for (const [type, frames] of Object.entries(RIDE_ANIM_FRAMES)) {
      for (let i = 0; i < frames.length; i++) {
        scene.load.image(animFrameKey(type, i), frames[i]!);
      }
    }
  },
  registerAnims(scene: Phaser.Scene) {
    for (const [type, frames] of Object.entries(RIDE_ANIM_FRAMES)) {
      const key = animKey(type);
      if (scene.anims.exists(key)) continue;
      scene.anims.create({
        key,
        frames: frames.map((_, i) => ({ key: animFrameKey(type, i) })),
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



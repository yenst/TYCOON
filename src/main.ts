import Phaser from "phaser";
import { BootScene } from "./scenes/BootScene";
import { MenuScene } from "./scenes/MenuScene";
import { GameScene } from "./scenes/GameScene";
import { UIScene } from "./scenes/UIScene";

const game = new Phaser.Game({
  type: Phaser.AUTO,
  parent: "game",
  backgroundColor: "#fef6f9",
  scale: {
    mode: Phaser.Scale.RESIZE,
    width: window.innerWidth,
    height: window.innerHeight,
  },
  // Don't set pixelArt globally — that forces NEAREST sampling on every
  // texture, which makes Text look chunky. Instead BootScene tags the actual
  // pixel-art sprite textures with NEAREST individually after they load.
  render: {
    antialias: true,
    roundPixels: false,
  },
  scene: [BootScene, MenuScene, GameScene, UIScene],
});

void game;

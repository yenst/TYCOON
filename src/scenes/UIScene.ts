import Phaser from "phaser";
import type { GameScene, BuildMode } from "./GameScene";
import { RIDES, PATH_COST, DAY_DURATION_MS } from "../config";
import { crispText } from "../util/crispText";

type ButtonAction = BuildMode | "pause" | "restart" | "menu";

interface ButtonRefs {
  bg: Phaser.GameObjects.Rectangle;
  text: Phaser.GameObjects.Text;
  mode: ButtonAction;
  cost?: number;
}

export class UIScene extends Phaser.Scene {
  cashText!: Phaser.GameObjects.Text;
  dayText!: Phaser.GameObjects.Text;
  dayProgressBg!: Phaser.GameObjects.Rectangle;
  dayProgressFill!: Phaser.GameObjects.Rectangle;
  buttons: ButtonRefs[] = [];
  game_!: GameScene;

  constructor() {
    super("UI");
  }

  create() {
    this.game_ = this.scene.get("Game") as GameScene;
    // Phaser keeps the scene instance alive across stop/start, so the previous
    // run's button refs would point at destroyed objects.
    this.buttons = [];

    const bar = this.add.rectangle(0, 0, this.scale.width, 56, 0xffffff, 1);
    bar.setOrigin(0, 0);
    bar.setStrokeStyle(1, 0xe5e7eb);
    bar.setScrollFactor(0);
    bar.setDepth(1000);

    const buttons: Array<{ label: string; mode: ButtonAction; cost?: number }> = [
      { label: "Select", mode: "select" },
      { label: `Path  $${PATH_COST}`, mode: "path", cost: PATH_COST },
      { label: `Carousel  $${RIDES.carousel.cost}`, mode: "carousel", cost: RIDES.carousel.cost },
      { label: "Demolish", mode: "demolish" },
      { label: "Pause", mode: "pause" },
      { label: "Restart", mode: "restart" },
      { label: "← Menu", mode: "menu" },
    ];

    let x = 12;
    for (const b of buttons) {
      const w = b.label.length * 8 + 24;
      const bg = this.add.rectangle(x, 12, w, 32, 0xf9fafb, 1);
      bg.setOrigin(0, 0);
      bg.setStrokeStyle(1, 0xe5e7eb);
      bg.setScrollFactor(0).setDepth(1001);
      bg.setInteractive({ useHandCursor: true });
      const text = crispText(
        this.add.text(x + w / 2, 28, b.label, {
          color: "#111827",
          fontFamily: "system-ui, sans-serif",
          fontSize: "13px",
          fontStyle: "500",
        }),
      );
      text.setOrigin(0.5, 0.5);
      text.setScrollFactor(0).setDepth(1002);
      bg.on("pointerdown", () => this.handleButton(b.mode));
      this.buttons.push({ bg, text, mode: b.mode, cost: b.cost });
      x += w + 6;
    }

    this.cashText = crispText(
      this.add.text(this.scale.width - 16, 28, "$0", {
        color: "#111827",
        fontFamily: "system-ui, sans-serif",
        fontSize: "18px",
        fontStyle: "600",
      }),
    );
    this.cashText.setOrigin(1, 0.5);
    this.cashText.setScrollFactor(0).setDepth(1002);

    // Day counter + thin progress bar to the left of cash.
    const dayBlockX = this.scale.width - 140;
    this.dayText = crispText(
      this.add.text(dayBlockX, 18, "Day 1", {
        color: "#111827",
        fontFamily: "system-ui, sans-serif",
        fontSize: "13px",
        fontStyle: "600",
      }),
    )
      .setOrigin(0, 0.5)
      .setScrollFactor(0)
      .setDepth(1002);
    this.dayProgressBg = this.add
      .rectangle(dayBlockX, 38, 64, 4, 0xe5e7eb, 1)
      .setOrigin(0, 0.5)
      .setScrollFactor(0)
      .setDepth(1001);
    this.dayProgressFill = this.add
      .rectangle(dayBlockX, 38, 0, 4, 0x111827, 1)
      .setOrigin(0, 0.5)
      .setScrollFactor(0)
      .setDepth(1002);

    // Spacebar = pause
    this.input.keyboard!.on("keydown-SPACE", () => this.togglePause());

    // Resize handling
    const onResize = () => {
      bar.width = this.scale.width;
      this.cashText.x = this.scale.width - 16;
      const dayBlockX = this.scale.width - 140;
      this.dayText.x = dayBlockX;
      this.dayProgressBg.x = dayBlockX;
      this.dayProgressFill.x = dayBlockX;
    };
    this.scale.on("resize", onResize);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.scale.off("resize", onResize);
    });

    this.refresh();
  }

  private handleButton(mode: ButtonAction) {
    if (mode === "pause") {
      this.togglePause();
      return;
    }
    if (mode === "restart") {
      this.confirmRestart();
      return;
    }
    if (mode === "menu") {
      this.game_.returnToMenu();
      return;
    }
    this.game_.mode = mode;
    this.refresh();
  }

  private confirmRestart() {
    if (confirm("Restart the park? This wipes your saved progress.")) {
      this.game_.resetWorld();
      this.game_.mode = "select";
      this.game_.paused = false;
      this.refresh();
    }
  }

  private togglePause() {
    this.game_.paused = !this.game_.paused;
    this.refresh();
  }

  override update() {
    this.refresh();
  }

  private refresh() {
    const cash = this.game_.park?.cash ?? 0;
    this.cashText.setText(`$${cash.toLocaleString()}`);

    const day = this.game_.park?.currentDay ?? 1;
    const progress = (this.game_.park?.dayProgressMs ?? 0) / DAY_DURATION_MS;
    this.dayText.setText(`Day ${day}`);
    this.dayProgressFill.width = 64 * Math.min(1, Math.max(0, progress));

    for (const b of this.buttons) {
      const isActive =
        (b.mode === "pause" && this.game_.paused) ||
        (b.mode !== "pause" && this.game_.mode === b.mode);
      const affordable = b.cost === undefined || cash >= b.cost;
      let fill = 0xf9fafb;
      let stroke = 0xe5e7eb;
      let textColor = "#111827";
      if (isActive) {
        fill = 0x111827;
        stroke = 0x111827;
        textColor = "#ffffff";
      } else if (!affordable) {
        fill = 0xf3f4f6;
        textColor = "#9ca3af";
      }
      b.bg.setFillStyle(fill, 1);
      b.bg.setStrokeStyle(1, stroke);
      b.text.setColor(textColor);
      if (b.mode === "pause") {
        b.text.setText(this.game_.paused ? "Resume" : "Pause");
      }
    }
  }
}


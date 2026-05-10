import Phaser from "phaser";
import type { GameScene, BuildMode } from "./GameScene";
import { RIDES, RIDE_TYPES, PATH_COST, DAY_DURATION_MS, type RideType } from "../config";
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
  statBg!: Phaser.GameObjects.Rectangle;
  statTitle!: Phaser.GameObjects.Text;
  statScoreLabel!: Phaser.GameObjects.Text;
  statScoreValue!: Phaser.GameObjects.Text;
  statRows!: Phaser.GameObjects.Text[];
  buttons: ButtonRefs[] = [];
  ridePanelObjects: Phaser.GameObjects.GameObject[] = [];
  rideCardRefs: Array<{
    bg: Phaser.GameObjects.Rectangle;
    nameText: Phaser.GameObjects.Text;
    subText: Phaser.GameObjects.Text;
    priceText: Phaser.GameObjects.Text;
    type: RideType;
  }> = [];
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
      { label: "Rides", mode: "ride" },
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

    this.buildStatCard();
    this.buildRidePanel();

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
      this.positionStatCard();
    };
    this.scale.on("resize", onResize);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.scale.off("resize", onResize);
    });

    this.refresh();
  }

  private buildStatCard() {
    const w = 220;
    const h = 152;
    this.statBg = this.add
      .rectangle(0, 0, w, h, 0xffffff, 1)
      .setOrigin(1, 1)
      .setStrokeStyle(1, 0xe5e7eb)
      .setScrollFactor(0)
      .setDepth(1000);

    this.statTitle = crispText(
      this.add.text(0, 0, "Park", {
        color: "#6b7280",
        fontFamily: "system-ui, sans-serif",
        fontSize: "11px",
        fontStyle: "600",
      }),
    )
      .setOrigin(0, 0)
      .setScrollFactor(0)
      .setDepth(1002);

    this.statScoreLabel = crispText(
      this.add.text(0, 0, "Score", {
        color: "#6b7280",
        fontFamily: "system-ui, sans-serif",
        fontSize: "11px",
        fontStyle: "500",
      }),
    )
      .setOrigin(0, 0)
      .setScrollFactor(0)
      .setDepth(1002);

    this.statScoreValue = crispText(
      this.add.text(0, 0, "0", {
        color: "#111827",
        fontFamily: "system-ui, sans-serif",
        fontSize: "26px",
        fontStyle: "600",
      }),
    )
      .setOrigin(0, 0)
      .setScrollFactor(0)
      .setDepth(1002);

    this.statRows = [];
    for (let i = 0; i < 4; i++) {
      const t = crispText(
        this.add.text(0, 0, "", {
          color: "#111827",
          fontFamily: "system-ui, sans-serif",
          fontSize: "12px",
        }),
      )
        .setOrigin(0, 0)
        .setScrollFactor(0)
        .setDepth(1002);
      this.statRows.push(t);
    }

    this.positionStatCard();
  }

  private buildRidePanel() {
    const panelW = 240;
    const cardH = 64;
    const pad = 12;
    const headerH = 32;
    const startY = 56 + 12; // below toolbar
    const startX = 12;
    const panelH = headerH + RIDE_TYPES.length * (cardH + 8) + pad;

    const bg = this.add
      .rectangle(startX, startY, panelW, panelH, 0xffffff, 1)
      .setOrigin(0, 0)
      .setStrokeStyle(1, 0xe5e7eb)
      .setScrollFactor(0)
      .setDepth(1000);
    this.ridePanelObjects.push(bg);

    const title = crispText(
      this.add.text(startX + pad, startY + 10, "Build a ride", {
        color: "#111827",
        fontFamily: "system-ui, sans-serif",
        fontSize: "14px",
        fontStyle: "600",
      }),
    )
      .setOrigin(0, 0)
      .setScrollFactor(0)
      .setDepth(1002);
    this.ridePanelObjects.push(title);

    let y = startY + headerH + 4;
    for (const type of RIDE_TYPES) {
      const def = RIDES[type];
      const cardX = startX + pad;
      const cardW = panelW - pad * 2;
      const card = this.add
        .rectangle(cardX, y, cardW, cardH, 0xf9fafb, 1)
        .setOrigin(0, 0)
        .setStrokeStyle(1, 0xe5e7eb)
        .setInteractive({ useHandCursor: true })
        .setScrollFactor(0)
        .setDepth(1001);
      card.on("pointerdown", () => this.selectRide(type));
      this.ridePanelObjects.push(card);

      const name = crispText(
        this.add.text(cardX + 12, y + 10, def.name, {
          color: "#111827",
          fontFamily: "system-ui, sans-serif",
          fontSize: "14px",
          fontStyle: "600",
        }),
      )
        .setOrigin(0, 0)
        .setScrollFactor(0)
        .setDepth(1003);
      this.ridePanelObjects.push(name);

      const meta = `$${def.cost.toLocaleString()}  ·  ${def.width}×${def.height}  ·  ${def.maxRiders} riders`;
      const sub = crispText(
        this.add.text(cardX + 12, y + 32, meta, {
          color: "#6b7280",
          fontFamily: "system-ui, sans-serif",
          fontSize: "11px",
        }),
      )
        .setOrigin(0, 0)
        .setScrollFactor(0)
        .setDepth(1003);
      this.ridePanelObjects.push(sub);

      const price = crispText(
        this.add.text(cardX + cardW - 12, y + 32, `$${def.pricePerRide}/visit`, {
          color: "#6b7280",
          fontFamily: "system-ui, sans-serif",
          fontSize: "11px",
        }),
      )
        .setOrigin(1, 0)
        .setScrollFactor(0)
        .setDepth(1003);
      this.ridePanelObjects.push(price);

      this.rideCardRefs.push({ bg: card, nameText: name, subText: sub, priceText: price, type });
      y += cardH + 8;
    }

    this.setRidePanelVisible(false);
  }

  private setRidePanelVisible(v: boolean) {
    for (const o of this.ridePanelObjects) {
      (o as Phaser.GameObjects.GameObject & { setVisible: (b: boolean) => unknown }).setVisible(v);
    }
  }

  private selectRide(type: RideType) {
    this.game_.selectedRideType = type;
    this.game_.mode = "ride";
    this.refresh();
  }

  private positionStatCard() {
    if (!this.statBg) return;
    const margin = 16;
    const right = this.scale.width - margin;
    const bottom = this.scale.height - margin;
    this.statBg.setPosition(right, bottom);
    const left = right - this.statBg.width + 16;
    const top = bottom - this.statBg.height + 14;
    this.statTitle.setPosition(left, top);
    this.statScoreLabel.setPosition(left, top + 18);
    this.statScoreValue.setPosition(left, top + 30);
    let y = top + 70;
    for (const t of this.statRows) {
      t.setPosition(left, y);
      y += 18;
    }
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

    // Stat card
    const park = this.game_.park;
    if (park && this.statScoreValue) {
      const score = park.parkScore();
      const ridesN = park.rides.length;
      const pathN = park.pathTileCount();
      const visiting = this.game_.guests?.length ?? 0;
      const served = park.totalServed;
      this.statScoreValue.setText(score.toLocaleString());
      this.statRows[0]?.setText(`Rides   ${ridesN}`);
      this.statRows[1]?.setText(`Paths   ${pathN}`);
      this.statRows[2]?.setText(`Visiting   ${visiting}`);
      this.statRows[3]?.setText(`Served   ${served.toLocaleString()}`);
    }

    // Toggle ride-panel visibility whenever ride mode is active.
    this.setRidePanelVisible(this.game_.mode === "ride");
    for (const card of this.rideCardRefs) {
      const isSelected = this.game_.mode === "ride" && this.game_.selectedRideType === card.type;
      const def = RIDES[card.type];
      const canAfford = (this.game_.park?.cash ?? 0) >= def.cost;
      let fill = 0xf9fafb;
      let stroke = 0xe5e7eb;
      let nameColor = "#111827";
      let subColor = "#6b7280";
      if (isSelected) {
        fill = 0x111827;
        stroke = 0x111827;
        nameColor = "#ffffff";
        subColor = "#cbd5e1";
      } else if (!canAfford) {
        fill = 0xf3f4f6;
        nameColor = "#9ca3af";
        subColor = "#9ca3af";
      }
      card.bg.setFillStyle(fill, 1);
      card.bg.setStrokeStyle(1, stroke);
      card.nameText.setColor(nameColor);
      card.subText.setColor(subColor);
      card.priceText.setColor(subColor);
    }

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


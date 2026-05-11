import Phaser from "phaser";
import type { GameScene, BuildMode } from "./GameScene";
import { RIDES, RIDE_TYPES, PATH_COST, WATER_COST, BRIDGE_COST, DAY_DURATION_MS, type RideType } from "../config";
import { crispText } from "../util/crispText";

type ButtonAction = BuildMode | "pause" | "restart" | "menu";

interface ButtonRefs {
  bg: Phaser.GameObjects.Rectangle;
  text: Phaser.GameObjects.Text;
  mode: ButtonAction;
  cost?: number;
  cat?: "ride" | "stand" | "decoration";
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
  // Panel chrome (outer bg + title) is built once; the scrolling card list
  // lives inside `panelContent` and is rebuilt per category.
  panelBg?: Phaser.GameObjects.Rectangle;
  panelTitle?: Phaser.GameObjects.Text;
  panelContent?: Phaser.GameObjects.Container;
  panelMask?: Phaser.Display.Masks.GeometryMask;
  panelMaskShape?: Phaser.GameObjects.Graphics;
  panelScrollY = 0;
  panelContentHeight = 0;
  panelInnerHeight = 0;
  rideCardRefs: Array<{
    bg: Phaser.GameObjects.Rectangle;
    nameText: Phaser.GameObjects.Text;
    subText: Phaser.GameObjects.Text;
    priceText: Phaser.GameObjects.Text;
    thumb: Phaser.GameObjects.Image;
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

    const buttons: Array<{ label: string; mode: ButtonAction; cost?: number; cat?: "ride" | "stand" | "decoration" }> = [
      { label: "Select", mode: "select" },
      { label: `Path  $${PATH_COST}`, mode: "path", cost: PATH_COST },
      { label: `Water  $${WATER_COST}`, mode: "water", cost: WATER_COST },
      { label: `Bridge  $${BRIDGE_COST}`, mode: "bridge", cost: BRIDGE_COST },
      { label: "Rides", mode: "ride", cat: "ride" },
      { label: "Stands", mode: "ride", cat: "stand" },
      { label: "Decor", mode: "ride", cat: "decoration" },
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
      bg.on("pointerdown", () => this.handleButton(b.mode, b.cat));
      this.buttons.push({ bg, text, mode: b.mode, cost: b.cost, cat: b.cat });
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

  // Panel layout constants.
  private static PANEL_W = 260;
  private static PANEL_H = 360;
  private static PANEL_X = 12;
  private static PANEL_Y = 68; // just below the toolbar
  private static CARD_H = 72;
  private static CARD_PAD = 12;

  private buildRidePanel() {
    const { PANEL_W, PANEL_H, PANEL_X, PANEL_Y } = UIScene;
    this.panelBg = this.add
      .rectangle(PANEL_X, PANEL_Y, PANEL_W, PANEL_H, 0xffffff, 1)
      .setOrigin(0, 0)
      .setStrokeStyle(1, 0xe5e7eb)
      .setScrollFactor(0)
      .setDepth(1000);
    this.panelTitle = crispText(
      this.add.text(PANEL_X + 12, PANEL_Y + 10, "Rides", {
        color: "#111827",
        fontFamily: "system-ui, sans-serif",
        fontSize: "14px",
        fontStyle: "600",
      }),
    )
      .setOrigin(0, 0)
      .setScrollFactor(0)
      .setDepth(1002);

    // Scroll container holding the cards. A rectangle mask clips it to the
    // inner area so cards above/below the viewport are hidden.
    this.panelContent = this.add.container(PANEL_X, PANEL_Y + 36).setScrollFactor(0).setDepth(1001);
    this.panelInnerHeight = PANEL_H - 36 - 12;
    this.panelMaskShape = this.make.graphics({ x: 0, y: 0 });
    this.panelMaskShape.fillStyle(0xffffff, 1);
    this.panelMaskShape.fillRect(PANEL_X, PANEL_Y + 36, PANEL_W, this.panelInnerHeight);
    this.panelMaskShape.setScrollFactor(0);
    this.panelMask = this.panelMaskShape.createGeometryMask();
    this.panelContent.setMask(this.panelMask);

    // Wheel scroll over panel area.
    this.input.on(
      "wheel",
      (
        pointer: Phaser.Input.Pointer,
        _over: Phaser.GameObjects.GameObject[],
        _dx: number,
        deltaY: number,
      ) => {
        if (this.game_.mode !== "ride") return;
        if (!this.panelBg) return;
        const insideX = pointer.x >= PANEL_X && pointer.x <= PANEL_X + PANEL_W;
        const insideY = pointer.y >= PANEL_Y && pointer.y <= PANEL_Y + PANEL_H;
        if (!insideX || !insideY) return;
        const max = Math.max(0, this.panelContentHeight - this.panelInnerHeight);
        this.panelScrollY = Phaser.Math.Clamp(this.panelScrollY + deltaY * 0.5, 0, max);
        if (this.panelContent) this.panelContent.y = PANEL_Y + 36 - this.panelScrollY;
      },
    );

    this.rebuildRidePanel();
    this.setRidePanelVisible(false);
  }

  /** Rebuild the card list for the current category. */
  private rebuildRidePanel() {
    if (!this.panelContent) return;
    // Tear down previous cards.
    this.panelContent.removeAll(true);
    this.rideCardRefs = [];
    this.panelScrollY = 0;
    this.panelContent.y = UIScene.PANEL_Y + 36;

    const cat = this.game_.buildCategory;
    const labelMap = { ride: "Rides", stand: "Stands", decoration: "Decorations" } as const;
    if (this.panelTitle) this.panelTitle.setText(labelMap[cat]);

    const types = RIDE_TYPES.filter((t) => RIDES[t].category === cat);
    const cardW = UIScene.PANEL_W - UIScene.CARD_PAD * 2;
    let y = 0;
    for (const type of types) {
      this.renderRideCard(type, UIScene.CARD_PAD, y, cardW);
      y += UIScene.CARD_H + 8;
    }
    this.panelContentHeight = y;
  }

  private renderRideCard(type: RideType, x: number, y: number, w: number) {
    const def = RIDES[type];
    const h = UIScene.CARD_H;
    const card = this.add
      .rectangle(x, y, w, h, 0xf9fafb, 1)
      .setOrigin(0, 0)
      .setStrokeStyle(1, 0xe5e7eb)
      .setInteractive({ useHandCursor: true });
    card.on("pointerdown", () => this.selectRide(type));
    this.panelContent!.add(card);

    // Thumbnail tile on the left of the card.
    const thumbBoxSize = h - 16;
    const thumbBoxX = x + 8;
    const thumbBoxY = y + 8;
    const thumbBg = this.add
      .rectangle(thumbBoxX, thumbBoxY, thumbBoxSize, thumbBoxSize, 0xffffff, 1)
      .setOrigin(0, 0)
      .setStrokeStyle(1, 0xe5e7eb);
    this.panelContent!.add(thumbBg);
    const thumb = this.add.image(
      thumbBoxX + thumbBoxSize / 2,
      thumbBoxY + thumbBoxSize / 2,
      def.textureKey,
    );
    thumb.setOrigin(0.5, 0.5);
    // Scale to fit inside the thumb box with padding.
    const targetSize = thumbBoxSize - 8;
    const srcW = thumb.width;
    const srcH = thumb.height;
    thumb.setScale(Math.min(targetSize / srcW, targetSize / srcH));
    this.panelContent!.add(thumb);

    const textX = thumbBoxX + thumbBoxSize + 10;
    const name = crispText(
      this.add.text(textX, y + 12, def.name, {
        color: "#111827",
        fontFamily: "system-ui, sans-serif",
        fontSize: "14px",
        fontStyle: "600",
      }),
    ).setOrigin(0, 0);
    this.panelContent!.add(name);

    let meta: string;
    if (def.category === "decoration") {
      meta = `$${def.cost.toLocaleString()}  ·  ${def.width}×${def.height}`;
    } else {
      const unit = def.category === "stand" ? "cust." : "riders";
      meta = `$${def.cost.toLocaleString()}  ·  ${def.width}×${def.height}  ·  ${def.maxRiders} ${unit}`;
    }
    const sub = crispText(
      this.add.text(textX, y + 34, meta, {
        color: "#6b7280",
        fontFamily: "system-ui, sans-serif",
        fontSize: "11px",
      }),
    ).setOrigin(0, 0);
    this.panelContent!.add(sub);

    const priceLabel = def.category === "decoration" ? "" : `$${def.pricePerRide}/visit`;
    const price = crispText(
      this.add.text(x + w - 12, y + 50, priceLabel, {
        color: "#6b7280",
        fontFamily: "system-ui, sans-serif",
        fontSize: "11px",
      }),
    ).setOrigin(1, 0);
    this.panelContent!.add(price);

    this.rideCardRefs.push({ bg: card, nameText: name, subText: sub, priceText: price, thumb, type });
  }

  private setRidePanelVisible(v: boolean) {
    if (this.panelBg) this.panelBg.setVisible(v);
    if (this.panelTitle) this.panelTitle.setVisible(v);
    if (this.panelContent) this.panelContent.setVisible(v);
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

  private handleButton(mode: ButtonAction, cat?: "ride" | "stand" | "decoration") {
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
    // When entering the build (ride) mode, also switch which category panel
    // is shown and reset selected ride to the first of that category.
    if (mode === "ride" && cat) {
      this.game_.buildCategory = cat;
      const first = RIDE_TYPES.find((t) => RIDES[t].category === cat);
      if (first) this.game_.selectedRideType = first;
      this.rebuildRidePanel();
    }
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
      let isActive: boolean;
      if (b.mode === "pause") {
        isActive = this.game_.paused;
      } else if (b.mode === "ride") {
        // Only the toolbar button whose `cat` matches the current build category
        // should highlight, since all three (Rides/Stands/Decor) share mode="ride".
        isActive = this.game_.mode === "ride" && b.cat === this.game_.buildCategory;
      } else {
        isActive = this.game_.mode === b.mode;
      }
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


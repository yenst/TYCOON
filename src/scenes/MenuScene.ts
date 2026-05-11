import Phaser from "phaser";
import { SaveManager, type SaveMeta } from "../state/SaveManager";
import { crispText } from "../util/crispText";

const PANEL_W = 520;
const ROW_H = 64;
const PAD = 16;
const TITLE_H = 200;
const NEW_BTN_H = 56;

export class MenuScene extends Phaser.Scene {
  rows: Phaser.GameObjects.Container[] = [];
  newBtnBg!: Phaser.GameObjects.Rectangle;
  newBtnText!: Phaser.GameObjects.Text;
  emptyText?: Phaser.GameObjects.Text;
  scrollContainer!: Phaser.GameObjects.Container;

  constructor() {
    super("Menu");
  }

  create() {
    this.cameras.main.setBackgroundColor("#fafafa");
    this.rows = [];
    this.renderAll();
    const resize = () => this.renderAll();
    this.scale.on("resize", resize);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.scale.off("resize", resize);
    });
  }

  private renderAll() {
    // Wipe old.
    for (const r of this.rows) r.destroy();
    this.rows = [];
    this.newBtnBg?.destroy();
    this.newBtnText?.destroy();
    this.emptyText?.destroy();
    this.scrollContainer?.destroy();

    const w = this.scale.width;
    const h = this.scale.height;
    const cx = w / 2;

    // Logo replaces the text title.
    const logo = this.add.image(cx, 96, "logo").setOrigin(0.5, 0.5).setDepth(10);
    logo.setDisplaySize(180, 180);

    crispText(
      this.add.text(cx, 210, "Choose a park to play, or start a new one", {
        color: "#6b7280",
        fontFamily: "system-ui, sans-serif",
        fontSize: "14px",
      }),
    )
      .setOrigin(0.5, 0.5)
      .setDepth(10);

    // New Park button
    const newBtnY = TITLE_H + PAD + 60;
    const newBtnX = cx - PANEL_W / 2;
    this.newBtnBg = this.add
      .rectangle(newBtnX, newBtnY, PANEL_W, NEW_BTN_H, 0x111827, 1)
      .setOrigin(0, 0)
      .setStrokeStyle(1, 0x111827)
      .setInteractive({ useHandCursor: true });
    this.newBtnText = crispText(
      this.add.text(newBtnX + PANEL_W / 2, newBtnY + NEW_BTN_H / 2, "+  New Park", {
        color: "#ffffff",
        fontFamily: "system-ui, sans-serif",
        fontSize: "16px",
        fontStyle: "600",
      }),
    ).setOrigin(0.5, 0.5);
    this.newBtnBg.on("pointerdown", () => this.startNewPark());

    // Save list
    const saves = SaveManager.list();
    const listTop = newBtnY + NEW_BTN_H + PAD * 2;
    if (saves.length === 0) {
      this.emptyText = crispText(
        this.add.text(cx, listTop + 30, "No parks yet — create one to start.", {
          color: "#9ca3af",
          fontFamily: "system-ui, sans-serif",
          fontSize: "14px",
        }),
      ).setOrigin(0.5, 0.5);
      return;
    }

    const maxRows = Math.max(0, Math.floor((h - listTop - PAD) / (ROW_H + 8)));
    const visible = saves.slice(0, maxRows);
    let y = listTop;
    for (const meta of visible) {
      const row = this.makeRow(newBtnX, y, meta);
      this.rows.push(row);
      y += ROW_H + 8;
    }
  }

  private makeRow(x: number, y: number, meta: SaveMeta): Phaser.GameObjects.Container {
    const c = this.add.container(x, y);

    const bg = this.add
      .rectangle(0, 0, PANEL_W, ROW_H, 0xffffff, 1)
      .setOrigin(0, 0)
      .setStrokeStyle(1, 0xe5e7eb);
    c.add(bg);

    const name = crispText(
      this.add.text(PAD, 12, meta.name, {
        color: "#111827",
        fontFamily: "system-ui, sans-serif",
        fontSize: "16px",
        fontStyle: "600",
      }),
    );
    c.add(name);

    const last = new Date(meta.lastSavedAt);
    const subtitle = `$${meta.cash.toLocaleString()}  ·  ${last.toLocaleString()}`;
    const sub = crispText(
      this.add.text(PAD, 36, subtitle, {
        color: "#6b7280",
        fontFamily: "system-ui, sans-serif",
        fontSize: "12px",
      }),
    );
    c.add(sub);

    // Continue button — primary
    const contW = 76;
    const contX = PANEL_W - PAD - contW - 80 - 6;
    const contBg = this.add
      .rectangle(contX, ROW_H / 2, contW, 32, 0x111827, 1)
      .setOrigin(0, 0.5)
      .setStrokeStyle(1, 0x111827)
      .setInteractive({ useHandCursor: true });
    const contText = crispText(
      this.add.text(contX + contW / 2, ROW_H / 2, "Play", {
        color: "#ffffff",
        fontFamily: "system-ui, sans-serif",
        fontSize: "13px",
        fontStyle: "600",
      }),
    ).setOrigin(0.5, 0.5);
    contBg.on("pointerdown", () => this.continueSave(meta.id));
    c.add(contBg);
    c.add(contText);

    // Delete button — ghost
    const delW = 74;
    const delX = PANEL_W - PAD - delW;
    const delBg = this.add
      .rectangle(delX, ROW_H / 2, delW, 32, 0xffffff, 1)
      .setOrigin(0, 0.5)
      .setStrokeStyle(1, 0xe5e7eb)
      .setInteractive({ useHandCursor: true });
    const delText = crispText(
      this.add.text(delX + delW / 2, ROW_H / 2, "Delete", {
        color: "#6b7280",
        fontFamily: "system-ui, sans-serif",
        fontSize: "13px",
        fontStyle: "500",
      }),
    ).setOrigin(0.5, 0.5);
    delBg.on("pointerdown", () => this.deleteSave(meta));
    c.add(delBg);
    c.add(delText);

    return c;
  }

  private startNewPark() {
    const meta = SaveManager.create();
    SaveManager.setActive(meta.id);
    this.scene.start("Game");
    this.scene.launch("UI");
  }

  private continueSave(id: string) {
    SaveManager.setActive(id);
    this.scene.start("Game");
    this.scene.launch("UI");
  }

  private deleteSave(meta: SaveMeta) {
    if (!confirm(`Delete "${meta.name}"? This can't be undone.`)) return;
    SaveManager.delete(meta.id);
    this.renderAll();
  }
}

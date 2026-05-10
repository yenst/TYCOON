import Phaser from "phaser";

/**
 * Sharpens a Phaser.Text under `pixelArt: true`. The pixelArt config makes WebGL
 * sample every texture (including the canvas Phaser rasterizes Text to) with
 * NEAREST, which gives chunky stair-step edges. We bump the rasterization
 * resolution to devicePixelRatio (or 2x min) and override the texture filter
 * back to LINEAR for this one texture.
 */
export function crispText(text: Phaser.GameObjects.Text): Phaser.GameObjects.Text {
  const res = Math.max(2, window.devicePixelRatio || 2);
  text.setResolution(res);
  const tex = text.texture as Phaser.Textures.Texture | undefined;
  if (tex && typeof tex.setFilter === "function") {
    tex.setFilter(Phaser.Textures.FilterMode.LINEAR);
  }
  return text;
}

// Diamond footprint inside the 32x32 PixelLab "thin tile" PNG. The diamond fills
// the canvas width, so spacing must use the canvas dimensions to tile flush.
export const TILE_W = 32;
export const TILE_H = 16;

export const MAP_W = 40;
export const MAP_H = 40;

export const STARTING_CASH = 5000;
export const PATH_COST = 10;

export const ENTRANCE_GX = 0;
export const ENTRANCE_GY = Math.floor(MAP_H / 2);

export type RideType = "carousel";

export interface RideDef {
  cost: number;
  width: number;
  height: number;
  pricePerRide: number;
  rideDurationMs: number;
  maxRiders: number;
  textureKey: string;
}

export const RIDES: Record<RideType, RideDef> = {
  carousel: {
    cost: 1500,
    width: 2,
    height: 2,
    pricePerRide: 5,
    rideDurationMs: 5000,
    maxRiders: 8,
    textureKey: "ride_carousel",
  },
};

export const GUEST_SPAWN_INTERVAL_MS = 2000;
export const GUEST_STEP_MS = 250;
export const GUEST_MAX = 50;
export const GUEST_VARIANT_COUNT = 10;

export const SAVE_KEY = "park_v1";
export const AUTOSAVE_INTERVAL_MS = 5000;

export const ZOOM_MIN = 0.4;
export const ZOOM_MAX = 3;
export const ZOOM_DEFAULT = 1.6;
export const PAN_KEY_PX_PER_SEC = 600;

// Day metric — fully serialized day counter; dayProgress is transient.
export const DAY_DURATION_MS = 120_000; // 2 min real-time per in-game day

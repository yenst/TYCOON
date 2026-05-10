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

export type RideType = "carousel" | "swings" | "bumper_cars" | "ferris_wheel";

export interface RideDef {
  name: string;
  cost: number;
  width: number;
  height: number;
  pricePerRide: number;
  rideDurationMs: number;
  maxRiders: number;
  textureKey: string;
}

// NB: new rides reuse the carousel texture as a placeholder until per-ride art
// is generated (PixelLab create_object).
export const RIDES: Record<RideType, RideDef> = {
  carousel: {
    name: "Carousel",
    cost: 1500,
    width: 2,
    height: 2,
    pricePerRide: 5,
    rideDurationMs: 5000,
    maxRiders: 8,
    textureKey: "ride_carousel",
  },
  swings: {
    name: "Swings",
    cost: 1200,
    width: 2,
    height: 2,
    pricePerRide: 4,
    rideDurationMs: 4500,
    maxRiders: 6,
    textureKey: "ride_swings",
  },
  bumper_cars: {
    name: "Bumper Cars",
    cost: 3500,
    width: 3,
    height: 3,
    pricePerRide: 6,
    rideDurationMs: 6000,
    maxRiders: 12,
    textureKey: "ride_bumper_cars",
  },
  ferris_wheel: {
    name: "Ferris Wheel",
    cost: 4800,
    width: 3,
    height: 3,
    pricePerRide: 9,
    rideDurationMs: 9000,
    maxRiders: 16,
    textureKey: "ride_ferris_wheel",
  },
};

export const RIDE_TYPES: RideType[] = Object.keys(RIDES) as RideType[];

// Base spawn interval (no rides yet). The actual interval scales down with park
// score so popular parks fill up faster. See Park.recommendedSpawnIntervalMs().
export const GUEST_SPAWN_INTERVAL_MS = 2500;
export const GUEST_STEP_MS = 250;
export const GUEST_MAX = 150;
export const GUEST_VARIANT_COUNT = 10;

// Park score weighting — used both for the score number itself and for derived
// values like spawn rate / max concurrent guests.
export const SCORE_PER_RIDE = 150;
export const SCORE_PER_PATH = 3;
export const SCORE_PER_VISITOR_SERVED = 1;

export const SAVE_KEY = "park_v1";
export const AUTOSAVE_INTERVAL_MS = 5000;

export const ZOOM_MIN = 0.4;
export const ZOOM_MAX = 4;
export const ZOOM_DEFAULT = 2.6;
export const PAN_KEY_PX_PER_SEC = 600;

// Day metric — fully serialized day counter; dayProgress is transient.
export const DAY_DURATION_MS = 120_000; // 2 min real-time per in-game day

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

export type RideType =
  | "carousel"
  | "swings"
  | "bumper_cars"
  | "ferris_wheel"
  | "food_stand"
  | "cotton_candy"
  | "hot_dog"
  | "drinks"
  | "bench"
  | "lamp"
  | "fountain"
  | "planter"
  | "lolly_arch";

export type AttractionCategory = "ride" | "stand" | "decoration";

export const WATER_COST = 5;
export const BRIDGE_COST = 20;

export interface RideDef {
  name: string;
  category: AttractionCategory;
  cost: number;
  width: number;
  height: number;
  pricePerRide: number;
  rideDurationMs: number;
  maxRiders: number;
  textureKey: string;
  /** Override the category's default sprite scale. */
  scale?: number;
  /**
   * Where customer slots are derived (stands only).
   *  - "any" (default): any orthogonally-adjacent path tile.
   *  - "sw_line": a queue extending SW from the stand: (gx, gy+1), (gx, gy+2), ...
   */
  slotPattern?: "any" | "sw_line";
}

// Hunger ramps up while the guest is in the park. Once >= EAT_THRESHOLD they
// look for a stand instead of a ride; eating resets it to 0.
export const HUNGER_PER_SECOND = 22;
export const HUNGER_EAT_THRESHOLD = 60;
export const HUNGER_MAX = 100;

// NB: new rides reuse the carousel texture as a placeholder until per-ride art
// is generated (PixelLab create_object).
export const RIDES: Record<RideType, RideDef> = {
  carousel: {
    name: "Carousel",
    category: "ride",
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
    category: "ride",
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
    category: "ride",
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
    category: "ride",
    cost: 4800,
    width: 3,
    height: 3,
    pricePerRide: 9,
    rideDurationMs: 9000,
    maxRiders: 16,
    textureKey: "ride_ferris_wheel",
  },
  food_stand: {
    name: "Snack Bar",
    category: "stand",
    cost: 600,
    width: 1,
    height: 1,
    pricePerRide: 3,
    rideDurationMs: 2000,
    maxRiders: 2,
    textureKey: "stand_food",
  },
  cotton_candy: {
    name: "Cotton Candy",
    category: "stand",
    cost: 500,
    width: 1,
    height: 1,
    pricePerRide: 3,
    rideDurationMs: 2200,
    maxRiders: 2,
    textureKey: "stand_cotton_candy",
  },
  hot_dog: {
    name: "Hot Dogs",
    category: "stand",
    cost: 700,
    width: 1,
    height: 1,
    pricePerRide: 4,
    rideDurationMs: 2500,
    maxRiders: 2,
    textureKey: "stand_hot_dog",
    slotPattern: "sw_line",
  },
  drinks: {
    name: "Drinks",
    category: "stand",
    cost: 550,
    width: 1,
    height: 1,
    pricePerRide: 2,
    rideDurationMs: 1800,
    maxRiders: 2,
    textureKey: "stand_drinks",
    slotPattern: "sw_line",
  },
  bench: {
    name: "Bench",
    category: "decoration",
    cost: 80,
    width: 1,
    height: 1,
    pricePerRide: 0,
    rideDurationMs: 0,
    maxRiders: 0,
    textureKey: "decor_bench",
  },
  lamp: {
    name: "Lamp",
    category: "decoration",
    cost: 120,
    width: 1,
    height: 1,
    pricePerRide: 0,
    rideDurationMs: 0,
    maxRiders: 0,
    textureKey: "decor_lamp",
  },
  fountain: {
    name: "Fountain",
    category: "decoration",
    cost: 400,
    width: 1,
    height: 1,
    pricePerRide: 0,
    rideDurationMs: 0,
    maxRiders: 0,
    textureKey: "decor_fountain",
    scale: 0.5,
  },
  planter: {
    name: "Planter",
    category: "decoration",
    cost: 60,
    width: 1,
    height: 1,
    pricePerRide: 0,
    rideDurationMs: 0,
    maxRiders: 0,
    textureKey: "decor_planter",
  },
  lolly_arch: {
    name: "Lollipop Arch",
    category: "decoration",
    cost: 250,
    width: 1,
    height: 1,
    pricePerRide: 0,
    rideDurationMs: 0,
    maxRiders: 0,
    textureKey: "decor_lolly_arch",
    scale: 0.7,
  },
};

export const RIDE_TYPES: RideType[] = Object.keys(RIDES) as RideType[];

// Base spawn interval (no rides yet). The actual interval scales down with park
// score so popular parks fill up faster. See Park.recommendedSpawnIntervalMs().
export const GUEST_SPAWN_INTERVAL_MS = 2500;
export const GUEST_STEP_MS = 380;
export const GUEST_MAX = 150;
export const GUEST_VARIANT_COUNT = 10;
export const GUEST_SCALE = 0.66;

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

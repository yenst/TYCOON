import type { ParkSnapshot } from "./Park";

const INDEX_KEY = "parks_index_v1";
const ACTIVE_KEY = "parks_active_v1";
const SLOT_PREFIX = "park_slot_";
const LEGACY_KEY = "park_v1";

export interface SaveMeta {
  id: string;
  name: string;
  createdAt: number;
  lastSavedAt: number;
  cash: number;
}

interface ParksIndex {
  v: 1;
  saves: SaveMeta[];
}

function readIndex(): ParksIndex {
  const raw = localStorage.getItem(INDEX_KEY);
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as ParksIndex;
      if (parsed && parsed.v === 1 && Array.isArray(parsed.saves)) return parsed;
    } catch {
      /* fall through to fresh */
    }
  }
  return { v: 1, saves: [] };
}

function writeIndex(idx: ParksIndex) {
  try {
    localStorage.setItem(INDEX_KEY, JSON.stringify(idx));
  } catch {
    /* ignore quota */
  }
}

function migrateLegacy(idx: ParksIndex): ParksIndex {
  const legacyRaw = localStorage.getItem(LEGACY_KEY);
  if (!legacyRaw) return idx;
  // Already migrated?
  if (idx.saves.some((s) => s.id === "legacy")) return idx;
  try {
    const snap = JSON.parse(legacyRaw) as ParkSnapshot;
    const meta: SaveMeta = {
      id: "legacy",
      name: "Default Park",
      createdAt: Date.now(),
      lastSavedAt: Date.now(),
      cash: typeof snap.cash === "number" ? snap.cash : 0,
    };
    localStorage.setItem(SLOT_PREFIX + meta.id, legacyRaw);
    const next: ParksIndex = { v: 1, saves: [...idx.saves, meta] };
    writeIndex(next);
    localStorage.removeItem(LEGACY_KEY);
    return next;
  } catch {
    return idx;
  }
}

function nextName(saves: SaveMeta[]): string {
  let n = saves.length + 1;
  const taken = new Set(saves.map((s) => s.name));
  while (taken.has(`Park ${n}`)) n++;
  return `Park ${n}`;
}

export const SaveManager = {
  list(): SaveMeta[] {
    let idx = readIndex();
    idx = migrateLegacy(idx);
    return [...idx.saves].sort((a, b) => b.lastSavedAt - a.lastSavedAt);
  },

  create(name?: string): SaveMeta {
    let idx = readIndex();
    idx = migrateLegacy(idx);
    const id = `s${Date.now().toString(36)}${Math.floor(Math.random() * 1000).toString(36)}`;
    const meta: SaveMeta = {
      id,
      name: name?.trim() || nextName(idx.saves),
      createdAt: Date.now(),
      lastSavedAt: Date.now(),
      cash: 0,
    };
    const next: ParksIndex = { v: 1, saves: [...idx.saves, meta] };
    writeIndex(next);
    return meta;
  },

  save(id: string, snapshot: ParkSnapshot): void {
    try {
      localStorage.setItem(SLOT_PREFIX + id, JSON.stringify(snapshot));
    } catch {
      return;
    }
    const idx = readIndex();
    const updated = idx.saves.map((s) =>
      s.id === id ? { ...s, lastSavedAt: Date.now(), cash: snapshot.cash } : s,
    );
    writeIndex({ v: 1, saves: updated });
  },

  load(id: string): ParkSnapshot | null {
    const raw = localStorage.getItem(SLOT_PREFIX + id);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as ParkSnapshot;
    } catch {
      return null;
    }
  },

  delete(id: string): void {
    localStorage.removeItem(SLOT_PREFIX + id);
    const idx = readIndex();
    writeIndex({ v: 1, saves: idx.saves.filter((s) => s.id !== id) });
    if (this.activeId() === id) this.setActive(null);
  },

  reset(id: string): void {
    localStorage.removeItem(SLOT_PREFIX + id);
    const idx = readIndex();
    const updated = idx.saves.map((s) =>
      s.id === id ? { ...s, lastSavedAt: Date.now(), cash: 0 } : s,
    );
    writeIndex({ v: 1, saves: updated });
  },

  activeId(): string | null {
    return localStorage.getItem(ACTIVE_KEY);
  },

  setActive(id: string | null): void {
    if (id) localStorage.setItem(ACTIVE_KEY, id);
    else localStorage.removeItem(ACTIVE_KEY);
  },
};

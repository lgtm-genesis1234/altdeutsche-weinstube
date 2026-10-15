// Local, offline save/load. Writes through a temp key then promotes to the
// main slot and keeps the previous good save as a backup — no silent resets.
// GameState is serialized to a single JSON string (plain data, JSON-safe).

import { storage } from "@/src/utils/storage";

import { GameState, SCHEMA_VERSION } from "./types";

const SLOT = "zt_save_v1";
const BACKUP = "zt_save_v1_backup";
const TMP = "zt_save_v1_tmp";

export async function saveGame(state: GameState): Promise<boolean> {
  const json = JSON.stringify(state);
  // temp -> promote previous to backup -> write main
  await storage.setItem(TMP, json);
  const prev = await storage.getItem<string>(SLOT, "");
  if (prev) await storage.setItem(BACKUP, prev);
  return storage.setItem(SLOT, json);
}

function parse(raw: string | null): GameState | null {
  if (!raw) return null;
  try {
    const s = JSON.parse(raw) as GameState;
    if (!s || typeof s.day !== "number" || s.schemaVersion !== SCHEMA_VERSION) return null;
    return s;
  } catch {
    return null;
  }
}

export async function loadGame(): Promise<GameState | null> {
  const main = parse(await storage.getItem<string>(SLOT, ""));
  if (main) return main;
  // Fall back to last good backup rather than starting fresh.
  return parse(await storage.getItem<string>(BACKUP, ""));
}

export async function hasSave(): Promise<boolean> {
  const main = await storage.getItem<string>(SLOT, "");
  const backup = await storage.getItem<string>(BACKUP, "");
  return Boolean(main || backup);
}

export async function deleteSave(): Promise<void> {
  await storage.removeItem(SLOT);
  await storage.removeItem(BACKUP);
  await storage.removeItem(TMP);
}

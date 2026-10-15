// React glue between the pure engine and UI. Holds the GameState, autosaves
// after every change, and exposes typed actions. UI never mutates state.

import { createContext, PropsWithChildren, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";

import * as E from "./engine";
import { deleteSave, loadGame, saveGame } from "./save";
import { GameState, OperationMode, Tactic } from "./types";

interface GameCtx {
  state: GameState | null;
  ready: boolean;
  lastSavedDay: number | null;
  newGame: (bg: string, name: string, alias: string) => void;
  work: () => void;
  rest: () => void;
  study: () => void;
  endDay: () => void;
  buyHardware: (level: number) => void;
  startOperation: (targetId: string, mode: OperationMode) => void;
  applyTactic: (t: Tactic) => void;
  abortOperation: () => void;
  useData: (id: string, a: E.DataAction) => void;
  resolveRaid: (c: E.RaidChoice) => void;
  saveNow: () => Promise<boolean>;
  reload: () => Promise<boolean>;
  wipe: () => Promise<void>;
}

const Ctx = createContext<GameCtx | null>(null);

export function GameProvider({ children }: PropsWithChildren) {
  const [state, setState] = useState<GameState | null>(null);
  const [ready, setReady] = useState(false);
  const [lastSavedDay, setLastSavedDay] = useState<number | null>(null);
  const skipNextSave = useRef(true);

  useEffect(() => {
    loadGame().then((s) => {
      setState(s);
      setReady(true);
    });
  }, []);

  // Autosave every change after initial load.
  useEffect(() => {
    if (!ready || !state) return;
    if (skipNextSave.current) {
      skipNextSave.current = false;
      return;
    }
    saveGame(state).then((ok) => ok && setLastSavedDay(state.day));
  }, [state, ready]);

  const run = useCallback((fn: (s: GameState) => GameState) => {
    setState((prev) => (prev ? fn(prev) : prev));
  }, []);

  const value = useMemo<GameCtx>(
    () => ({
      state,
      ready,
      lastSavedDay,
      newGame: (bg, name, alias) => {
        skipNextSave.current = false;
        setState(E.newGame(bg, name, alias));
      },
      work: () => run(E.work),
      rest: () => run(E.rest),
      study: () => run(E.study),
      endDay: () => run(E.endDay),
      buyHardware: (l) => run((s) => E.buyHardware(s, l)),
      startOperation: (id, m) => run((s) => E.startOperation(s, id, m)),
      applyTactic: (t) => run((s) => E.applyTactic(s, t)),
      abortOperation: () => run((s) => E.abortOperation(s)),
      useData: (id, a) => run((s) => E.useData(s, id, a)),
      resolveRaid: (c) => run((s) => E.resolveRaid(s, c)),
      saveNow: async () => {
        if (!state) return false;
        const ok = await saveGame(state);
        if (ok) setLastSavedDay(state.day);
        return ok;
      },
      reload: async () => {
        const s = await loadGame();
        if (!s) return false;
        skipNextSave.current = true;
        setState(s);
        return true;
      },
      wipe: async () => {
        await deleteSave();
        skipNextSave.current = true;
        setState(null);
      },
    }),
    [state, ready, lastSavedDay, run],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useGame(): GameCtx {
  const c = useContext(Ctx);
  if (!c) throw new Error("useGame outside GameProvider");
  return c;
}

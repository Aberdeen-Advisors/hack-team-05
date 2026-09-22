"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { toast } from "sonner";
import type { EngineName } from "@/lib/engines/run";

/**
 * Workspace-wide editing context.
 *
 * - `editMode` toggles whether Editable/EditableParagraph render as text or as
 *   inputs
 * - `saveState` is the shared save indicator ("saved" / "saving" / "error")
 * - `updateEngine(engine, updater)` merges a partial result into the working
 *   copy and schedules a debounced PATCH to /api/pursuit/[id]/results.
 *
 * Tab components consume this via `useEditing()`. They don't manage save
 * state themselves — they only mutate the working copy via updateEngine().
 */

type SaveState = "idle" | "saving" | "saved" | "error";

type EngineResults = Partial<
  Record<EngineName, Record<string, unknown> | undefined>
>;

type EditingContextValue = {
  editMode: boolean;
  setEditMode: (v: boolean) => void;
  saveState: SaveState;
  /** Current working copy per engine — starts as the streamed result, mutated by edits. */
  edits: EngineResults;
  /**
   * Merge / replace an engine's result. If given an object it shallow-merges;
   * if given a function it produces the new result from the previous one.
   */
  updateEngine: <T extends Record<string, unknown>>(
    engine: EngineName,
    updater: T | ((prev: T | undefined) => T),
  ) => void;
  /** Discard local edits for an engine and reset to the streamed result. */
  resetEngine: (engine: EngineName) => void;
};

const EditingContext = createContext<EditingContextValue | null>(null);

/** Hook used by every editable field. Throws if used outside the provider. */
export function useEditing(): EditingContextValue {
  const ctx = useContext(EditingContext);
  if (!ctx) {
    throw new Error("useEditing must be used inside <EditingProvider>");
  }
  return ctx;
}

/**
 * When streamed results arrive, feed them into the provider so the working
 * copy stays in sync (unless the user has already edited that engine).
 */
export function EditingProvider({
  pursuitId,
  streamedResults,
  children,
}: {
  pursuitId: string;
  streamedResults: EngineResults;
  children: ReactNode;
}) {
  const [editMode, setEditMode] = useState(false);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [edits, setEdits] = useState<EngineResults>({});
  const dirtyEngines = useRef<Set<EngineName>>(new Set());
  const debounceTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>(
    {},
  );

  // Sync streamed results into the working copy for engines the user hasn't
  // touched. If the user has already edited an engine, don't clobber their
  // work when a fresh stream lands (e.g., on refresh).
  useEffect(() => {
    setEdits((prev) => {
      const next = { ...prev };
      let changed = false;
      for (const key of Object.keys(streamedResults) as EngineName[]) {
        if (!dirtyEngines.current.has(key) && streamedResults[key]) {
          next[key] = streamedResults[key];
          changed = true;
        }
      }
      return changed ? next : prev;
    });
  }, [streamedResults]);

  const persist = useCallback(
    async (engine: EngineName, result: unknown) => {
      setSaveState("saving");
      try {
        const res = await fetch(`/api/pursuit/${pursuitId}/results`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ engine, result }),
        });
        if (!res.ok) {
          const t = await res.text().catch(() => "");
          throw new Error(t || `HTTP ${res.status}`);
        }
        setSaveState("saved");
        // Fade the "saved" indicator after a beat.
        setTimeout(() => setSaveState((s) => (s === "saved" ? "idle" : s)), 1500);
      } catch (err) {
        console.error("[edits.persist] failed", err);
        setSaveState("error");
        toast.error(
          err instanceof Error ? `Save failed: ${err.message}` : "Save failed",
        );
      }
    },
    [pursuitId],
  );

  const scheduleSave = useCallback(
    (engine: EngineName, result: unknown) => {
      if (debounceTimers.current[engine]) {
        clearTimeout(debounceTimers.current[engine]);
      }
      // 600ms debounce — long enough to batch rapid keystrokes-then-blur,
      // short enough that a partner clicking away sees "Saved" quickly.
      debounceTimers.current[engine] = setTimeout(() => {
        persist(engine, result);
        delete debounceTimers.current[engine];
      }, 600);
    },
    [persist],
  );

  const updateEngine = useCallback(
    function <T extends Record<string, unknown>>(
      engine: EngineName,
      updater: T | ((prev: T | undefined) => T),
    ) {
      setEdits((prev) => {
        const current = prev[engine] as T | undefined;
        const nextResult =
          typeof updater === "function"
            ? (updater as (prev: T | undefined) => T)(current)
            : updater;
        dirtyEngines.current.add(engine);
        scheduleSave(engine, nextResult);
        return { ...prev, [engine]: nextResult };
      });
    },
    [scheduleSave],
  );

  const resetEngine = useCallback(
    (engine: EngineName) => {
      dirtyEngines.current.delete(engine);
      setEdits((prev) => ({ ...prev, [engine]: streamedResults[engine] }));
    },
    [streamedResults],
  );

  // Cleanup any in-flight debounce timers on unmount.
  useEffect(() => {
    const timersRef = debounceTimers.current;
    return () => {
      for (const t of Object.values(timersRef)) clearTimeout(t);
    };
  }, []);

  const value = useMemo<EditingContextValue>(
    () => ({
      editMode,
      setEditMode,
      saveState,
      edits,
      updateEngine,
      resetEngine,
    }),
    [editMode, saveState, edits, updateEngine, resetEngine],
  );

  return (
    <EditingContext.Provider value={value}>{children}</EditingContext.Provider>
  );
}

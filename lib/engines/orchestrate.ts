import type { PursuitRecord } from "@/lib/pursuit/store";
import {
  runUnderstand,
  runStrategize,
  runMatch,
  runDesign,
  runCreate,
  type EngineName,
} from "./run";
import type {
  OpportunityBrief,
  WinStrategy,
  EvidenceMap,
  SolutionBlueprint,
  ProposalDraft,
} from "./schemas";

export type EngineEvent =
  | { type: "engine.start"; engine: EngineName }
  | {
      type: "engine.delta";
      engine: EngineName;
      partial: unknown;
    }
  | {
      type: "engine.done";
      engine: EngineName;
      result: unknown;
    }
  | {
      type: "engine.error";
      engine: EngineName;
      error: string;
    }
  | { type: "run.done" };

/**
 * Orchestrate all 5 engines with the dependency graph:
 *
 *   Understand ──┬─► Strategize ──┐
 *                └─► Match ───────┴─► Design ──► Create
 *
 * Understand runs alone first. Once it finishes, Strategize + Match run in
 * parallel. Once both finish, Design runs. Once Design finishes, Create runs.
 *
 * Every partial JSON chunk is streamed to the caller via `onEvent` so the UI can
 * render tabs progressively.
 */
export async function orchestrate(
  pursuit: PursuitRecord,
  onEvent: (event: EngineEvent) => void | Promise<void>,
) {
  const base = {
    rfp: pursuit.rfp,
    opportunityName: pursuit.opportunityName,
    clientName: pursuit.clientName,
  };

  const runOne = async <T>(
    engine: EngineName,
    launch: () => Promise<{
      partialObjectStream: AsyncIterable<unknown>;
      object: Promise<unknown>;
    }>,
  ): Promise<T> => {
    await onEvent({ type: "engine.start", engine });
    try {
      const stream = await launch();
      for await (const partial of stream.partialObjectStream) {
        await onEvent({ type: "engine.delta", engine, partial });
      }
      const result = scrubCitationTokens(await stream.object) as T;
      await onEvent({ type: "engine.done", engine, result });
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      await onEvent({ type: "engine.error", engine, error: message });
      throw err;
    }
  };

  // 1) Understand
  const understand = await runOne<OpportunityBrief>("understand", () =>
    runUnderstand(base),
  );

  // 2) Strategize + Match in parallel
  const [strategize, match] = await Promise.all([
    runOne<WinStrategy>("strategize", () =>
      runStrategize({ ...base, understand }),
    ),
    runOne<EvidenceMap>("match", () => runMatch({ ...base, understand })),
  ]);

  // 3) Design
  const design = await runOne<SolutionBlueprint>("design", () =>
    runDesign({ ...base, understand, strategize, match }),
  );

  // 4) Create
  const create = await runOne<ProposalDraft>("create", () =>
    runCreate({ ...base, understand, strategize, match, design }),
  );

  await onEvent({ type: "run.done" });

  return { understand, strategize, match, design, create };
}

export type OrchestrateResults = Awaited<ReturnType<typeof orchestrate>>;

/**
 * Strip internal [C#] citation tokens from every string in the engine output
 * and drop evidence arrays. The tokens map to Armory chunks the reader never
 * sees, so they're noise everywhere they're displayed.
 */
function scrubCitationTokens(input: unknown): unknown {
  if (typeof input === "string") {
    return input
      .replace(/\s*\[C\d+(?:\s*,\s*C\d+)*\]\s*/gi, " ")
      .replace(/\s{2,}/g, " ")
      .trim();
  }
  if (Array.isArray(input)) return input.map(scrubCitationTokens);
  if (input && typeof input === "object") {
    const o: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(input as Record<string, unknown>)) {
      if (k === "evidence") continue;
      o[k] = scrubCitationTokens(v);
    }
    return o;
  }
  return input;
}

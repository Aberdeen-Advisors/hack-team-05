import { NoObjectGeneratedError } from "ai";
import type { PursuitRecord } from "@/lib/pursuit/store";
import {
  runUnderstand,
  runStrategize,
  runMatch,
  runDesign,
  runCreate,
  type EngineName,
  type EngineSource,
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
      type: "engine.sources";
      engine: EngineName;
      sources: EngineSource[];
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
  /**
   * Already-completed engine results (from the cache). Engines present here
   * are NOT re-run; their cached values feed the downstream engines. This is
   * what makes a reconnect resume the run instead of restarting it.
   */
  resume: Partial<{
    understand: OpportunityBrief;
    strategize: WinStrategy;
    match: EvidenceMap;
    design: SolutionBlueprint;
    create: ProposalDraft;
  }> = {},
) {
  const base = {
    rfp: pursuit.rfp,
    opportunityName: pursuit.opportunityName,
    clientName: pursuit.clientName,
    // Passed to every engine so cachedRetrieve can persist / replay
    // per-pursuit Armory hits and avoid re-embedding on resume.
    pursuitId: pursuit.id,
  };

  const runOne = async <T>(
    engine: EngineName,
    launch: () => Promise<{
      stream: {
        partialObjectStream: AsyncIterable<unknown>;
        object: Promise<unknown>;
      };
      sources: EngineSource[];
    }>,
  ): Promise<T> => {
    const cached = resume[engine];
    if (cached) return cached as T;
    await onEvent({ type: "engine.start", engine });

    const attempt = async (): Promise<T> => {
      const { stream, sources } = await launch();
      for await (const partial of stream.partialObjectStream) {
        await onEvent({ type: "engine.delta", engine, partial });
      }
      const result = scrubCitationTokens(await stream.object) as T;
      await onEvent({ type: "engine.done", engine, result });
      await onEvent({ type: "engine.sources", engine, sources });
      return result;
    };

    try {
      try {
        return await attempt();
      } catch (err) {
        // The model produced JSON that failed Zod validation (or was cut
        // off). That is a sampling fluke far more often than a prompt bug,
        // so one fresh attempt usually clears it. Anything else (billing,
        // auth, network) surfaces immediately.
        if (!NoObjectGeneratedError.isInstance(err)) throw err;
        console.warn(
          `[orchestrate] ${engine} output failed schema validation; retrying once.`,
          describeSchemaFailure(err),
        );
        return await attempt();
      }
    } catch (err) {
      const message = NoObjectGeneratedError.isInstance(err)
        ? `${engineLabel(engine)} produced output that did not match its schema after two attempts (${describeSchemaFailure(err)}). Refresh to retry from the last completed engine.`
        : err instanceof Error
          ? err.message
          : String(err);
      await onEvent({ type: "engine.error", engine, error: message });
      throw err;
    }
  };

  // 1) Understand
  const understand = await runOne<OpportunityBrief>("understand", () =>
    runUnderstand(base),
  );

  // 2) Strategize + Match in parallel. allSettled (not all) so a failure in
  // one engine does not abandon the other mid-stream: the survivor still
  // completes, is cached, and a refresh resumes with only the failed engine
  // left to run.
  const [strategizeSettled, matchSettled] = await Promise.allSettled([
    runOne<WinStrategy>("strategize", () =>
      runStrategize({ ...base, understand }),
    ),
    runOne<EvidenceMap>("match", () => runMatch({ ...base, understand })),
  ]);
  if (strategizeSettled.status === "rejected") throw strategizeSettled.reason;
  if (matchSettled.status === "rejected") throw matchSettled.reason;
  const strategize = strategizeSettled.value;
  const match: EvidenceMap = {
    ...matchSettled.value,
    // The schema asks for at most 4 but no longer enforces it, so an
    // over-eager model can't fail the whole run; trim here instead.
    matches: [...(matchSettled.value.matches ?? [])]
      .sort((a, b) => (a.rank ?? 0) - (b.rank ?? 0))
      .slice(0, 4),
  };

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

function engineLabel(engine: EngineName): string {
  return engine.charAt(0).toUpperCase() + engine.slice(1);
}

/**
 * Turn the AI SDK's opaque "response did not match schema" into the actual
 * Zod issues (path + message) so the workspace error tells us WHAT failed.
 */
function describeSchemaFailure(err: unknown): string {
  const cause = (err as { cause?: unknown })?.cause;
  const zodErr = (cause as { cause?: unknown })?.cause ?? cause;
  const issues = (zodErr as { issues?: { path?: unknown[]; message?: string }[] })
    ?.issues;
  if (Array.isArray(issues) && issues.length > 0) {
    return issues
      .slice(0, 3)
      .map((i) => `${(i.path ?? []).join(".") || "root"}: ${i.message ?? "invalid"}`)
      .join("; ");
  }
  const finish = (err as { finishReason?: string })?.finishReason;
  if (finish && finish !== "stop") return `finish reason: ${finish}`;
  return err instanceof Error ? err.message : String(err);
}

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

"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, CircleDashed, Download, Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { UnderstandTab } from "@/components/tabs/understand-tab";
import { StrategizeTab } from "@/components/tabs/strategize-tab";
import { MatchTab } from "@/components/tabs/match-tab";
import { DesignTab } from "@/components/tabs/design-tab";
import { CreateTab } from "@/components/tabs/create-tab";
import type { PursuitRecord } from "@/lib/pursuit/store";
import type { EngineName } from "@/lib/engines/run";
import type {
  OpportunityBrief,
  WinStrategy,
  EvidenceMap,
  SolutionBlueprint,
  ProposalDraft,
} from "@/lib/engines/schemas";

type EngineState<T> = {
  status: "pending" | "running" | "done" | "error";
  partial?: Partial<T>;
  result?: T;
  error?: string;
};

type RunState = {
  understand: EngineState<OpportunityBrief>;
  strategize: EngineState<WinStrategy>;
  match: EngineState<EvidenceMap>;
  design: EngineState<SolutionBlueprint>;
  create: EngineState<ProposalDraft>;
};

const INITIAL: RunState = {
  understand: { status: "pending" },
  strategize: { status: "pending" },
  match: { status: "pending" },
  design: { status: "pending" },
  create: { status: "pending" },
};

const ENGINE_LABELS: Record<EngineName, string> = {
  understand: "Understand",
  strategize: "Strategize",
  match: "Match",
  design: "Design",
  create: "Create",
};

export function Workspace({ pursuit }: { pursuit: PursuitRecord }) {
  const [state, setState] = useState<RunState>(INITIAL);
  const [activeTab, setActiveTab] = useState<EngineName>("understand");
  const [runDone, setRunDone] = useState(false);
  const [runError, setRunError] = useState<string | null>(null);
  const [exporting, setExporting] = useState<null | "pptx" | "docx">(null);

  useEffect(() => {
    const es = new EventSource(`/api/analyze/${pursuit.id}/stream`);

    es.onmessage = (evt) => {
      try {
        const data = JSON.parse(evt.data) as
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
          | { type: "engine.error"; engine: EngineName; error: string }
          | { type: "run.done" }
          | { type: "run.error"; error: string };

        if (data.type === "engine.start") {
          setState((s) => ({
            ...s,
            [data.engine]: { ...s[data.engine], status: "running" },
          }));
          setActiveTab(data.engine);
        } else if (data.type === "engine.delta") {
          setState((s) => ({
            ...s,
            [data.engine]: {
              ...s[data.engine],
              status: "running",
              partial: data.partial as Partial<unknown>,
            },
          }));
        } else if (data.type === "engine.done") {
          setState((s) => ({
            ...s,
            [data.engine]: {
              status: "done",
              partial: undefined,
              result: data.result as never,
            },
          }));
        } else if (data.type === "engine.error") {
          setState((s) => ({
            ...s,
            [data.engine]: { status: "error", error: data.error },
          }));
        } else if (data.type === "run.done") {
          setRunDone(true);
          es.close();
        } else if (data.type === "run.error") {
          setRunError(data.error);
          es.close();
        }
      } catch (err) {
        console.error("SSE parse error", err);
      }
    };

    es.onerror = () => {
      // Browsers auto-reconnect. If the stream is fully closed, we've already run.done'd above.
    };

    return () => {
      es.close();
    };
  }, [pursuit.id]);

  const results = useMemo(
    () => ({
      understand: state.understand.result,
      strategize: state.strategize.result,
      match: state.match.result,
      design: state.design.result,
      create: state.create.result,
    }),
    [state],
  );

  const canExport = runDone && results.understand && results.create;

  async function exportFile(kind: "pptx" | "docx") {
    if (!canExport) return;
    setExporting(kind);
    try {
      const res = await fetch(`/api/export/${kind}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pursuitId: pursuit.id,
          opportunityName: pursuit.opportunityName,
          results,
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download =
        kind === "pptx"
          ? `${(pursuit.opportunityName ?? "pursuit").replace(/\s+/g, "-")}-deck.pptx`
          : `${(pursuit.opportunityName ?? "pursuit").replace(/\s+/g, "-")}-proposal.docx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Export failed");
    } finally {
      setExporting(null);
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="flex flex-col gap-2">
            <span className="inline-flex w-fit items-center rounded-md bg-aberdeen-blue px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-white">
              Pursuit workspace
            </span>
            <h1 className="text-3xl font-bold tracking-tight text-aberdeen-blue sm:text-4xl">
              {pursuit.opportunityName ?? "Untitled opportunity"}
            </h1>
            <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-light text-onyx/70">
              <span className="font-mono text-onyx/80">
                {pursuit.rfp.fileName}
              </span>
              <span className="text-onyx/30">·</span>
              <span>{(pursuit.rfp.charCount / 1000).toFixed(0)}K chars</span>
              <span className="text-onyx/30">·</span>
              <span className="rounded-full border border-border/70 px-2 py-0.5 text-[10px] uppercase tracking-wider text-onyx/70">
                {pursuit.rfp.jurisdiction}
              </span>
            </p>
          </div>
          <div className="flex items-center gap-6">
            <button
              type="button"
              onClick={() => exportFile("docx")}
              disabled={!canExport || exporting !== null}
              className="inline-flex items-center gap-2 border-b border-transparent pb-0.5 text-sm font-medium text-onyx/80 transition-all hover:border-onyx/50 hover:text-aberdeen-blue disabled:cursor-not-allowed disabled:opacity-40"
            >
              {exporting === "docx" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" strokeWidth={1.5} />
              )}
              Export Word
            </button>
            <button
              type="button"
              onClick={() => exportFile("pptx")}
              disabled={!canExport || exporting !== null}
              className="inline-flex items-center gap-2 border-b border-aberdeen-blue pb-0.5 text-sm font-medium text-aberdeen-blue transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
            >
              {exporting === "pptx" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" strokeWidth={1.5} />
              )}
              Export Deck
            </button>
          </div>
        </div>
        {runError && (
          <div className="flex items-center gap-2 rounded-md border border-jasper/40 bg-jasper/[0.04] px-3 py-2 text-sm text-jasper">
            <AlertCircle className="h-4 w-4" />
            {runError}
          </div>
        )}
      </div>

      <Separator className="bg-border/60" />

      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as EngineName)}
      >
        <TabsList className="flex h-auto w-full items-stretch justify-start gap-0 rounded-none border-b border-border/60 bg-transparent p-0">
          {(
            [
              "understand",
              "strategize",
              "match",
              "design",
              "create",
            ] as EngineName[]
          ).map((k, i) => (
            <TabsTrigger
              key={k}
              value={k}
              className="group relative flex flex-1 items-center gap-3 rounded-none border-0 bg-transparent px-4 py-4 text-left text-sm font-light text-onyx/70 shadow-none transition-colors data-[state=active]:bg-transparent data-[state=active]:text-aberdeen-blue data-[state=active]:shadow-none"
            >
              <span className="font-mono text-[11px] text-onyx/50 group-data-[state=active]:text-verdigris">
                0{i + 1}
              </span>
              <div className="flex flex-1 items-center gap-2">
                <StatusDot status={state[k].status} />
                <span className="font-medium">{ENGINE_LABELS[k]}</span>
              </div>
              <span className="absolute inset-x-0 -bottom-px h-px scale-x-0 bg-aberdeen-blue transition-transform group-data-[state=active]:scale-x-100" />
            </TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value="understand" className="mt-6">
          <UnderstandTab state={state.understand} />
        </TabsContent>
        <TabsContent value="strategize" className="mt-6">
          <StrategizeTab state={state.strategize} />
        </TabsContent>
        <TabsContent value="match" className="mt-6">
          <MatchTab state={state.match} />
        </TabsContent>
        <TabsContent value="design" className="mt-6">
          <DesignTab state={state.design} />
        </TabsContent>
        <TabsContent value="create" className="mt-6">
          <CreateTab state={state.create} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function StatusDot({ status }: { status: EngineState<unknown>["status"] }) {
  if (status === "done")
    return <CheckCircle2 className="h-3.5 w-3.5 text-jade" strokeWidth={1.75} />;
  if (status === "running")
    return <Loader2 className="h-3.5 w-3.5 animate-spin text-gold" strokeWidth={1.75} />;
  if (status === "error")
    return <AlertCircle className="h-3.5 w-3.5 text-jasper" strokeWidth={1.75} />;
  return <CircleDashed className="h-3.5 w-3.5 text-onyx/30" strokeWidth={1.5} />;
}

// Re-exported for tab components.
export type { EngineState };
export { Card };

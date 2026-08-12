"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { CheckCircle2, CircleDashed, Download, Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
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
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

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
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-baseline justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-verdigris">
              Pursuit Workspace
            </p>
            <h1 className="text-2xl font-medium text-aberdeen-blue">
              {pursuit.opportunityName ?? "Untitled Opportunity"}
            </h1>
            <p className="text-sm text-onyx">
              RFP: <span className="font-mono">{pursuit.rfp.fileName}</span> ·{" "}
              {(pursuit.rfp.charCount / 1000).toFixed(0)}K chars ·{" "}
              <Badge variant="outline" className="ml-1 uppercase text-xs">
                {pursuit.rfp.jurisdiction}
              </Badge>
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => exportFile("docx")}
              disabled={!canExport || exporting !== null}
            >
              {exporting === "docx" ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Download className="mr-2 h-4 w-4" />
              )}
              Export Word
            </Button>
            <Button
              onClick={() => exportFile("pptx")}
              disabled={!canExport || exporting !== null}
              className="bg-aberdeen-blue text-white hover:bg-aberdeen-blue/90"
            >
              {exporting === "pptx" ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Download className="mr-2 h-4 w-4" />
              )}
              Export Deck
            </Button>
          </div>
        </div>
        {runError && (
          <div className="flex items-center gap-2 rounded-md border border-jasper/40 bg-jasper/10 px-3 py-2 text-sm text-jasper">
            <AlertCircle className="h-4 w-4" />
            {runError}
          </div>
        )}
      </div>

      <Separator />

      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as EngineName)}
      >
        <TabsList className="grid w-full grid-cols-5">
          {(
            [
              "understand",
              "strategize",
              "match",
              "design",
              "create",
            ] as EngineName[]
          ).map((k) => (
            <TabsTrigger key={k} value={k} className="flex items-center gap-2">
              <StatusDot status={state[k].status} />
              {ENGINE_LABELS[k]}
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
    return <CheckCircle2 className="h-4 w-4 text-jade" />;
  if (status === "running")
    return <Loader2 className="h-4 w-4 animate-spin text-verdigris" />;
  if (status === "error")
    return <AlertCircle className="h-4 w-4 text-jasper" />;
  return <CircleDashed className="h-4 w-4 text-onyx/40" />;
}

// Re-exported for tab components.
export type { EngineState };
export { Card };

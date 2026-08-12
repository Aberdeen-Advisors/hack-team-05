import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { EngineState } from "@/components/workspace";
import type { EvidenceMap } from "@/lib/engines/schemas";
import {
  ErrorCard,
  PendingCard,
  SectionHeading,
  StreamingHint,
  tabView,
} from "./shared";

export function MatchTab({ state }: { state: EngineState<EvidenceMap> }) {
  const view = tabView(state);
  if (view.kind === "pending") return <PendingCard label="Evidence Map" />;
  if (view.kind === "error") return <ErrorCard error={view.error} />;
  const { data, isStreaming } = view;
  if (!data) return <StreamingHint label="evidence map" />;

  return (
    <div className="flex flex-col gap-6">
      {isStreaming && <StreamingHint label="evidence map" />}
      <div>
        <SectionHeading>Ranked Aberdeen evidence</SectionHeading>
        <div className="mt-3 flex flex-col gap-4">
          {(data.matches ?? []).map((m, i) => (
            <Card key={i} className="p-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-verdigris">
                    Match #{m?.rank ?? i + 1}
                    {m?.docTag ? ` · ${m.docTag}` : ""}
                  </p>
                  <h3 className="mt-1 text-lg font-medium text-aberdeen-blue">
                    {m?.docName}
                  </h3>
                  <p className="text-sm text-onyx">
                    Client: {m?.clientDescriptor}
                  </p>
                </div>
              </div>
              <p className="mt-3 text-sm text-onyx">{m?.whyRelevant}</p>
              {m?.outcome && (
                <p className="mt-2 rounded-md bg-jade/10 p-2 text-sm text-jade">
                  Outcome: {m.outcome}
                </p>
              )}
              {(m?.rfpRequirementsAddressed?.length ?? 0) > 0 && (
                <div className="mt-3 flex flex-wrap gap-1">
                  {(m?.rfpRequirementsAddressed ?? []).map((r, j) => (
                    <Badge key={j} variant="outline">
                      {r}
                    </Badge>
                  ))}
                </div>
              )}
            </Card>
          ))}
        </div>
      </div>

      {(data.gaps?.length ?? 0) > 0 && (
        <Card className="border-jasper/40 bg-jasper/5 p-6">
          <SectionHeading>Evidence gaps</SectionHeading>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-onyx">
            {(data.gaps ?? []).map((g, i) => (
              <li key={i}>{g}</li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}

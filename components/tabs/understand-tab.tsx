import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GanttTimeline } from "@/components/gantt-timeline";
import type { EngineState } from "@/components/workspace";
import type { OpportunityBrief } from "@/lib/engines/schemas";
import {
  ErrorCard,
  PendingCard,
  SectionHeading,
  StreamingHint,
  tabView,
} from "./shared";

type ResponseAction =
  | "Address"
  | "Provide Information"
  | "Provide Attachment"
  | "Acknowledge / Confirm"
  | "Deliverable if Awarded";

const RESPONSE_ACTION_LEGEND: {
  action: ResponseAction;
  meaning: string;
}[] = [
  {
    action: "Address",
    meaning: "Explain how Aberdeen would meet this requirement; no artifact yet.",
  },
  {
    action: "Provide Information",
    meaning: "Supply specific requested information in the response.",
  },
  {
    action: "Provide Attachment",
    meaning: "A specific form, doc, or pricing file must accompany the proposal.",
  },
  {
    action: "Acknowledge / Confirm",
    meaning: "Explicitly confirm Aberdeen can comply with the condition.",
  },
  {
    action: "Deliverable if Awarded",
    meaning: "Something Aberdeen would actually produce during the engagement.",
  },
];

const ACTION_COLORS: Record<ResponseAction, string> = {
  Address: "border-aberdeen-blue/50 bg-aberdeen-blue/[0.06] text-aberdeen-blue",
  "Provide Information": "border-verdigris/50 bg-verdigris/[0.08] text-verdigris",
  "Provide Attachment": "border-gold/60 bg-gold/[0.12] text-onyx",
  "Acknowledge / Confirm": "border-jade/50 bg-jade/[0.08] text-jade",
  "Deliverable if Awarded": "border-jasper/50 bg-jasper/[0.06] text-jasper",
};

export function UnderstandTab({
  state,
}: {
  state: EngineState<OpportunityBrief>;
}) {
  const view = tabView(state);
  if (view.kind === "pending") return <PendingCard label="Opportunity Brief" />;
  if (view.kind === "error") return <ErrorCard error={view.error} />;
  const { data, isStreaming } = view;
  if (!data) return <StreamingHint label="opportunity brief" />;

  return (
    <div className="flex flex-col gap-6">
      {isStreaming && <StreamingHint label="opportunity brief" />}
      <Card className="p-6">
        <SectionHeading>Client</SectionHeading>
        <p className="mt-2 text-lg font-medium text-aberdeen-blue">
          {data.clientDescriptor ?? "…"}
        </p>
        <div className="mt-4 grid gap-6 md:grid-cols-2">
          <div>
            <SectionHeading>Objectives</SectionHeading>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-onyx">
              {(data.objectives ?? []).map((o, i) => (
                <li key={i}>{o}</li>
              ))}
            </ul>
          </div>
          <div>
            <SectionHeading>Pain points</SectionHeading>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-onyx">
              {(data.painPoints ?? []).map((p, i) => (
                <li key={i}>{p}</li>
              ))}
            </ul>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <SectionHeading>Scope</SectionHeading>
        <p className="mt-2 text-sm leading-relaxed text-onyx">
          {data.scope ?? "…"}
        </p>
      </Card>

      <Card className="p-6">
        <div className="flex items-baseline justify-between gap-4">
          <SectionHeading>Requirements matrix</SectionHeading>
          <span className="text-[10px] font-light text-onyx/60">
            Response actions defined in the legend below.
          </span>
        </div>
        <div className="mt-3 overflow-hidden rounded-md border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted text-aberdeen-blue">
              <tr>
                <th className="p-2 text-left">ID</th>
                <th className="p-2 text-left">Requirement</th>
                <th className="p-2 text-left">Category</th>
                <th className="p-2 text-left">Mandatory</th>
                <th className="p-2 text-left">Response Action</th>
              </tr>
            </thead>
            <tbody>
              {(data.requirements ?? []).map((r, i) => {
                const action = r?.responseAction as ResponseAction | undefined;
                const cls = action
                  ? ACTION_COLORS[action]
                  : "border-border/60 text-onyx/60";
                return (
                  <tr key={i} className="border-t border-border">
                    <td className="p-2 font-mono text-xs">{r?.id}</td>
                    <td className="p-2 text-onyx">{r?.requirement}</td>
                    <td className="p-2">
                      <Badge variant="outline" className="text-xs">
                        {r?.category}
                      </Badge>
                    </td>
                    <td className="p-2">
                      {r?.mandatory ? (
                        <Badge className="bg-jasper text-white">Mandatory</Badge>
                      ) : (
                        <Badge variant="secondary">Optional</Badge>
                      )}
                    </td>
                    <td className="p-2">
                      {action ? (
                        <span
                          className={`inline-block rounded-full border px-2 py-0.5 text-[11px] font-medium ${cls}`}
                        >
                          {action}
                        </span>
                      ) : (
                        <span className="text-xs text-onyx/40">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Legend */}
        <div className="mt-4 rounded-md border border-border/70 bg-muted/40 p-4">
          <p className="text-[11px] font-medium uppercase tracking-widest text-onyx/60">
            Response Action — legend
          </p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {RESPONSE_ACTION_LEGEND.map((r) => (
              <div key={r.action} className="flex flex-col gap-1">
                <span
                  className={`w-fit rounded-full border px-2 py-0.5 text-[11px] font-medium ${ACTION_COLORS[r.action]}`}
                >
                  {r.action}
                </span>
                <p className="text-xs font-light text-onyx/80">{r.meaning}</p>
              </div>
            ))}
          </div>
        </div>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="p-6">
          <SectionHeading>Evaluation criteria</SectionHeading>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-onyx">
            {(data.evaluationCriteria ?? []).map((c, i) => (
              <li key={i}>{c}</li>
            ))}
          </ul>
        </Card>
        <Card className="p-6">
          <SectionHeading>Compliance notes</SectionHeading>
          <p className="mt-2 text-sm text-onyx">{data.complianceNotes}</p>
        </Card>
      </div>

      <Card className="p-6">
        <SectionHeading>Timeline</SectionHeading>
        <p className="mt-1 text-xs font-light text-onyx/60">
          Key dates and intermediate milestones across the pursuit window.
        </p>
        <div className="mt-4">
          <GanttTimeline
            items={(data.timeline ?? []).map((t) => ({
              label: t?.milestone ?? "",
              date: t?.date,
            }))}
          />
        </div>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="p-6">
          <SectionHeading>Risks & constraints</SectionHeading>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-onyx">
            {(data.risksAndConstraints ?? []).map((r, i) => (
              <li key={i}>{r}</li>
            ))}
          </ul>
        </Card>
        <Card className="p-6">
          <SectionHeading>Questions to send back</SectionHeading>
          <ul className="mt-2 list-decimal space-y-1 pl-5 text-sm text-onyx">
            {(data.stakeholderQuestions ?? []).map((q, i) => (
              <li key={i}>{q}</li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}

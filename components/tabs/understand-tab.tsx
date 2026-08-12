import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { EngineState } from "@/components/workspace";
import type { OpportunityBrief } from "@/lib/engines/schemas";
import {
  ErrorCard,
  PendingCard,
  SectionHeading,
  StreamingHint,
  tabView,
} from "./shared";

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
        <SectionHeading>Requirements matrix</SectionHeading>
        <div className="mt-3 overflow-hidden rounded-md border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted text-aberdeen-blue">
              <tr>
                <th className="p-2 text-left">ID</th>
                <th className="p-2 text-left">Requirement</th>
                <th className="p-2 text-left">Category</th>
                <th className="p-2 text-left">Mandatory</th>
              </tr>
            </thead>
            <tbody>
              {(data.requirements ?? []).map((r, i) => (
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
                </tr>
              ))}
            </tbody>
          </table>
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
          <SectionHeading>Timeline</SectionHeading>
          <ul className="mt-2 space-y-1 text-sm text-onyx">
            {(data.timeline ?? []).map((t, i) => (
              <li key={i} className="flex gap-2">
                <span className="font-mono text-xs text-verdigris">
                  {t?.date}
                </span>
                <span>{t?.milestone}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="p-6">
          <SectionHeading>Compliance notes</SectionHeading>
          <p className="mt-2 text-sm text-onyx">{data.complianceNotes}</p>
        </Card>
        <Card className="p-6">
          <SectionHeading>Risks & constraints</SectionHeading>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-onyx">
            {(data.risksAndConstraints ?? []).map((r, i) => (
              <li key={i}>{r}</li>
            ))}
          </ul>
        </Card>
      </div>

      <Card className="p-6">
        <SectionHeading>Questions to send back</SectionHeading>
        <ul className="mt-2 list-decimal space-y-1 pl-5 text-sm text-onyx">
          {(data.stakeholderQuestions ?? []).map((q, i) => (
            <li key={i}>{q}</li>
          ))}
        </ul>
      </Card>
    </div>
  );
}

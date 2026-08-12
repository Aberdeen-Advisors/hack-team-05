import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { EngineState } from "@/components/workspace";
import type { SolutionBlueprint } from "@/lib/engines/schemas";
import {
  ErrorCard,
  PendingCard,
  SectionHeading,
  StreamingHint,
  tabView,
} from "./shared";

export function DesignTab({ state }: { state: EngineState<SolutionBlueprint> }) {
  const view = tabView(state);
  if (view.kind === "pending") return <PendingCard label="Solution Blueprint" />;
  if (view.kind === "error") return <ErrorCard error={view.error} />;
  const { data, isStreaming } = view;
  if (!data) return <StreamingHint label="solution blueprint" />;

  return (
    <div className="flex flex-col gap-6">
      {isStreaming && <StreamingHint label="solution blueprint" />}
      <Card className="p-6">
        <SectionHeading>Proposed approach</SectionHeading>
        <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-onyx">
          {data.approach}
        </p>
      </Card>

      <div>
        <SectionHeading>Workstreams</SectionHeading>
        <div className="mt-3 grid gap-4 md:grid-cols-3">
          {(data.workstreams ?? []).map((w, i) => (
            <Card key={i} className="p-6">
              <h3 className="text-base font-medium text-aberdeen-blue">
                {w?.name}
              </h3>
              <p className="mt-1 text-xs uppercase tracking-wider text-verdigris">
                Objective
              </p>
              <p className="text-sm text-onyx">{w?.objective}</p>
              <p className="mt-2 text-xs uppercase tracking-wider text-verdigris">
                Key activities
              </p>
              <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-onyx">
                {(w?.keyActivities ?? []).map((a, j) => (
                  <li key={j}>{a}</li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
      </div>

      <Card className="p-6">
        <SectionHeading>Staffing model</SectionHeading>
        <div className="mt-3 overflow-hidden rounded-md border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted text-aberdeen-blue">
              <tr>
                <th className="p-2 text-left">Role</th>
                <th className="p-2 text-left">Responsibility</th>
                <th className="p-2 text-left w-32">Allocation</th>
              </tr>
            </thead>
            <tbody>
              {(data.staffingModel ?? []).map((s, i) => (
                <tr key={i} className="border-t border-border">
                  <td className="p-2 font-medium text-aberdeen-blue">
                    {s?.role}
                  </td>
                  <td className="p-2 text-onyx">{s?.responsibility}</td>
                  <td className="p-2">
                    <Badge variant="outline">{s?.allocationPct}%</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="p-6">
        <SectionHeading>7-day pursuit plan</SectionHeading>
        <div className="mt-3 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {(data.sevenDayPursuitPlan ?? []).map((d, i) => (
            <div key={i} className="rounded-md border border-border p-3">
              <div className="flex items-baseline justify-between">
                <p className="text-xs font-semibold uppercase tracking-wider text-verdigris">
                  Day {d?.day} · {d?.engine}
                </p>
                <Badge variant="outline" className="text-xs">
                  {d?.reviewer}
                </Badge>
              </div>
              <ul className="mt-2 list-disc space-y-1 pl-4 text-xs text-onyx">
                {(d?.deliverables ?? []).map((del, j) => (
                  <li key={j}>{del}</li>
                ))}
              </ul>
              <p className="mt-2 text-xs italic text-onyx/70">
                Checkpoint: {d?.checkpoint}
              </p>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-6">
        <SectionHeading>Delivery timeline (post-award)</SectionHeading>
        <ul className="mt-2 space-y-1 text-sm text-onyx">
          {(data.deliveryTimeline ?? []).map((t, i) => (
            <li key={i} className="flex gap-2">
              <span className="font-mono text-xs text-verdigris">
                {t?.weekOffset}
              </span>
              <span>{t?.milestone}</span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}

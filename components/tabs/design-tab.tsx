"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GanttTimeline } from "@/components/gantt-timeline";
import { Editable, EditableList, EditableParagraph } from "@/components/editable";
import { useEditing } from "@/lib/editing/context";
import type { EngineState } from "@/components/workspace";
import type { SolutionBlueprint } from "@/lib/engines/schemas";
import {
  ErrorCard,
  PendingCard,
  SectionHeading,
  StreamingHint,
  tabView,
} from "./shared";

type Workstream = NonNullable<SolutionBlueprint["workstreams"]>[number];
type Staff = NonNullable<SolutionBlueprint["staffingModel"]>[number];

export function DesignTab({
  state,
  effectiveResult,
}: {
  state: EngineState<SolutionBlueprint>;
  effectiveResult?: SolutionBlueprint;
}) {
  const view = tabView(state, effectiveResult);
  const { updateEngine } = useEditing();

  if (view.kind === "pending") return <PendingCard label="Solution Blueprint" />;
  if (view.kind === "error") return <ErrorCard error={view.error} />;
  const { data, isStreaming } = view;
  if (!data) return <StreamingHint label="solution blueprint" />;

  const update = <K extends keyof SolutionBlueprint>(
    key: K,
    value: SolutionBlueprint[K],
  ) => {
    updateEngine<SolutionBlueprint & Record<string, unknown>>(
      "design",
      (prev) => ({ ...((prev ?? data) as SolutionBlueprint), [key]: value }),
    );
  };

  const updateWorkstream = (i: number, patch: Partial<Workstream>) => {
    const ws = [...(data.workstreams ?? [])];
    if (ws[i]) {
      ws[i] = { ...ws[i], ...patch } as Workstream;
      update("workstreams", ws);
    }
  };

  const updateStaff = (i: number, patch: Partial<Staff>) => {
    const staff = [...(data.staffingModel ?? [])];
    if (staff[i]) {
      staff[i] = { ...staff[i], ...patch } as Staff;
      update("staffingModel", staff);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {isStreaming && <StreamingHint label="solution blueprint" />}
      <Card className="p-6">
        <SectionHeading>Proposed approach</SectionHeading>
        <div className="mt-2 text-sm leading-relaxed text-onyx">
          <EditableParagraph
            value={data.approach}
            onChange={(v) => update("approach", v)}
            placeholder="2-3 paragraphs on the solution approach"
            minRows={4}
          />
        </div>
      </Card>

      <div>
        <SectionHeading>Workstreams</SectionHeading>
        <div className="mt-3 grid gap-4 md:grid-cols-3">
          {(data.workstreams ?? []).map((w, i) => (
            <Card key={i} className="p-6">
              <h3 className="text-base font-medium text-aberdeen-blue">
                <Editable
                  value={w?.name}
                  onChange={(v) => updateWorkstream(i, { name: v })}
                  placeholder="Workstream name"
                />
              </h3>
              <p className="mt-1 text-xs uppercase tracking-wider text-verdigris">
                Objective
              </p>
              <div className="text-sm text-onyx">
                <EditableParagraph
                  value={w?.objective}
                  onChange={(v) => updateWorkstream(i, { objective: v })}
                  placeholder="One-sentence objective"
                  minRows={2}
                />
              </div>
              <p className="mt-2 text-xs uppercase tracking-wider text-verdigris">
                Key activities
              </p>
              <div className="mt-1 pl-5 text-sm text-onyx">
                <EditableList
                  items={w?.keyActivities}
                  onChange={(v) => updateWorkstream(i, { keyActivities: v })}
                  itemPlaceholder="Add an activity"
                />
              </div>
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
                    <Editable
                      value={s?.role}
                      onChange={(v) => updateStaff(i, { role: v })}
                      placeholder="Role"
                    />
                  </td>
                  <td className="p-2 text-onyx">
                    <Editable
                      value={s?.responsibility}
                      onChange={(v) => updateStaff(i, { responsibility: v })}
                      placeholder="Responsibility"
                    />
                  </td>
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
        <SectionHeading>Delivery timeline (post-award)</SectionHeading>
        <p className="mt-1 text-xs font-light text-onyx/60">
          Key milestones across the engagement window.
        </p>
        <div className="mt-4">
          <GanttTimeline
            items={(data.deliveryTimeline ?? []).map((t) => ({
              label: t?.milestone ?? "",
              weekOffset: t?.weekOffset,
            }))}
          />
        </div>
      </Card>
    </div>
  );
}

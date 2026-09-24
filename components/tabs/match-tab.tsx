"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Editable, EditableList, EditableParagraph } from "@/components/editable";
import { useEditing } from "@/lib/editing/context";
import type { EngineState } from "@/components/workspace";
import type { EvidenceMap } from "@/lib/engines/schemas";
import {
  ErrorCard,
  PendingCard,
  SectionHeading,
  StreamingHint,
  tabView,
} from "./shared";

type Match = NonNullable<EvidenceMap["matches"]>[number];

export function MatchTab({
  state,
  effectiveResult,
}: {
  state: EngineState<EvidenceMap>;
  effectiveResult?: EvidenceMap;
}) {
  const view = tabView(state, effectiveResult);
  const { updateEngine } = useEditing();

  if (view.kind === "pending") return <PendingCard label="Evidence Map" />;
  if (view.kind === "error") return <ErrorCard error={view.error} />;
  const { data, isStreaming } = view;
  if (!data) return <StreamingHint label="evidence map" />;

  const update = <K extends keyof EvidenceMap>(
    key: K,
    value: EvidenceMap[K],
  ) => {
    updateEngine<EvidenceMap & Record<string, unknown>>("match", (prev) => ({
      ...((prev ?? data) as EvidenceMap),
      [key]: value,
    }));
  };

  const updateMatch = (i: number, patch: Partial<Match>) => {
    const matches = [...(data.matches ?? [])];
    if (matches[i]) {
      matches[i] = { ...matches[i], ...patch } as Match;
      update("matches", matches);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {isStreaming && <StreamingHint label="evidence map" />}
      <div>
        <SectionHeading>Ranked Aberdeen evidence</SectionHeading>
        {!isStreaming && (data.matches?.length ?? 0) === 0 && (
          <Card className="mt-3 p-6 text-sm text-onyx/70">
            No Armory engagement is a genuine analog for this request. Nothing
            was stretched to fill the gap; see the evidence gaps below for what
            the pursuit team needs to source.
          </Card>
        )}
        <div className="mt-3 flex flex-col gap-4">
          {(data.matches ?? []).map((m, i) => (
            <Card key={i} className="p-6">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <p className="text-xs font-semibold uppercase tracking-wider text-verdigris">
                    Match #{m?.rank ?? i + 1}
                    {m?.docTag ? ` · ${m.docTag}` : ""}
                  </p>
                  <div className="mt-1 text-lg font-medium text-aberdeen-blue">
                    <Editable
                      value={m?.clientDescriptor}
                      onChange={(v) => updateMatch(i, { clientDescriptor: v })}
                      emptyLabel="Prior Aberdeen engagement"
                      placeholder="Anonymized descriptor"
                    />
                  </div>
                </div>
              </div>
              <div className="mt-3 text-sm text-onyx">
                <EditableParagraph
                  value={m?.whyRelevant}
                  onChange={(v) => updateMatch(i, { whyRelevant: v })}
                  placeholder="Why this evidence is relevant"
                  minRows={2}
                />
              </div>
              {(m?.outcome !== undefined || m?.outcome === "") && (
                <div className="mt-2 rounded-md bg-jade/10 p-2 text-sm text-jade">
                  <span className="font-semibold">Outcome:</span>{" "}
                  <Editable
                    value={m?.outcome}
                    onChange={(v) => updateMatch(i, { outcome: v })}
                    placeholder="Measurable outcome"
                    className="text-jade"
                  />
                </div>
              )}
              {(() => {
                const reqs = (m?.rfpRequirementsAddressed ?? []).filter(
                  (r) => !!r && !/^\s*R\d+\s*$/i.test(r),
                );
                return reqs.length > 0 ? (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    <span className="text-[10px] font-semibold uppercase tracking-widest text-onyx/50">
                      Addresses
                    </span>
                    {reqs.map((r, j) => (
                      <Badge key={j} variant="outline" className="text-xs font-normal">
                        {r}
                      </Badge>
                    ))}
                  </div>
                ) : null;
              })()}
            </Card>
          ))}
        </div>
      </div>

      {(data.gaps?.length ?? 0) > 0 && (
        <Card className="border-jasper/40 bg-jasper/5 p-6">
          <SectionHeading>Evidence gaps</SectionHeading>
          <div className="mt-2 pl-5 text-sm text-onyx">
            <EditableList
              items={data.gaps}
              onChange={(v) => update("gaps", v)}
              itemPlaceholder="Add a gap"
            />
          </div>
        </Card>
      )}
    </div>
  );
}

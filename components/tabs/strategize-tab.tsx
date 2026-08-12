import { Card } from "@/components/ui/card";
import type { EngineState } from "@/components/workspace";
import type { WinStrategy } from "@/lib/engines/schemas";
import {
  ErrorCard,
  EvidenceChip,
  PendingCard,
  SectionHeading,
  StreamingHint,
  tabView,
} from "./shared";

export function StrategizeTab({ state }: { state: EngineState<WinStrategy> }) {
  const view = tabView(state);
  if (view.kind === "pending") return <PendingCard label="Win Strategy" />;
  if (view.kind === "error") return <ErrorCard error={view.error} />;
  const { data, isStreaming } = view;
  if (!data) return <StreamingHint label="win strategy" />;

  return (
    <div className="flex flex-col gap-6">
      {isStreaming && <StreamingHint label="win strategy" />}
      <Card className="p-6">
        <SectionHeading>Aberdeen&apos;s point of view</SectionHeading>
        <p className="mt-2 text-sm leading-relaxed text-onyx">
          {data.pointOfView}
        </p>
      </Card>

      <div>
        <SectionHeading>Win themes</SectionHeading>
        <div className="mt-3 grid gap-4 md:grid-cols-2">
          {(data.winThemes ?? []).map((t, i) => (
            <Card key={i} className="border-l-4 border-l-verdigris p-6">
              <h3 className="text-lg font-medium text-aberdeen-blue">
                {i + 1}. {t?.title}
              </h3>
              <div className="mt-3 flex flex-col gap-3 text-sm">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-verdigris">
                    Technical angle
                  </p>
                  <p className="text-onyx">{t?.technicalAngle}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-verdigris">
                    Human angle
                  </p>
                  <p className="text-onyx">{t?.humanAngle}</p>
                </div>
                {(t?.evidence?.length ?? 0) > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {(t?.evidence ?? []).map((e, j) => (
                      <EvidenceChip
                        key={j}
                        tag={e?.tag ?? ""}
                        quote={e?.quote ?? ""}
                      />
                    ))}
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>

      <Card className="p-6">
        <SectionHeading>Differentiators — why Aberdeen</SectionHeading>
        <div className="mt-3 flex flex-col gap-4">
          {(data.differentiators ?? []).map((d, i) => (
            <div key={i} className="rounded-md border border-border p-4">
              <p className="text-sm font-medium text-aberdeen-blue">
                {d?.claim}
              </p>
              <p className="mt-1 text-sm text-onyx">{d?.why}</p>
              {(d?.evidence?.length ?? 0) > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {(d?.evidence ?? []).map((e, j) => (
                    <EvidenceChip
                      key={j}
                      tag={e?.tag ?? ""}
                      quote={e?.quote ?? ""}
                    />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-6">
        <SectionHeading>Competitive positioning</SectionHeading>
        <p className="mt-2 text-sm text-onyx">{data.competitivePositioning}</p>
      </Card>
    </div>
  );
}

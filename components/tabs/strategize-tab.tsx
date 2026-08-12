import { Card } from "@/components/ui/card";
import type { EngineState } from "@/components/workspace";
import type { WinStrategy } from "@/lib/engines/schemas";
import {
  ErrorCard,
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
              <p className="font-mono text-xs text-verdigris">
                Theme {String(i + 1).padStart(2, "0")}
              </p>
              <h3 className="mt-1 text-lg font-medium leading-snug text-aberdeen-blue">
                {t?.title}
              </h3>
              <div className="mt-4 flex flex-col gap-5 text-sm">
                <AngleBlock
                  label="Human"
                  summary={t?.humanAngle?.summary}
                  bullets={t?.humanAngle?.bullets}
                  accent="teal"
                />
                <AngleBlock
                  label="Technical"
                  summary={t?.technicalAngle?.summary}
                  bullets={t?.technicalAngle?.bullets}
                  accent="blue"
                />
                {/* Internal evidence tags intentionally hidden — they carry no meaning to the reader */}
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

function AngleBlock({
  label,
  summary,
  bullets,
  accent,
}: {
  label: string;
  summary?: string;
  bullets?: Array<{ headline?: string; body?: string } | undefined>;
  accent: "blue" | "teal";
}) {
  const chipCls =
    accent === "teal"
      ? "border-verdigris/50 bg-verdigris/10 text-verdigris"
      : "border-aberdeen-blue/40 bg-aberdeen-blue/[0.05] text-aberdeen-blue";
  return (
    <div>
      <div className="flex items-center gap-2">
        <span
          className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest ${chipCls}`}
        >
          {label}
        </span>
        {summary && (
          <p className="text-sm font-medium text-aberdeen-blue">{summary}</p>
        )}
      </div>
      <ul className="mt-3 flex flex-col gap-2">
        {(bullets ?? []).map((b, i) => (
          <li
            key={i}
            className="flex gap-2 text-sm leading-relaxed text-onyx"
          >
            <span
              className={`mt-1.5 h-1 w-1 flex-shrink-0 rounded-full ${
                accent === "teal" ? "bg-verdigris" : "bg-aberdeen-blue"
              }`}
            />
            <span>
              {b?.headline && (
                <span className="font-semibold text-aberdeen-blue">
                  {b.headline}
                  {b?.body ? " — " : ""}
                </span>
              )}
              {b?.body}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

"use client";

import { Card } from "@/components/ui/card";
import { Editable, EditableParagraph } from "@/components/editable";
import { useEditing } from "@/lib/editing/context";
import type { EngineState } from "@/components/workspace";
import type { WinStrategy } from "@/lib/engines/schemas";
import {
  ErrorCard,
  PendingCard,
  SectionHeading,
  StreamingHint,
  tabView,
} from "./shared";

type Theme = NonNullable<WinStrategy["winThemes"]>[number];
type Angle = NonNullable<Theme["humanAngle"] | Theme["technicalAngle"]>;
type Differentiator = NonNullable<WinStrategy["differentiators"]>[number];

export function StrategizeTab({
  state,
  effectiveResult,
}: {
  state: EngineState<WinStrategy>;
  effectiveResult?: WinStrategy;
}) {
  const view = tabView(state, effectiveResult);
  const { updateEngine } = useEditing();

  if (view.kind === "pending") return <PendingCard label="Win Strategy" />;
  if (view.kind === "error") return <ErrorCard error={view.error} />;
  const { data, isStreaming } = view;
  if (!data) return <StreamingHint label="win strategy" />;

  const update = <K extends keyof WinStrategy>(
    key: K,
    value: WinStrategy[K],
  ) => {
    updateEngine<WinStrategy & Record<string, unknown>>("strategize", (prev) => ({
      ...((prev ?? data) as WinStrategy),
      [key]: value,
    }));
  };

  const updateTheme = (i: number, patch: Partial<Theme>) => {
    const themes = [...(data.winThemes ?? [])];
    if (themes[i]) {
      themes[i] = { ...themes[i], ...patch } as Theme;
      update("winThemes", themes);
    }
  };

  const updateDifferentiator = (i: number, patch: Partial<Differentiator>) => {
    const diffs = [...(data.differentiators ?? [])];
    if (diffs[i]) {
      diffs[i] = { ...diffs[i], ...patch } as Differentiator;
      update("differentiators", diffs);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {isStreaming && <StreamingHint label="win strategy" />}
      <Card className="p-6">
        <SectionHeading>Aberdeen&apos;s point of view</SectionHeading>
        <div className="mt-2 text-sm leading-relaxed text-onyx">
          <EditableParagraph
            value={data.pointOfView}
            onChange={(v) => update("pointOfView", v)}
            placeholder="One tight paragraph articulating our point of view"
            minRows={3}
          />
        </div>
      </Card>

      <div>
        <SectionHeading>Win themes</SectionHeading>
        <div className="mt-3 grid gap-4 md:grid-cols-2">
          {(data.winThemes ?? []).map((t, i) => (
            <Card key={i} className="border-l-4 border-l-verdigris p-6">
              <p className="font-mono text-xs text-verdigris">
                Theme {String(i + 1).padStart(2, "0")}
              </p>
              <div className="mt-1 text-lg font-medium leading-snug text-aberdeen-blue">
                <Editable
                  value={t?.title}
                  onChange={(v) => updateTheme(i, { title: v })}
                  placeholder="Theme title"
                />
              </div>
              <div className="mt-4 flex flex-col gap-5 text-sm">
                <AngleBlock
                  label="Human"
                  accent="teal"
                  angle={t?.humanAngle}
                  onChange={(next) =>
                    updateTheme(i, { humanAngle: next as Angle })
                  }
                />
                <AngleBlock
                  label="Technical"
                  accent="blue"
                  angle={t?.technicalAngle}
                  onChange={(next) =>
                    updateTheme(i, { technicalAngle: next as Angle })
                  }
                />
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
              <div className="text-sm font-medium text-aberdeen-blue">
                <Editable
                  value={d?.claim}
                  onChange={(v) => updateDifferentiator(i, { claim: v })}
                  placeholder="Differentiator claim"
                />
              </div>
              <div className="mt-1 text-sm text-onyx">
                <EditableParagraph
                  value={d?.why}
                  onChange={(v) => updateDifferentiator(i, { why: v })}
                  placeholder="Why this matters"
                  minRows={2}
                />
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-6">
        <SectionHeading>Competitive positioning</SectionHeading>
        <div className="mt-2 text-sm text-onyx">
          <EditableParagraph
            value={data.competitivePositioning}
            onChange={(v) => update("competitivePositioning", v)}
            placeholder="What competitors will over-index on, and how Aberdeen differentiates"
            minRows={2}
          />
        </div>
      </Card>
    </div>
  );
}

function AngleBlock({
  label,
  angle,
  accent,
  onChange,
}: {
  label: string;
  angle?: Angle;
  accent: "blue" | "teal";
  onChange: (next: Angle) => void;
}) {
  const chipCls =
    accent === "teal"
      ? "border-verdigris/50 bg-verdigris/10 text-verdigris"
      : "border-aberdeen-blue/40 bg-aberdeen-blue/[0.05] text-aberdeen-blue";

  const updateSummary = (v: string) => {
    onChange({ ...(angle ?? ({} as Angle)), summary: v });
  };
  const updateBullet = (
    i: number,
    field: "headline" | "body",
    v: string,
  ) => {
    const bullets = [...(angle?.bullets ?? [])];
    if (bullets[i]) {
      bullets[i] = { ...bullets[i], [field]: v };
      onChange({ ...(angle ?? ({} as Angle)), bullets });
    }
  };

  return (
    <div>
      <div className="flex items-baseline gap-2">
        <span
          className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest ${chipCls}`}
        >
          {label}
        </span>
        <div className="flex-1 text-sm font-medium text-aberdeen-blue">
          <Editable
            value={angle?.summary}
            onChange={updateSummary}
            placeholder="One-sentence summary"
          />
        </div>
      </div>
      <ul className="mt-3 flex flex-col gap-2">
        {(angle?.bullets ?? []).map((b, i) => (
          <li
            key={i}
            className="flex gap-2 text-sm leading-relaxed text-onyx"
          >
            <span
              className={`mt-1.5 h-1 w-1 flex-shrink-0 rounded-full ${
                accent === "teal" ? "bg-verdigris" : "bg-aberdeen-blue"
              }`}
            />
            <span className="flex-1">
              <span className="font-semibold text-aberdeen-blue">
                <Editable
                  value={b?.headline}
                  onChange={(v) => updateBullet(i, "headline", v)}
                  placeholder="Headline"
                />
              </span>
              {b?.body || b?.headline ? " — " : null}
              <Editable
                value={b?.body}
                onChange={(v) => updateBullet(i, "body", v)}
                placeholder="Body"
              />
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

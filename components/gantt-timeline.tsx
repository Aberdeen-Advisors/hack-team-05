"use client";

import { useMemo } from "react";

export type GanttItem = {
  label: string;
  date?: string;
  weekOffset?: string;
  kind?: "milestone" | "phase";
};

type Parsed = {
  raw: string;
  displayDate: string;
  label: string;
  t: number | null; // null = unparseable
  kind: "milestone" | "phase";
};

/**
 * Single-bar horizontal timeline.
 * One continuous line spanning the width; milestones sit as markers on the
 * line with the label above and the date below. Labels alternate top/bottom
 * to reduce collision. Unparseable ("TBD") items get stacked on the right
 * in a small separate column.
 */
export function GanttTimeline({ items }: { items: GanttItem[] }) {
  const { valid, tbd } = useMemo(() => split(items), [items]);
  if (valid.length + tbd.length === 0) return null;

  const validTs = valid.map((r) => r.t as number);
  const minT = validTs.length ? Math.min(...validTs) : 0;
  const maxT = validTs.length ? Math.max(...validTs) : 1;
  const span = Math.max(maxT - minT, 1);

  const pctFor = (t: number) => {
    if (valid.length === 1) return 50;
    return ((t - minT) / span) * 100;
  };

  // Merge markers with the same position (rare, but cleaner)
  const markers = valid.map((r, i) => ({
    ...r,
    idx: i,
    pct: pctFor(r.t as number),
    stackAbove: i % 2 === 0,
  }));

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-border/70 bg-background p-6">
      <div className="flex items-stretch gap-6">
        {/* Main timeline bar */}
        <div className="relative flex-1 py-10">
          {/* End caps */}
          <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2">
            <div className="relative h-1 w-full rounded-full bg-gradient-to-r from-verdigris via-aberdeen-blue/70 to-aberdeen-blue">
              <div className="absolute -left-1 top-1/2 h-3 w-3 -translate-y-1/2 rounded-full bg-verdigris" />
              <div className="absolute -right-1 top-1/2 h-3 w-3 -translate-y-1/2 rounded-full bg-aberdeen-blue" />
            </div>
          </div>

          {/* Markers */}
          <div className="relative h-full">
            {markers.map((m) => (
              <div
                key={m.idx}
                className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${m.pct}%` }}
              >
                {/* Vertical connector line */}
                <div
                  className={
                    m.stackAbove
                      ? "absolute left-1/2 top-1/2 h-8 w-px -translate-x-1/2 -translate-y-full bg-border"
                      : "absolute left-1/2 top-1/2 h-8 w-px -translate-x-1/2 bg-border"
                  }
                />
                {/* Marker itself */}
                {m.kind === "milestone" ? (
                  <div className="relative z-10 h-3 w-3 rotate-45 border border-aberdeen-blue bg-aberdeen-blue" />
                ) : (
                  <div className="relative z-10 h-3 w-3 rounded-full border-2 border-verdigris bg-background" />
                )}

                {/* Label (above or below depending on stackAbove) */}
                <div
                  className={
                    m.stackAbove
                      ? "absolute bottom-full left-1/2 mb-9 w-40 -translate-x-1/2 text-center"
                      : "absolute top-full left-1/2 mt-9 w-40 -translate-x-1/2 text-center"
                  }
                >
                  <p
                    className="line-clamp-2 text-xs font-medium leading-snug text-aberdeen-blue"
                    title={m.label}
                  >
                    {m.label}
                  </p>
                  <p className="mt-0.5 font-mono text-[10px] text-verdigris">
                    {m.displayDate}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* TBD column on the right, if any */}
        {tbd.length > 0 && (
          <div className="flex w-40 flex-col gap-2 border-l border-dashed border-border/70 pl-4">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-onyx/50">
              Timing TBD
            </p>
            <ul className="flex flex-col gap-1.5 text-xs text-onyx">
              {tbd.map((r, i) => (
                <li key={i} className="flex gap-1.5">
                  <span className="mt-1 h-1 w-1 flex-shrink-0 rounded-full bg-onyx/40" />
                  <span className="leading-snug">{r.label}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 border-t border-border/60 pt-3 text-[10px] font-medium text-onyx/60">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rotate-45 border border-aberdeen-blue bg-aberdeen-blue" />
          Milestone
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full border-2 border-verdigris bg-background" />
          Phase
        </span>
      </div>
    </div>
  );
}

function split(items: GanttItem[]) {
  const all: Parsed[] = items
    .filter((i) => i.label)
    .map((i) => {
      const rawSource = (i.date ?? i.weekOffset ?? "").trim();
      const t = parseTime(rawSource);
      return {
        raw: rawSource,
        displayDate: formatDisplay(rawSource) || "TBD",
        label: i.label,
        t,
        kind: i.kind ?? guessKind(i.label),
      };
    });
  const valid = all
    .filter((r): r is Parsed & { t: number } => r.t !== null)
    .sort((a, b) => a.t - b.t);
  const tbd = all.filter((r) => r.t === null);
  return { valid, tbd };
}

function guessKind(label: string): "milestone" | "phase" {
  if (
    /due|submit|award|deadline|kickoff|go[- ]?live|launch|complete|posted|released/i.test(
      label,
    )
  ) {
    return "milestone";
  }
  return "phase";
}

/** Extract a numeric position (epoch ms or week number) from a noisy string. */
function parseTime(raw: string): number | null {
  const s = raw.trim();
  if (!s) return null;
  if (/^(not\s+specified|tbd|unknown|to\s+be\s+determined)/i.test(s))
    return null;

  const week = s.match(/week\s*(\d+)/i);
  if (week) return parseInt(week[1], 10);
  const month = s.match(/month\s*(\d+)/i);
  if (month) return parseInt(month[1], 10) * 4;
  const day = s.match(/day\s*(\d+)/i);
  if (day) return parseInt(day[1], 10) / 7;
  const q = s.match(/q(\d)\s*(\d{4})/i);
  if (q) return parseInt(q[2], 10) * 4 + parseInt(q[1], 10);

  const monthDate = s.match(
    /(january|february|march|april|may|june|july|august|september|october|november|december)\s+(\d{1,2}),?\s+(\d{4})/i,
  );
  if (monthDate) {
    const t = Date.parse(`${monthDate[1]} ${monthDate[2]}, ${monthDate[3]}`);
    if (!Number.isNaN(t)) return t;
  }
  const iso = s.match(/\d{4}-\d{2}-\d{2}/);
  if (iso) {
    const t = Date.parse(iso[0]);
    if (!Number.isNaN(t)) return t;
  }

  const t = Date.parse(s);
  return Number.isNaN(t) ? null : t;
}

function formatDisplay(raw: string): string {
  const s = raw.trim();
  if (!s) return "";
  if (/^(not\s+specified|tbd|unknown|to\s+be\s+determined)/i.test(s))
    return "TBD";

  const monthDate = s.match(
    /(january|february|march|april|may|june|july|august|september|october|november|december)\s+(\d{1,2}),?\s+(\d{4})/i,
  );
  if (monthDate) {
    const short =
      monthDate[1].charAt(0).toUpperCase() + monthDate[1].slice(1, 3);
    return `${short} ${monthDate[2]}`;
  }

  const iso = s.match(/\d{4}-\d{2}-\d{2}/);
  if (iso) {
    const d = new Date(iso[0]);
    if (!Number.isNaN(d.getTime())) {
      return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    }
  }

  const week = s.match(/week\s*\d+/i);
  if (week) return week[0].replace(/^./, (c) => c.toUpperCase());
  const month = s.match(/month\s*\d+/i);
  if (month) return month[0].replace(/^./, (c) => c.toUpperCase());
  const day = s.match(/day\s*\d+/i);
  if (day) return day[0].replace(/^./, (c) => c.toUpperCase());

  return s.length > 20 ? s.slice(0, 18).trimEnd() + "…" : s;
}

import { CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

/**
 * Right-side floating stat cards for the landing hero.
 * Frosted-translucent panels layered over the dark blue background so the
 * cards read as elevated surface without punching stark white against navy.
 */
export function HeroStatCards() {
  return (
    <div className="grid grid-cols-2 gap-3">
      <StatCard tag="Analysis" tagTone="teal">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-white/60">
          Requirements bucket
        </p>
        <div className="mt-3 space-y-2 text-xs">
          <RagLine tone="jade" label="Mandatory" value="12" />
          <RagLine tone="gold" label="Optional" value="9" />
          <RagLine tone="jasper" label="Compliance" value="3" />
        </div>
      </StatCard>

      <StatCard tag="Retrieval" tagTone="blue">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-white/60">
          Evidence hits
        </p>
        <p className="mt-2 font-mono text-3xl font-bold text-white">
          47<span className="text-white/40"> / 62</span>
        </p>
        <Sparkline className="mt-2 h-6 w-full text-verdigris" />
        <p className="mt-1 text-[10px] text-white/60">
          76% grounded · from Armory
        </p>
      </StatCard>

      <StatCard tag="Pipeline" tagTone="blue" className="col-span-2">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-white/60">
          Engine phase gates
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          {[
            { label: "Understand", state: "done" },
            { label: "Strategize", state: "done" },
            { label: "Match", state: "active" },
            { label: "Design", state: "pending" },
            { label: "Create", state: "pending" },
          ].map((g, i) => (
            <div key={g.label} className="flex items-center gap-1.5">
              <span
                className={cn(
                  "rounded-md px-2 py-1 text-[10px] font-semibold",
                  g.state === "active" && "bg-verdigris text-white",
                  g.state === "done" &&
                    "border border-verdigris/40 bg-verdigris/[0.12] text-verdigris",
                  g.state === "pending" && "bg-white/[0.06] text-white/50",
                )}
              >
                {g.label}
              </span>
              {i < 4 && <span className="text-white/25">—</span>}
            </div>
          ))}
        </div>
      </StatCard>

      <StatCard tag="Themes" tagTone="teal" className="col-span-2">
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-white/60">
            Human element leads
          </p>
          <span className="inline-flex items-center gap-1 rounded-md border border-jade/40 bg-jade/[0.12] px-1.5 py-0.5 text-[10px] font-semibold text-jade">
            <CheckCircle2 className="h-3 w-3" strokeWidth={2} />
            4 of 4 themes
          </span>
        </div>
        <div className="mt-2 flex gap-1">
          {[
            "Culture · Referral workforce",
            "Culture · Low ego, high ownership",
            "Culture · Inc 5000",
            "Culture · Embedded delivery",
          ].map((t) => (
            <div
              key={t}
              title={t}
              className="h-8 flex-1 rounded-sm bg-gradient-to-b from-verdigris/70 to-verdigris/30"
            />
          ))}
        </div>
      </StatCard>
    </div>
  );
}

function StatCard({
  tag,
  tagTone,
  children,
  className,
}: {
  tag: string;
  tagTone: "teal" | "blue";
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-sm",
        className,
      )}
    >
      <span
        className={cn(
          "inline-flex rounded-md px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.14em]",
          tagTone === "teal"
            ? "border border-verdigris/40 bg-verdigris/[0.12] text-verdigris"
            : "border border-white/20 bg-white/[0.06] text-white/85",
        )}
      >
        {tag}
      </span>
      <div className="mt-2">{children}</div>
    </div>
  );
}

function RagLine({
  tone,
  label,
  value,
}: {
  tone: "jade" | "gold" | "jasper";
  label: string;
  value: string;
}) {
  const badge = {
    jade: "border border-jade/40 bg-jade/[0.16] text-jade",
    gold: "border border-gold/50 bg-gold/[0.16] text-gold",
    jasper: "border border-jasper/40 bg-jasper/[0.16] text-jasper",
  }[tone];
  return (
    <div className="flex items-center justify-between gap-2">
      <div className="flex items-center gap-2">
        <span
          className={cn(
            "rounded-md px-1.5 py-0.5 text-[9px] font-bold uppercase",
            badge,
          )}
        >
          {tone === "jade" ? "green" : tone === "gold" ? "amber" : "red"}
        </span>
        <span className="text-white/85">{label}</span>
      </div>
      <span className="font-mono text-xs font-semibold text-white">
        {value}
      </span>
    </div>
  );
}

function Sparkline({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 24"
      preserveAspectRatio="none"
      className={className}
      fill="none"
    >
      <polyline
        points="0,20 12,17 24,18 36,14 48,15 60,10 72,11 84,7 100,5"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <polygon
        points="0,20 12,17 24,18 36,14 48,15 60,10 72,11 84,7 100,5 100,24 0,24"
        fill="currentColor"
        fillOpacity="0.15"
      />
    </svg>
  );
}

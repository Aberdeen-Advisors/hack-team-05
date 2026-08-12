import { CheckCircle2, CircleDashed, Loader2 } from "lucide-react";

/**
 * Static "screenshot-in-a-card" of the pursuit workspace, shown on the marketing
 * landing page so visitors can see what the product looks like before uploading.
 */
export function WorkspacePreview() {
  return (
    <div className="relative">
      {/* Card stack for depth */}
      <div
        aria-hidden
        className="absolute inset-0 translate-x-3 translate-y-3 rounded-xl border border-border/60 bg-background/60"
      />
      <div
        aria-hidden
        className="absolute inset-0 translate-x-1.5 translate-y-1.5 rounded-xl border border-border/70 bg-background/80"
      />

      <div className="relative overflow-hidden rounded-xl border border-border/70 bg-background shadow-[0_20px_60px_-20px_rgba(9,55,95,0.25)]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/60 px-5 py-3">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-jasper/70" />
            <span className="h-2 w-2 rounded-full bg-gold/70" />
            <span className="h-2 w-2 rounded-full bg-jade/70" />
          </div>
          <span className="font-mono text-[10px] text-onyx/50">
            /workspace/p_msqbfsfd
          </span>
        </div>

        {/* Opportunity heading */}
        <div className="border-b border-border/60 px-5 py-4">
          <p className="text-[10px] font-medium uppercase tracking-[0.24em] text-onyx/60">
            Pursuit workspace
          </p>
          <p className="mt-1 text-lg font-extralight text-aberdeen-blue">
            Bububemon ERP Modernization
          </p>
          <p className="mt-1 text-[10px] font-light text-onyx/60">
            bububemon-rfp.pdf · 42K chars ·{" "}
            <span className="rounded-full border border-border/70 px-1.5 py-0.5 text-[9px] uppercase tracking-wider">
              private
            </span>
          </p>
        </div>

        {/* Tab row */}
        <div className="flex border-b border-border/60 text-[11px]">
          {[
            { label: "Understand", n: "01", status: "done" },
            { label: "Strategize", n: "02", status: "done" },
            { label: "Match", n: "03", status: "running" },
            { label: "Design", n: "04", status: "pending" },
            { label: "Create", n: "05", status: "pending" },
          ].map((t, i) => (
            <div
              key={t.label}
              className={`flex flex-1 items-center gap-1.5 px-3 py-2.5 ${
                i === 2
                  ? "border-b border-aberdeen-blue text-aberdeen-blue"
                  : "text-onyx/70"
              }`}
            >
              <span className="font-mono text-[9px] text-onyx/40">{t.n}</span>
              <StatusIcon status={t.status} />
              <span className="font-medium">{t.label}</span>
            </div>
          ))}
        </div>

        {/* Content: a fake win theme card + citation chips */}
        <div className="flex flex-col gap-3 p-5">
          <div className="rounded-lg border-l-2 border-l-verdigris border-border/60 border p-4">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-verdigris">
              Win theme 01
            </p>
            <p className="mt-1 text-sm font-medium text-aberdeen-blue">
              Faster time-to-productivity for contractor onboarding
            </p>
            <p className="mt-2 text-xs font-light leading-relaxed text-onyx/80">
              Replace the current 14-day licensing hand-off with a data-driven
              workflow that predicts drop-out risk before it happens.
            </p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {["C1", "C3", "C7"].map((c) => (
                <span
                  key={c}
                  className="rounded-full border border-verdigris/50 bg-verdigris/10 px-2 py-0.5 font-mono text-[9px] text-aberdeen-blue"
                >
                  {c}
                </span>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <MiniStat label="Requirements" value="24" />
            <MiniStat label="Evidence hits" value="18" />
            <MiniStat label="Gaps flagged" value="3" tone="amber" />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusIcon({ status }: { status: string }) {
  if (status === "done")
    return <CheckCircle2 className="h-3 w-3 text-jade" strokeWidth={1.75} />;
  if (status === "running")
    return (
      <Loader2 className="h-3 w-3 animate-spin text-gold" strokeWidth={1.75} />
    );
  return <CircleDashed className="h-3 w-3 text-onyx/30" strokeWidth={1.5} />;
}

function MiniStat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "amber";
}) {
  return (
    <div className="rounded-md border border-border/70 bg-background px-3 py-2">
      <p className="text-[9px] font-medium uppercase tracking-widest text-onyx/50">
        {label}
      </p>
      <p
        className={`mt-0.5 text-lg font-light ${
          tone === "amber" ? "text-gold" : "text-aberdeen-blue"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

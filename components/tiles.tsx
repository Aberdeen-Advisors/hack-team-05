import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

/** Small "chip" label with tiny caps text, used across HV-style tiles.
 *  Always sized to content — safe inside flex-column parents. */
export function TagChip({
  children,
  tone = "dark",
  className,
}: {
  children: ReactNode;
  tone?: "dark" | "teal" | "muted" | "light" | "onDark";
  className?: string;
}) {
  const cls = {
    dark: "bg-aberdeen-blue text-white",
    teal: "bg-verdigris text-white",
    muted: "bg-white/15 text-white/85",
    light: "bg-white/85 text-aberdeen-blue",
    // Subtle outlined pill for use on the dark hero — replaces the harsh white bar.
    onDark: "border border-verdigris/50 bg-white/[0.06] text-verdigris",
  }[tone];
  return (
    <span
      className={cn(
        "inline-flex w-fit self-start items-center rounded-md px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em]",
        cls,
        className,
      )}
    >
      {children}
    </span>
  );
}

/** Rounded soft-transparent pill used inside tiles for tags like ERP Programs. */
export function TilePill({
  children,
  variant = "soft",
}: {
  children: ReactNode;
  variant?: "soft" | "outline";
}) {
  const cls =
    variant === "outline"
      ? "border border-white/30 text-white"
      : "bg-white/12 text-white";
  return (
    <span
      className={cn(
        "rounded-full px-3 py-1 text-xs font-medium",
        cls,
      )}
    >
      {children}
    </span>
  );
}

/** Icon in a rounded square, top-right or top-left of a tile. */
export function TileIconBox({
  children,
  tone = "white",
}: {
  children: ReactNode;
  tone?: "white" | "dark";
}) {
  return (
    <span
      className={cn(
        "flex h-8 w-8 items-center justify-center rounded-md",
        tone === "white" ? "bg-white/15 text-white" : "bg-aberdeen-blue text-white",
      )}
    >
      {children}
    </span>
  );
}

const TONE_BG: Record<TileTone, string> = {
  navy: "bg-gradient-to-br from-aberdeen-blue via-aberdeen-blue to-[#0b3f6e] text-white",
  blue: "bg-gradient-to-br from-[#0a5e94] via-[#0f6da6] to-[#1683b8] text-white",
  teal: "bg-gradient-to-br from-verdigris via-[#3aa8a3] to-[#3fbfa5] text-white",
  jade: "bg-gradient-to-br from-[#20a68a] via-[#0b8f75] to-[#0a6e5e] text-white",
};

export type TileTone = "navy" | "blue" | "teal" | "jade";

/**
 * HorizonView-style feature tile — used across landing + workspace.
 * Structure: number top-left · icon top-right · title · body · visual slot · footer.
 */
export function Tile({
  number,
  icon,
  title,
  description,
  tone = "navy",
  children,
  footerLabel,
  footerContent,
  className,
}: {
  number?: string;
  icon?: ReactNode;
  title: string;
  description?: string;
  tone?: TileTone;
  children?: ReactNode;
  footerLabel?: string;
  footerContent?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-5 rounded-3xl p-7 shadow-[0_18px_44px_-24px_rgba(9,55,95,0.45)]",
        TONE_BG[tone],
        className,
      )}
    >
      <div className="flex items-start justify-between">
        {number ? (
          <span className="font-mono text-2xl font-semibold text-white/60">
            {number}
          </span>
        ) : (
          <span />
        )}
        {icon && <TileIconBox>{icon}</TileIconBox>}
      </div>
      <div className="flex flex-col gap-3">
        <h3 className="text-2xl font-bold leading-tight text-white sm:text-[26px]">
          {title}
        </h3>
        {description && (
          <p className="text-sm leading-relaxed text-white/80">{description}</p>
        )}
      </div>
      {children && <div>{children}</div>}
      {(footerLabel || footerContent) && (
        <div className="mt-auto flex flex-col gap-2 border-t border-white/15 pt-4">
          {footerLabel && (
            <span className="text-[10px] font-semibold uppercase tracking-[0.24em] text-white/50">
              {footerLabel}
            </span>
          )}
          {footerContent}
        </div>
      )}
    </div>
  );
}

/** Data-viz sub-tile that sits inside a big Tile. */
export function TileMiniPanel({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl bg-white/12 p-4 backdrop-blur-sm",
        className,
      )}
    >
      {children}
    </div>
  );
}

/** RAG-style row: colored badge + label + right-aligned value. */
export function RagRow({
  status,
  label,
  value,
}: {
  status: "green" | "amber" | "red";
  label: string;
  value?: string;
}) {
  const badge = {
    green: "bg-jade text-white",
    amber: "bg-gold text-aberdeen-blue",
    red: "bg-jasper text-white",
  }[status];
  const text = status.toUpperCase();
  return (
    <div className="flex items-center justify-between gap-3 py-1.5 text-sm text-white">
      <div className="flex items-center gap-3">
        <span className={cn("rounded-md px-2 py-0.5 text-[10px] font-bold", badge)}>
          {text}
        </span>
        <span className="text-white/85">{label}</span>
      </div>
      {value && <span className="font-bold text-white">{value}</span>}
    </div>
  );
}

/** Simple horizontal bar-chart bar sequence for embedded viz. */
export function MiniBars({
  data,
  className,
}: {
  data: number[];
  className?: string;
}) {
  const max = Math.max(1, ...data);
  return (
    <div className={cn("flex items-end gap-1.5", className)}>
      {data.map((v, i) => (
        <div
          key={i}
          className="flex-1 rounded-t-sm bg-white/70"
          style={{ height: `${(v / max) * 100}%`, minHeight: 4 }}
        />
      ))}
    </div>
  );
}

/** Horizontal phase gates like Disc — Build — Test. */
export function PhaseGates({
  gates,
  activeIndex,
}: {
  gates: string[];
  activeIndex: number;
}) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {gates.map((g, i) => (
        <div key={g} className="flex items-center gap-1.5">
          <span
            className={cn(
              "rounded-md px-2 py-1 text-[11px] font-semibold",
              i === activeIndex
                ? "bg-verdigris text-white"
                : i < activeIndex
                  ? "bg-white/85 text-aberdeen-blue"
                  : "bg-white/15 text-white/70",
            )}
          >
            {g}
          </span>
          {i < gates.length - 1 && (
            <span className="text-white/40">—</span>
          )}
        </div>
      ))}
    </div>
  );
}

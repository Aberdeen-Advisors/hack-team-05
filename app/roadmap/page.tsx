import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  BookOpenCheck,
  Building2,
  CheckCircle2,
  CircleDashed,
  ClipboardCheck,
  Clock3,
  Database,
  FileCheck2,
  Flag,
  HeartPulse,
  Layers,
  Link2,
  PenLine,
  RefreshCw,
  Rocket,
  ShieldCheck,
  Users,
  Zap,
} from "lucide-react";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "Roadmap · Pursuit",
  description:
    "Where the Pursuit Accelerator stands today, what lands next, and how each step answers the judges - laid out for leadership.",
};

/* ────────────────────────────────────────────────────────────────────────────
 * Data. Everything below renders from these three arrays, so updating the
 * roadmap is a content edit, not a layout edit.
 * ──────────────────────────────────────────────────────────────────────────── */

type PhaseKey = "now" | "next" | "later";

type Phase = {
  key: PhaseKey;
  label: string;
  title: string;
  /** One plain sentence: what this phase means for Aberdeen. */
  meaning: string;
  Icon: IconType;
};

type IconType = React.ComponentType<{
  className?: string;
  strokeWidth?: number;
}>;

type Capability = {
  phase: PhaseKey;
  Icon: IconType;
  title: string;
  /** One sentence, no jargon: the outcome a partner or pursuit lead gets. */
  outcome: string;
  /** The judge note or benchmark finding this answers, if any. */
  answers?: string;
};

type JudgeAsk = {
  ask: string;
  status: "done" | "next" | "later";
  how: string;
};

const PHASES: Phase[] = [
  {
    key: "now",
    label: "Now",
    title: "Shipped in the final round",
    meaning:
      "A pursuit lead can drop in a client request today and leave with an edited, on-brand Word draft and deck in under an hour.",
    Icon: CheckCircle2,
  },
  {
    key: "next",
    label: "Next",
    title: "Pilot with a live pursuit team",
    meaning:
      "Point the tool at Aberdeen's curated evidence, add a reviewer's quality gate, and let a whole team work one pursuit together.",
    Icon: CircleDashed,
  },
  {
    key: "later",
    label: "Later",
    title: "An Aberdeen Labs asset",
    meaning:
      "Run it inside Aberdeen's own tenant, measure its effect on the pipeline, and keep the evidence base healthy over time.",
    Icon: Rocket,
  },
];

const CAPABILITIES: Capability[] = [
  // ── Now (ordered by impact for the reader, most impactful first) ─────────
  {
    phase: "now",
    Icon: PenLine,
    title: "Edit before export",
    outcome:
      "Every section is editable on screen and saves as you go. The Word and deck exports use what you approved, not the raw draft.",
    answers: "Judge: edit and refine responses in the tool before exporting",
  },
  {
    phase: "now",
    Icon: BookOpenCheck,
    title: "Aberdeen's playbook in every step",
    outcome:
      "Win themes, credentials, and solution shape follow the Client Response Playbook, so drafts read like Aberdeen wrote them, not a generic vendor.",
    answers: "Judge: win themes felt generic across RFPs",
  },
  {
    phase: "now",
    Icon: Link2,
    title: "Sources you can open",
    outcome:
      "Each tab lists the Aberdeen documents it drew on with a link to the file, so a reviewer can check the precedent behind any claim.",
    answers: "Judge: link directly to the underlying decks",
  },
  {
    phase: "now",
    Icon: ClipboardCheck,
    title: "Eight kinds of request, not just RFPs",
    outcome:
      "RFP, RFI, RFQ, questionnaire, SOW, change order, capability request, or discussion document: the tool recognises which one arrived and shapes the response to fit.",
  },
  {
    phase: "now",
    Icon: Flag,
    title: "Flags, never guesses",
    outcome:
      "Where only a person can supply a fact, such as rates or named staff, the draft shows a flag with an owner instead of inventing an answer.",
  },
  {
    phase: "now",
    Icon: Zap,
    title: "Faster and about half the cost",
    outcome:
      "Shared context and leaner hand-offs between steps roughly halve the cost of a full run and keep it inside the hosting time limit.",
    answers: "Judge: some generated components took a long time",
  },
  {
    phase: "now",
    Icon: FileCheck2,
    title: "Exports built on the proposal spine",
    outcome:
      "The Word document follows Aberdeen's twelve-section proposal structure, read from the method itself, so a change to the method changes the document.",
  },
  {
    phase: "now",
    Icon: RefreshCw,
    title: "Runs that survive the browser",
    outcome:
      "Close the tab, refresh, or share the link mid-run and the work picks up where it left off. A second viewer never restarts it.",
  },
  {
    phase: "now",
    Icon: Layers,
    title: "One tool, two teams' best work",
    outcome:
      "Team 5's live workspace and exports now run Team 3's pursuit method, so the experience and the discipline ship together.",
  },
  // ── Next ─────────────────────────────────────────────────────────────────
  {
    phase: "next",
    Icon: Database,
    title: "Curated evidence in production",
    outcome:
      "Retrieval already reads whatever library it is pointed at. The live index still holds the original general Armory, and switching it to Team 3's curated pursuit corpus is the next operational step.",
    answers: "Benchmark: the ceiling of every output is the corpus, not the model",
  },
  {
    phase: "next",
    Icon: ShieldCheck,
    title: "A reviewer's quality gate",
    outcome:
      "A sixth step reads the draft like a proposal reviewer: coverage against every requirement, voice slips, and unsupported claims, ending in a ready or not-ready verdict with a fix list.",
    answers: "Benchmark: coverage and specificity are where drafts lose points",
  },
  {
    phase: "next",
    Icon: Users,
    title: "Built for the whole pursuit team",
    outcome:
      "A library of pursuits, an open-items checklist with owners built from the flags, a reviewer hand-off, and the ability to re-run one step after an edit upstream.",
    answers: "Judge: pursuits are a team sport",
  },
  // ── Later ────────────────────────────────────────────────────────────────
  {
    phase: "later",
    Icon: Building2,
    title: "Inside Aberdeen's tenant",
    outcome:
      "Move from public hosting into Aberdeen's Azure tenant behind single sign-on, reading SharePoint under each user's own permissions.",
    answers: "Judge: SharePoint integration, permission and security controls",
  },
  {
    phase: "later",
    Icon: BarChart3,
    title: "Pipeline numbers, not hours saved",
    outcome:
      "Each pursuit scored against Aberdeen's target client mix, with time from receipt to submission, so leadership sees capacity and speed to close.",
  },
  {
    phase: "later",
    Icon: HeartPulse,
    title: "A healthy evidence base",
    outcome:
      "A curation view showing verified versus unverified credentials, stale entries, and sign-off owners, so the library improves with every pursuit.",
    answers: "Judge: who curates the corpus, at what cadence, governed how",
  },
];

/** Every substantive judge ask across both teams' scorecards, and where it stands. */
const JUDGE_ASKS: JudgeAsk[] = [
  {
    ask: "Win themes felt generic across RFPs",
    status: "done",
    how: "Playbook rules now shape every theme around the client's own words.",
  },
  {
    ask: "Link directly to the underlying decks",
    status: "done",
    how: "Sources strip on every tab, linked to the file.",
  },
  {
    ask: "Edit and refine before exporting to Word or PowerPoint",
    status: "done",
    how: "Inline editing on every tab; exports use the edited copy.",
  },
  {
    ask: "Some components took a long time",
    status: "done",
    how: "Leaner hand-offs and shared context; runs resume instead of restarting.",
  },
  {
    ask: "Pursuits are a team sport",
    status: "next",
    how: "Shared library, owner checklist, reviewer hand-off.",
  },
  {
    ask: "Who curates the corpus, and how is it governed",
    status: "next",
    how: "Curated corpus goes live next; the curation view follows.",
  },
  {
    ask: "SharePoint integration, permission and security controls",
    status: "later",
    how: "Tenant deployment behind single sign-on.",
  },
];

/* ────────────────────────────────────────────────────────────────────────────
 * Page
 * ──────────────────────────────────────────────────────────────────────────── */

export default function RoadmapPage() {
  const counts = {
    now: CAPABILITIES.filter((c) => c.phase === "now").length,
    next: CAPABILITIES.filter((c) => c.phase === "next").length,
    later: CAPABILITIES.filter((c) => c.phase === "later").length,
  };
  const asksDone = JUDGE_ASKS.filter((a) => a.status === "done").length;

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      {/* ─── HERO ─────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-aberdeen-blue">
        <div className="mx-auto w-full max-w-6xl px-6 py-14 sm:py-16">
          <span className="inline-flex items-center gap-1.5 rounded-md bg-white/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-white">
            <Rocket className="h-3 w-3" strokeWidth={1.75} />
            Roadmap
          </span>
          <h1 className="mt-4 max-w-3xl text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Where the Pursuit Accelerator stands, and where it goes next
          </h1>
          <p className="mt-4 max-w-2xl text-sm font-light leading-relaxed text-white/75 sm:text-base">
            Two hackathon teams built the same idea from different ends: one
            the experience, one the method. The combined build ships both.
            Below is what a pursuit lead can use today, what a pilot team gets
            next, and what turns it into a lasting Aberdeen Labs asset.
          </p>

          {/* Stat tiles */}
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatTile value={counts.now} label="capabilities live today" tone="jade" />
            <StatTile value={counts.next} label="landing in the pilot" tone="gold" />
            <StatTile value={counts.later} label="on the Labs path" tone="verdigris" />
            <StatTile
              value={`${asksDone}/${JUDGE_ASKS.length}`}
              label="judge asks already answered"
              tone="white"
            />
          </div>
        </div>
      </section>

      <main className="mx-auto w-full max-w-6xl flex-1 px-6 pb-20">
        {/* ─── JOURNEY TRACK ─────────────────────────────────────────── */}
        <section className="mt-12">
          <SectionLabel>The journey in three moves</SectionLabel>
          <ol className="relative mt-6 grid gap-6 md:grid-cols-3">
            {/* connector line, desktop only */}
            <div
              aria-hidden
              className="absolute left-0 right-0 top-7 hidden h-px bg-gradient-to-r from-jade via-gold to-verdigris md:block"
            />
            {PHASES.map((phase, i) => (
              <PhaseStep key={phase.key} phase={phase} index={i} />
            ))}
          </ol>
        </section>

        {/* ─── CAPABILITIES BY PHASE ─────────────────────────────────── */}
        {PHASES.map((phase) => {
          const items = CAPABILITIES.filter((c) => c.phase === phase.key);
          return (
            <section key={phase.key} className="mt-14" id={phase.key}>
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="flex items-center gap-2 text-lg font-semibold text-aberdeen-blue">
                  <PhaseDot phase={phase.key} />
                  <span className="text-onyx/50">{phase.label} ·</span>{" "}
                  {phase.title}
                </h2>
                <span className="text-xs font-light text-onyx/60">
                  {items.length} {items.length === 1 ? "capability" : "capabilities"}
                </span>
              </div>
              <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((c) => (
                  <CapabilityCard key={c.title} item={c} />
                ))}
              </div>
            </section>
          );
        })}

        {/* ─── JUDGE ASKS ────────────────────────────────────────────── */}
        <section className="mt-16">
          <SectionLabel>What the judges asked for, and where each stands</SectionLabel>
          <p className="mt-2 max-w-2xl text-sm font-light leading-relaxed text-onyx/70">
            Every ask from both teams&apos; scorecards. The roadmap is the gap
            list, prioritized.
          </p>
          <div className="mt-5 overflow-hidden rounded-xl border border-border/60">
            <ul className="divide-y divide-border/60">
              {JUDGE_ASKS.map((a) => (
                <li
                  key={a.ask}
                  className="grid gap-2 bg-background px-4 py-3 sm:grid-cols-[minmax(0,1.2fr)_auto_minmax(0,1.4fr)] sm:items-center sm:gap-4 sm:px-5"
                >
                  <p className="text-sm font-medium text-aberdeen-blue">
                    &ldquo;{a.ask}&rdquo;
                  </p>
                  <StatusChip status={a.status} />
                  <p className="text-sm font-light leading-relaxed text-onyx/75">
                    {a.how}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ─── CTA ───────────────────────────────────────────────────── */}
        <section className="mt-16 rounded-2xl border border-border/60 bg-aberdeen-blue/[0.03] p-6 sm:flex sm:items-center sm:justify-between sm:p-8">
          <div>
            <h2 className="text-lg font-semibold text-aberdeen-blue">
              See it on a real request
            </h2>
            <p className="mt-1 max-w-xl text-sm font-light leading-relaxed text-onyx/70">
              Drop in an RFP, RFI, or SOW and watch the five steps run. Nothing
              here is a mock-up.
            </p>
          </div>
          <Link
            href="/#launch"
            className="mt-4 inline-flex items-center gap-2 rounded-md bg-aberdeen-blue px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-aberdeen-blue/90 sm:mt-0"
          >
            Start a pursuit
            <ArrowRight className="h-4 w-4" strokeWidth={2} />
          </Link>
        </section>
      </main>

      <footer className="border-t border-border/60 bg-background">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-2 px-6 py-8 text-xs font-light text-onyx/60">
          <span>
            Built for the Aberdeen hackathon by hack-team-03 &amp; hack-team-05
            · the combined final-round build
          </span>
          <span className="font-mono">v0.4</span>
        </div>
      </footer>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
 * Pieces
 * ──────────────────────────────────────────────────────────────────────────── */

const TONE = {
  now: {
    ring: "border-jade/40",
    disk: "bg-jade text-white",
    chip: "bg-jade/10 text-jade",
    bar: "bg-jade",
    label: "Shipped",
  },
  next: {
    ring: "border-gold/60",
    disk: "bg-gold text-aberdeen-blue",
    chip: "bg-gold/20 text-onyx",
    bar: "bg-gold",
    label: "Next",
  },
  later: {
    ring: "border-verdigris/50",
    disk: "bg-verdigris text-white",
    chip: "bg-verdigris/15 text-verdigris",
    bar: "bg-verdigris",
    label: "Later",
  },
} as const;

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-verdigris">
      {children}
    </h2>
  );
}

function StatTile({
  value,
  label,
  tone,
}: {
  value: number | string;
  label: string;
  tone: "jade" | "gold" | "verdigris" | "white";
}) {
  const color =
    tone === "jade"
      ? "text-jade"
      : tone === "gold"
        ? "text-gold"
        : tone === "verdigris"
          ? "text-verdigris"
          : "text-white";
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.06] p-4 backdrop-blur-sm">
      <p className={`text-3xl font-bold tracking-tight ${color}`}>{value}</p>
      <p className="mt-1 text-xs font-light leading-snug text-white/70">
        {label}
      </p>
    </div>
  );
}

function PhaseDot({ phase }: { phase: PhaseKey }) {
  return (
    <span
      className={`inline-block h-2.5 w-2.5 rounded-full ${TONE[phase].bar}`}
      aria-hidden
    />
  );
}

function PhaseStep({ phase, index }: { phase: Phase; index: number }) {
  const t = TONE[phase.key];
  return (
    <li className="relative flex flex-col">
      <a href={`#${phase.key}`} className="group flex flex-col">
        <div className="flex items-center gap-3">
          <div
            className={`relative z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-full ${t.disk} shadow-[0_12px_24px_-12px_rgba(0,0,0,0.35)] ring-4 ring-background`}
          >
            <phase.Icon className="h-6 w-6" strokeWidth={1.75} />
          </div>
          <div className="flex flex-col">
            <span className="font-mono text-[11px] font-semibold uppercase tracking-widest text-onyx/50">
              {String(index + 1).padStart(2, "0")} · {phase.label}
            </span>
            <span className="text-base font-semibold text-aberdeen-blue group-hover:underline">
              {phase.title}
            </span>
          </div>
        </div>
        <p className="mt-3 text-sm font-light leading-relaxed text-onyx/75">
          {phase.meaning}
        </p>
      </a>
    </li>
  );
}

function CapabilityCard({ item }: { item: Capability }) {
  const t = TONE[item.phase];
  return (
    <article
      className={`flex flex-col rounded-xl border ${t.ring} bg-background p-5 transition-shadow hover:shadow-[0_16px_30px_-20px_rgba(9,55,95,0.45)]`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-aberdeen-blue/[0.06] text-aberdeen-blue">
          <item.Icon className="h-5 w-5" strokeWidth={1.75} />
        </div>
        <span
          className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${t.chip}`}
        >
          {t.label}
        </span>
      </div>
      <h3 className="mt-3 text-sm font-semibold leading-snug text-aberdeen-blue">
        {item.title}
      </h3>
      <p className="mt-1.5 flex-1 text-sm font-light leading-relaxed text-onyx/80">
        {item.outcome}
      </p>
      {item.answers && (
        <p className="mt-3 border-t border-border/60 pt-2 text-xs italic leading-snug text-verdigris">
          ↳ {item.answers}
        </p>
      )}
    </article>
  );
}

function StatusChip({ status }: { status: JudgeAsk["status"] }) {
  const map = {
    done: { cls: "bg-jade/10 text-jade", Icon: CheckCircle2, label: "Done" },
    next: { cls: "bg-gold/20 text-onyx", Icon: CircleDashed, label: "Next" },
    later: { cls: "bg-verdigris/15 text-verdigris", Icon: Clock3, label: "Later" },
  } as const;
  const m = map[status];
  return (
    <span
      className={`inline-flex w-fit items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${m.cls}`}
    >
      <m.Icon className="h-3 w-3" strokeWidth={2} />
      {m.label}
    </span>
  );
}

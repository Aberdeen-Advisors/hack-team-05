import {
  ArrowRight,
  Compass,
  Trophy,
  Sparkles,
  LayoutGrid,
  PenLine,
  FileText,
  Database,
  Cpu,
  Download,
  ShieldCheck,
  Bookmark,
  UserMinus2,
} from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { PursuitLauncher } from "@/components/pursuit-launcher";
import {
  MiniBars,
  PhaseGates,
  RagRow,
  TagChip,
  Tile,
  TileMiniPanel,
  TilePill,
} from "@/components/tiles";

const GUARDRAILS = [
  {
    title: "No invention",
    body: 'If the Armory doesn\'t support a claim, the copilot says "Not evidenced" instead of fabricating.',
    Icon: ShieldCheck,
  },
  {
    title: "Real citations",
    body: "Every claim opens the source Armory doc via a citation chip.",
    Icon: Bookmark,
  },
  {
    title: "Anonymized clients",
    body: 'Real names become descriptors — "a $1B healthcare firm" — in every output and export.',
    Icon: UserMinus2,
  },
];

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />

      {/* ─── HERO ─────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-aberdeen-blue">
        <div
          aria-hidden
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(68,176,177,0.30),transparent_55%),radial-gradient(ellipse_at_bottom_left,rgba(68,176,177,0.10),transparent_60%)]"
        />
        <div className="relative mx-auto grid w-full max-w-7xl grid-cols-1 gap-16 px-6 pt-24 pb-24 lg:grid-cols-[1.1fr_1fr] lg:items-start">
          <div className="flex flex-col gap-8 lg:pt-8">
            <TagChip tone="onDark">Pursuit Copilot · Aberdeen Advisors</TagChip>
            <h1 className="text-5xl font-bold leading-[1.02] tracking-tight text-white sm:text-[64px]">
              The control tower for a single RFP.
              <br />
              <span className="text-verdigris">
                The cockpit for the pursuit portfolio.
              </span>
            </h1>
            <p className="max-w-xl text-lg font-light leading-relaxed text-white/80">
              Drop a 30–80 page RFP. Pursuit Copilot leads with{" "}
              <span className="font-semibold text-white">
                Aberdeen&apos;s human element
              </span>
              , retrieves the strongest evidence from the Armory, and drafts
              win themes, an evidence map, a proposal starter, and an on-brand
              executive deck — grounded, cited, anonymized.
            </p>
            <div className="flex flex-wrap items-center gap-6">
              <a
                href="#launch"
                className="group inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-aberdeen-blue transition-colors hover:bg-verdigris hover:text-white"
              >
                Start a pursuit
                <ArrowRight
                  className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                  strokeWidth={2}
                />
              </a>
              <a
                href="#engines"
                className="border-b border-white/50 pb-0.5 text-sm font-semibold text-white transition-colors hover:border-verdigris hover:text-verdigris"
              >
                See what it does
              </a>
            </div>
          </div>

          {/* Sequential how-it-works vertical flow (on dark) */}
          <div className="relative flex flex-col gap-3">
            <div
              aria-hidden
              className="absolute bottom-14 left-9 top-14 w-px border-l-2 border-dashed border-verdigris/40 sm:left-10"
            />
            <HeroHowStep
              n="01"
              Icon={FileText}
              title="Ingest"
              body="Drop the RFP. Text extraction, section index, jurisdiction detection."
            />
            <HeroHowStep
              n="02"
              Icon={Database}
              title="Retrieve"
              body="Each engine composes its own query against the Armory. Top-k chunks with citation metadata."
            />
            <HeroHowStep
              n="03"
              Icon={Cpu}
              title="Synthesize"
              body="Five engines run in a dependency graph, streaming into the workspace tabs."
            />
            <HeroHowStep
              n="04"
              Icon={Download}
              title="Export"
              body="On-brand DOCX proposal starter and PPTX executive deck built from the workspace."
              last
            />
          </div>
        </div>
      </section>

      {/* ─── LAUNCHER BAND ───────────────────────────────────────────── */}
      <section
        id="launch"
        className="relative border-t border-border/60 bg-background"
      >
        <div className="mx-auto w-full max-w-4xl px-6 py-20">
          <div className="mb-8 flex flex-col items-center gap-2 text-center">
            <TagChip tone="dark">Start here</TagChip>
            <h2 className="text-3xl font-bold tracking-tight text-aberdeen-blue">
              Give the copilot the RFP.
            </h2>
          </div>
          <PursuitLauncher />
        </div>
      </section>

      {/* ─── ENGINES ─────────────────────────────────────────────────── */}
      <section
        id="engines"
        className="relative overflow-hidden border-t border-border/60 bg-muted/40"
      >
        <div className="relative mx-auto w-full max-w-7xl px-6 py-24">
          <div className="mb-12 flex flex-col gap-3">
            <TagChip tone="teal">Five engines</TagChip>
            <h2 className="max-w-3xl text-4xl font-bold tracking-tight text-aberdeen-blue">
              One analysis. Five grounded outputs.
            </h2>
            <p className="max-w-2xl text-sm font-light leading-relaxed text-onyx/80">
              Each engine composes its own retrieval query against the Armory
              and streams into the workspace. Every claim about Aberdeen is
              grounded, anonymized, and cited.
            </p>
          </div>

          <div className="grid gap-5 lg:grid-cols-3">
            <Tile
              number="01"
              icon={<Compass className="h-4 w-4" strokeWidth={2} />}
              tone="navy"
              title="Understand"
              description="What does this client actually need? Extract objectives, evaluation criteria, and every requirement — with a Response Action to guide the pursuit team."
              footerLabel="Serves"
              footerContent={
                <div className="flex flex-wrap gap-1.5">
                  <TilePill>Opportunity Brief</TilePill>
                  <TilePill>Compliance Matrix</TilePill>
                </div>
              }
            >
              <TileMiniPanel>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-white/60">
                  Requirements bucket
                </p>
                <div className="mt-2">
                  <RagRow status="green" label="Mandatory" value="12" />
                  <RagRow status="amber" label="Optional" value="9" />
                  <RagRow status="red" label="Compliance" value="3" />
                </div>
              </TileMiniPanel>
            </Tile>

            <Tile
              number="02"
              icon={<Trophy className="h-4 w-4" strokeWidth={2} />}
              tone="blue"
              title="Strategize"
              description="How do we win? Lead with the human element, then technical. Win themes and differentiators, all grounded in Culture Charter and services."
              footerLabel="Serves"
              footerContent={
                <div className="flex flex-wrap gap-1.5">
                  <TilePill>Win Themes</TilePill>
                  <TilePill>Point of View</TilePill>
                </div>
              }
            >
              <TileMiniPanel>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-white/60">
                  Human · Technical split
                </p>
                <div className="mt-3 space-y-2">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="w-16 text-white/70">Theme 01</span>
                    <div className="flex flex-1 gap-0.5">
                      <div className="h-2 flex-[3] rounded-l bg-verdigris" />
                      <div className="h-2 flex-[2] rounded-r bg-white/40" />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="w-16 text-white/70">Theme 02</span>
                    <div className="flex flex-1 gap-0.5">
                      <div className="h-2 flex-[4] rounded-l bg-verdigris" />
                      <div className="h-2 flex-[2] rounded-r bg-white/40" />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="w-16 text-white/70">Theme 03</span>
                    <div className="flex flex-1 gap-0.5">
                      <div className="h-2 flex-[3] rounded-l bg-verdigris" />
                      <div className="h-2 flex-[2] rounded-r bg-white/40" />
                    </div>
                  </div>
                </div>
              </TileMiniPanel>
            </Tile>

            <Tile
              number="03"
              icon={<Sparkles className="h-4 w-4" strokeWidth={2} />}
              tone="teal"
              title="Match"
              description="What proves our claims? Ranked evidence from the Armory tied to specific requirement phrases — with gaps called out honestly."
              footerLabel="Serves"
              footerContent={
                <div className="flex flex-wrap gap-1.5">
                  <TilePill>Evidence Map</TilePill>
                  <TilePill>Gap Analysis</TilePill>
                </div>
              }
            >
              <TileMiniPanel>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-white/70">
                  Evidence coverage
                </p>
                <p className="mt-1 font-mono text-3xl font-bold text-white">
                  47<span className="text-white/50"> / 62</span>
                </p>
                <p className="text-[10px] text-white/70">
                  76% grounded · 3 gaps flagged
                </p>
              </TileMiniPanel>
            </Tile>

            <Tile
              number="04"
              icon={<LayoutGrid className="h-4 w-4" strokeWidth={2} />}
              tone="blue"
              title="Design"
              description="What should we propose? Solution blueprint with workstreams, staffing, and a delivery timeline sized to the RFP."
              footerLabel="Serves"
              footerContent={
                <div className="flex flex-wrap gap-1.5">
                  <TilePill>Solution Blueprint</TilePill>
                  <TilePill>Staffing Model</TilePill>
                </div>
              }
            >
              <TileMiniPanel>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-white/60">
                  Delivery phases
                </p>
                <div className="mt-2">
                  <PhaseGates
                    gates={["Disc", "Build", "Test", "Deploy", "Hyper"]}
                    activeIndex={2}
                  />
                </div>
              </TileMiniPanel>
            </Tile>

            <Tile
              number="05"
              icon={<PenLine className="h-4 w-4" strokeWidth={2} />}
              tone="jade"
              title="Create"
              description="How do we communicate it? Proposal draft, executive deck, and a Why-Aberdeen passage that leads with culture."
              footerLabel="Serves"
              footerContent={
                <div className="flex flex-wrap gap-1.5">
                  <TilePill>Proposal DOCX</TilePill>
                  <TilePill>Executive PPT</TilePill>
                </div>
              }
            >
              <TileMiniPanel>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-white/70">
                  Deck slides
                </p>
                <MiniBars
                  data={[3, 5, 4, 6, 5, 7, 4]}
                  className="mt-3 h-10 w-full"
                />
                <p className="mt-2 text-[10px] text-white/70">
                  Human element opens · Why Aberdeen closes
                </p>
              </TileMiniPanel>
            </Tile>

            {/* 6th tile: Guardrails */}
            <Tile
              tone="navy"
              title="Grounded. Anonymized. Cited."
              description="Three guardrails on every claim the copilot makes about Aberdeen or the client."
            >
              <div className="flex flex-col gap-3">
                {GUARDRAILS.map(({ Icon, title, body }) => (
                  <div
                    key={title}
                    className="flex gap-3 rounded-xl bg-white/[0.08] p-3"
                  >
                    <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md bg-verdigris/20 text-verdigris">
                      <Icon className="h-4 w-4" strokeWidth={2} />
                    </span>
                    <div className="flex flex-col gap-0.5">
                      <p className="text-sm font-semibold text-white">
                        {title}
                      </p>
                      <p
                        className="text-[11px] font-light leading-snug text-white/70"
                        dangerouslySetInnerHTML={{ __html: body }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Tile>
          </div>
        </div>
      </section>

      {/* ─── CLOSER ───────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-t border-border/60 bg-aberdeen-blue">
        <div
          aria-hidden
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(68,176,177,0.30),transparent_60%)]"
        />
        <div className="relative mx-auto flex w-full max-w-5xl flex-col items-center gap-6 px-6 py-24 text-center">
          <h2 className="text-5xl font-bold tracking-tight text-white sm:text-6xl">
            Low ego. High ownership.
            <br />
            <span className="text-verdigris">
              Let&apos;s build the response.
            </span>
          </h2>
          <a
            href="#launch"
            className="group mt-2 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-aberdeen-blue transition-colors hover:bg-verdigris hover:text-white"
          >
            Start a pursuit
            <ArrowRight
              className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
              strokeWidth={2}
            />
          </a>
        </div>
      </section>

      <footer className="border-t border-border/60 bg-background">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-8 text-xs font-light text-onyx/60">
          <span>
            Built for the Aberdeen hackathon by hack-team-05 · Carrie · Jordan ·
            CJ · Preetish
          </span>
          <span className="font-mono">v0.3</span>
        </div>
      </footer>
    </div>
  );
}

/**
 * Compact vertical "how it works" step, styled for the dark blue hero.
 * Translucent-white card + white icon disk with dark blue glyph.
 */
function HeroHowStep({
  n,
  Icon,
  title,
  body,
  last,
}: {
  n: string;
  Icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  title: string;
  body: string;
  last?: boolean;
}) {
  return (
    <div className="relative flex items-start gap-5">
      {/* Icon disk */}
      <div className="relative z-10 flex flex-col items-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white text-aberdeen-blue shadow-[0_16px_30px_-14px_rgba(0,0,0,0.35)]">
          <Icon className="h-8 w-8" strokeWidth={1.5} />
        </div>
        {!last && (
          <div className="mt-2 h-1.5 w-1.5 rounded-full bg-verdigris shadow-[0_0_0_5px_rgba(68,176,177,0.18)]" />
        )}
      </div>

      {/* Content card */}
      <div className="flex-1 pt-2">
        <div className="rounded-xl border border-white/10 bg-white/[0.05] p-4 backdrop-blur-sm">
          <div className="flex items-baseline gap-2.5">
            <span className="font-mono text-sm font-semibold text-verdigris">
              {n}
            </span>
            <h3 className="text-lg font-bold text-white">{title}</h3>
          </div>
          <p className="mt-1.5 text-xs font-light leading-relaxed text-white/75">
            {body}
          </p>
        </div>
      </div>
    </div>
  );
}

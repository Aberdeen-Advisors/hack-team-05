import type { Metadata } from "next";
import { CheckCircle2, CircleDashed, Rocket } from "lucide-react";

export const metadata: Metadata = {
  title: "Roadmap · Pursuit",
  description:
    "What shipped in the combined build, and what lands next on the path from hackathon final to Aberdeen Labs asset.",
};

type Item = {
  title: string;
  detail: string;
  answers?: string;
};

const SHIPPED: Item[] = [
  {
    title: "One platform, two heritages",
    detail:
      "Team 5's live workspace, streaming engines, and one-click Word / deck exports, now running Team 3's pursuit method: the Client Response Playbook encoded as the five-stage discipline behind every engine.",
  },
  {
    title: "The Aberdeen method inside every engine",
    detail:
      "Intake, win-theme, credential-selection, solution-shape, and drafting rules injected into each engine: requirements in the client's words, the could-a-competitor-write-this test on every theme, credentials ranked by closeness of analog, deliverables numbered and traced, protective framing written as how-we-work.",
    answers: "Judge feedback: win themes felt generic across RFPs",
  },
  {
    title: "Curated corpus over the general Armory",
    detail:
      "Retrieval points at the curated pursuit corpus Team 3 assembled - playbooks, credentials, services, prior proposals - synced from SharePoint or a local folder, so evidence quality is an input decision, not luck.",
  },
  {
    title: "Sources you can open",
    detail:
      "Every engine tab now shows the Armory documents it actually drew on, linked to the underlying SharePoint file, so a reviewer can validate the precedent behind every claim.",
    answers: "Judge feedback: link directly to the underlying decks",
  },
  {
    title: "Owner-routed gaps, never guesses",
    detail:
      "Where only a human can supply a fact - rates, named staffing, reference permissions - the output carries [NEEDS INPUT: what - owner] instead of an invention. A flag is a success: it is the tool refusing to fabricate.",
  },
];

const NEXT: Item[] = [
  {
    title: "Tenant deployment",
    detail:
      "Move the app from public hosting into Aberdeen's Azure tenant behind Entra ID single sign-on, with retrieval reading SharePoint directly under the user's own permissions. Same app, production-grade home.",
    answers: "Judge feedback: SharePoint integration, permission and security controls",
  },
  {
    title: "Shared pursuit workspaces",
    detail:
      "Persistent pursuits with shareable links, an assignable open-items checklist (item, owner, status), and a reviewer handoff state, because a pursuit is a team sport.",
    answers: "Judge feedback: built for a collaborative response team",
  },
  {
    title: "Edit before export",
    detail:
      "Refine sections in the workspace before generating the Word document or deck. Until then, the exported .docx is the editing surface - consultants edit in Word, and every line is read by a human before a client sees it.",
  },
  {
    title: "Pursuit KPIs on the dashboard",
    detail:
      "Every pursuit scored ICP-aligned or opportunistic against Aberdeen's target mix, with cycle-time from RFP receipt to submission - so the tool reports revenue capacity and time-to-close, not just hours saved.",
  },
  {
    title: "Corpus health",
    detail:
      "A curation panel showing confirmed versus unverified credentials, stale entries, and sign-off owners - because the ceiling of every output is the corpus, and the corpus should get better with every pursuit.",
  },
];

export default function RoadmapPage() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-16">
      <div className="flex flex-col gap-3">
        <span className="inline-flex w-fit items-center gap-1.5 rounded-md bg-aberdeen-blue px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-white">
          <Rocket className="h-3 w-3" strokeWidth={1.75} />
          Roadmap
        </span>
        <h1 className="text-3xl font-bold tracking-tight text-aberdeen-blue sm:text-4xl">
          From hackathon final to Labs asset
        </h1>
        <p className="max-w-2xl text-sm font-light leading-relaxed text-onyx/70">
          The combined build merges two hackathon projects that independently
          converged on the same method: Team 5&apos;s Pursuit Concierge (the
          experience) and Team 3&apos;s Pursuit Accelerator (the discipline).
          Here is what shipped in this round, and what lands next.
        </p>
      </div>

      <section className="mt-12">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-aberdeen-blue">
          <CheckCircle2 className="h-5 w-5 text-jade" strokeWidth={1.75} />
          Shipped in the final round
        </h2>
        <ul className="mt-4 flex flex-col gap-4">
          {SHIPPED.map((item) => (
            <RoadmapCard key={item.title} item={item} shipped />
          ))}
        </ul>
      </section>

      <section className="mt-12">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-aberdeen-blue">
          <CircleDashed className="h-5 w-5 text-gold" strokeWidth={1.75} />
          Landing next
        </h2>
        <ul className="mt-4 flex flex-col gap-4">
          {NEXT.map((item) => (
            <RoadmapCard key={item.title} item={item} />
          ))}
        </ul>
      </section>

      <p className="mt-12 border-t border-border/60 pt-6 text-xs font-light text-onyx/50">
        Sequenced from the judges&apos; feedback on both original submissions.
        Every item traces to a judge note or a benchmark finding - the roadmap
        is the gap list, prioritized.
      </p>
    </main>
  );
}

function RoadmapCard({ item, shipped }: { item: Item; shipped?: boolean }) {
  return (
    <li className="rounded-lg border border-border/60 bg-background p-5">
      <div className="flex items-start justify-between gap-4">
        <h3 className="text-sm font-semibold text-aberdeen-blue">
          {item.title}
        </h3>
        <span
          className={
            shipped
              ? "shrink-0 rounded-full bg-jade/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-jade"
              : "shrink-0 rounded-full bg-gold/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-onyx/70"
          }
        >
          {shipped ? "Shipped" : "Next"}
        </span>
      </div>
      <p className="mt-2 text-sm font-light leading-relaxed text-onyx/80">
        {item.detail}
      </p>
      {item.answers && (
        <p className="mt-2 text-xs italic text-verdigris">↳ {item.answers}</p>
      )}
    </li>
  );
}

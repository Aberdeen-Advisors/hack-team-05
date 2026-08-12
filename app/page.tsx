import { SiteHeader } from "@/components/site-header";
import { PursuitLauncher } from "@/components/pursuit-launcher";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-12 px-6 py-14">
        <section className="flex flex-col gap-4">
          <p className="text-sm font-medium uppercase tracking-widest text-verdigris">
            Pursuit Copilot
          </p>
          <h1 className="text-4xl font-extralight tracking-tight text-aberdeen-blue sm:text-5xl">
            From a 30–80 page RFP to a pursuit brief, in one analysis.
          </h1>
          <p className="max-w-2xl text-lg text-onyx">
            Upload the RFP. The copilot understands what the client actually
            needs, retrieves the strongest evidence from Aberdeen&apos;s Armory,
            and drafts win themes, an evidence map, a 7-day pursuit timeline,
            and the first proposal sections — all grounded, no fabrication.
          </p>
        </section>

        <PursuitLauncher />

        <section className="grid gap-4 sm:grid-cols-5">
          {[
            {
              label: "Understand",
              q: "What does this client actually need?",
              out: "Opportunity Brief",
            },
            {
              label: "Strategize",
              q: "How do we win?",
              out: "Win Themes + Differentiators",
            },
            {
              label: "Match",
              q: "What proves our claims?",
              out: "Evidence Map",
            },
            {
              label: "Design",
              q: "What should we propose?",
              out: "Solution Blueprint + 7-day plan",
            },
            {
              label: "Create",
              q: "How do we communicate it?",
              out: "Proposal draft + deck",
            },
          ].map((e) => (
            <div
              key={e.label}
              className="rounded-lg border border-border bg-card p-4"
            >
              <p className="text-xs font-medium uppercase tracking-wider text-verdigris">
                {e.label}
              </p>
              <p className="mt-1 text-sm font-medium text-aberdeen-blue">
                {e.q}
              </p>
              <p className="mt-2 text-xs text-onyx">{e.out}</p>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}

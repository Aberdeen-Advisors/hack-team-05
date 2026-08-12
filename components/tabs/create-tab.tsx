import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { EngineState } from "@/components/workspace";
import type { ProposalDraft } from "@/lib/engines/schemas";
import {
  ErrorCard,
  PendingCard,
  SectionHeading,
  StreamingHint,
  tabView,
} from "./shared";

export function CreateTab({ state }: { state: EngineState<ProposalDraft> }) {
  const view = tabView(state);
  if (view.kind === "pending") return <PendingCard label="Proposal Draft" />;
  if (view.kind === "error") return <ErrorCard error={view.error} />;
  const { data, isStreaming } = view;
  if (!data) return <StreamingHint label="proposal draft" />;

  return (
    <div className="flex flex-col gap-6">
      {isStreaming && <StreamingHint label="proposal draft" />}
      <Card className="p-6">
        <SectionHeading>Proposal outline</SectionHeading>
        <div className="mt-3 flex flex-col gap-3">
          {(data.proposalOutline ?? []).map((s, i) => (
            <div key={i} className="rounded-md border border-border p-4">
              <p className="text-sm font-medium text-aberdeen-blue">
                {i + 1}. {s?.section}
              </p>
              <p className="mt-1 text-xs italic text-onyx/70">{s?.purpose}</p>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-onyx">
                {(s?.keyPoints ?? []).map((p, j) => (
                  <li key={j}>{p}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-6">
        <SectionHeading>Executive Summary — draft</SectionHeading>
        <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-onyx">
          {data.draftSections?.executiveSummary}
        </p>
      </Card>

      <Card className="p-6">
        <SectionHeading>Our Understanding — draft</SectionHeading>
        <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-onyx">
          {data.draftSections?.ourUnderstanding}
        </p>
      </Card>

      <Card className="p-6">
        <SectionHeading>Proposed Approach — draft</SectionHeading>
        <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-onyx">
          {data.draftSections?.proposedApproach}
        </p>
      </Card>

      <Card className="border-l-4 border-l-verdigris p-6">
        <SectionHeading>Why Aberdeen</SectionHeading>
        <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-onyx">
          {data.whyAberdeen}
        </p>
      </Card>

      <Card className="p-6">
        <SectionHeading>Executive deck spec</SectionHeading>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          {(data.deckSpec ?? []).map((s, i) => (
            <div key={i} className="rounded-md border border-border p-4">
              <div className="flex items-baseline justify-between">
                <p className="text-sm font-medium text-aberdeen-blue">
                  Slide {i + 1}: {s?.slideTitle}
                </p>
                <Badge variant="outline" className="text-xs">
                  {s?.layout}
                </Badge>
              </div>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-onyx">
                {(s?.bullets ?? []).map((b, j) => (
                  <li key={j}>{b}</li>
                ))}
              </ul>
              {s?.speakerNotes && (
                <p className="mt-2 text-xs italic text-onyx/70">
                  Notes: {s.speakerNotes}
                </p>
              )}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Editable, EditableList, EditableParagraph } from "@/components/editable";
import { useEditing } from "@/lib/editing/context";
import type { EngineState } from "@/components/workspace";
import type { ProposalDraft } from "@/lib/engines/schemas";
import {
  ErrorCard,
  PendingCard,
  SectionHeading,
  StreamingHint,
  tabView,
} from "./shared";

type OutlineItem = NonNullable<ProposalDraft["proposalOutline"]>[number];
type Slide = NonNullable<ProposalDraft["deckSpec"]>[number];
type DraftSections = NonNullable<ProposalDraft["draftSections"]>;

export function CreateTab({
  state,
  effectiveResult,
}: {
  state: EngineState<ProposalDraft>;
  effectiveResult?: ProposalDraft;
}) {
  const view = tabView(state, effectiveResult);
  const { updateEngine } = useEditing();

  if (view.kind === "pending") return <PendingCard label="Proposal Draft" />;
  if (view.kind === "error") return <ErrorCard error={view.error} />;
  const { data, isStreaming } = view;
  if (!data) return <StreamingHint label="proposal draft" />;

  const update = <K extends keyof ProposalDraft>(
    key: K,
    value: ProposalDraft[K],
  ) => {
    updateEngine<ProposalDraft & Record<string, unknown>>("create", (prev) => ({
      ...((prev ?? data) as ProposalDraft),
      [key]: value,
    }));
  };

  const updateOutline = (i: number, patch: Partial<OutlineItem>) => {
    const outline = [...(data.proposalOutline ?? [])];
    if (outline[i]) {
      outline[i] = { ...outline[i], ...patch } as OutlineItem;
      update("proposalOutline", outline);
    }
  };

  const updateDraftSection = (
    key: keyof DraftSections,
    value: string,
  ) => {
    const current = (data.draftSections ?? {}) as DraftSections;
    update("draftSections", { ...current, [key]: value } as DraftSections);
  };

  const updateSlide = (i: number, patch: Partial<Slide>) => {
    const slides = [...(data.deckSpec ?? [])];
    if (slides[i]) {
      slides[i] = { ...slides[i], ...patch } as Slide;
      update("deckSpec", slides);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {isStreaming && <StreamingHint label="proposal draft" />}
      {/* proposalOutline is optional on new runs — the DOCX export walks the
          proposal spine directly, so we only render this card when a legacy
          cached pursuit still carries the outline. */}
      {(data.proposalOutline?.length ?? 0) > 0 && (
        <Card className="p-6">
          <SectionHeading>Proposal outline</SectionHeading>
          <div className="mt-3 flex flex-col gap-3">
            {(data.proposalOutline ?? []).map((s, i) => (
              <div key={i} className="rounded-md border border-border p-4">
                <p className="text-sm font-medium text-aberdeen-blue">
                  {i + 1}.{" "}
                  <Editable
                    value={s?.section}
                    onChange={(v) => updateOutline(i, { section: v })}
                    placeholder="Section name"
                  />
                </p>
                <div className="mt-1 text-xs italic text-onyx/70">
                  <Editable
                    value={s?.purpose}
                    onChange={(v) => updateOutline(i, { purpose: v })}
                    placeholder="Section purpose"
                  />
                </div>
                <div className="mt-2 pl-5 text-sm text-onyx">
                  <EditableList
                    items={s?.keyPoints}
                    onChange={(v) => updateOutline(i, { keyPoints: v })}
                    itemPlaceholder="Add a key point"
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card className="p-6">
        <SectionHeading>Executive Summary — draft</SectionHeading>
        <div className="mt-2 text-sm leading-relaxed text-onyx">
          <EditableParagraph
            value={data.draftSections?.executiveSummary}
            onChange={(v) => updateDraftSection("executiveSummary", v)}
            placeholder="~250 words. Lead with human element."
            minRows={5}
          />
        </div>
      </Card>

      <Card className="p-6">
        <SectionHeading>Our Understanding — draft</SectionHeading>
        <div className="mt-2 text-sm leading-relaxed text-onyx">
          <EditableParagraph
            value={data.draftSections?.ourUnderstanding}
            onChange={(v) => updateDraftSection("ourUnderstanding", v)}
            placeholder="~300 words showing we understand the problem"
            minRows={5}
          />
        </div>
      </Card>

      <Card className="p-6">
        <SectionHeading>Proposed Approach — draft</SectionHeading>
        <div className="mt-2 text-sm leading-relaxed text-onyx">
          <EditableParagraph
            value={data.draftSections?.proposedApproach}
            onChange={(v) => updateDraftSection("proposedApproach", v)}
            placeholder="~350 words on the approach"
            minRows={5}
          />
        </div>
      </Card>

      <Card className="border-l-4 border-l-verdigris p-6">
        <SectionHeading>Why Aberdeen</SectionHeading>
        <div className="mt-2 text-sm leading-relaxed text-onyx">
          <EditableParagraph
            value={data.whyAberdeen}
            onChange={(v) => update("whyAberdeen", v)}
            placeholder="~200 words distilling differentiators and culture"
            minRows={4}
          />
        </div>
      </Card>

      {/* deckSpec is optional on new runs — the PPT export builds slides
          directly from the other engines' results. Only render this card
          when a legacy cached pursuit still carries a slide spec. */}
      {(data.deckSpec?.length ?? 0) > 0 && (
      <Card className="p-6">
        <SectionHeading>Executive deck spec</SectionHeading>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          {(data.deckSpec ?? []).map((s, i) => (
            <div key={i} className="rounded-md border border-border p-4">
              <div className="flex items-baseline justify-between">
                <p className="text-sm font-medium text-aberdeen-blue">
                  Slide {i + 1}:{" "}
                  <Editable
                    value={s?.slideTitle}
                    onChange={(v) => updateSlide(i, { slideTitle: v })}
                    placeholder="Slide title"
                  />
                </p>
                <Badge variant="outline" className="text-xs">
                  {s?.layout}
                </Badge>
              </div>
              <div className="mt-2 pl-5 text-sm text-onyx">
                <EditableList
                  items={s?.bullets}
                  onChange={(v) => updateSlide(i, { bullets: v })}
                  itemPlaceholder="Add a bullet"
                />
              </div>
              <div className="mt-2 text-xs italic text-onyx/70">
                <span className="not-italic font-semibold">Notes: </span>
                <Editable
                  value={s?.speakerNotes}
                  onChange={(v) => updateSlide(i, { speakerNotes: v })}
                  placeholder="Speaker notes"
                />
              </div>
            </div>
          ))}
        </div>
      </Card>
      )}
    </div>
  );
}

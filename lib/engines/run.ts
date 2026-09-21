import { streamObject } from "ai";
import { gateway } from "@ai-sdk/gateway";
import type { z } from "zod";
import type { ParsedRfp } from "@/lib/rfp/parse";
import { truncateForContext } from "@/lib/rfp/parse";
import { retrieve, formatContext } from "@/lib/armory/retrieve";
import type { RetrieveHit } from "@/lib/armory/types";
import { ABERDEEN_SYSTEM_PROMPT, armoryBlock } from "@/lib/prompts/system";
import {
  METHOD_UNDERSTAND,
  METHOD_STRATEGIZE,
  METHOD_MATCH,
  METHOD_DESIGN,
  METHOD_CREATE,
} from "@/lib/prompts/method";
import type { DocType } from "@/lib/armory/types";
import {
  opportunityBriefSchema,
  winStrategySchema,
  evidenceMapSchema,
  solutionBlueprintSchema,
  proposalDraftSchema,
  type OpportunityBrief,
  type WinStrategy,
  type EvidenceMap,
  type SolutionBlueprint,
  type ProposalDraft,
} from "./schemas";

const ENGINE_MODEL = "anthropic/claude-sonnet-4-6";
const ORCHESTRATOR_MODEL = "anthropic/claude-opus-4-7";

export type EngineName =
  | "understand"
  | "strategize"
  | "match"
  | "design"
  | "create";

export type EngineContext = {
  rfp: ParsedRfp;
  opportunityName?: string;
  clientName?: string;
  /** Prior engine results, if this engine wants to build on them. */
  prior?: Partial<{
    understand: OpportunityBrief;
    strategize: WinStrategy;
    match: EvidenceMap;
    design: SolutionBlueprint;
    create: ProposalDraft;
  }>;
};

function runEngine<T>(args: {
  schema: z.ZodType<T>;
  system: string;
  prompt: string;
  model?: string;
}) {
  return streamObject({
    model: gateway.languageModel(args.model ?? ENGINE_MODEL),
    schema: args.schema,
    system: args.system,
    prompt: args.prompt,
    temperature: 0.4,
  });
}

/**
 * The Armory documents an engine actually retrieved, deduped — surfaced to the
 * UI as a per-tab "Sources" strip so a reader can open the underlying deck or
 * proposal and validate the evidence (SharePoint webUrl, or file:// for a
 * local-dir sync).
 */
export type EngineSource = {
  docName: string;
  webUrl: string;
  docType: string;
};

export type EngineLaunch<T> = {
  stream: ReturnType<typeof runEngine<T>>;
  sources: EngineSource[];
};

function sourcesFromHits(hits: RetrieveHit[]): EngineSource[] {
  const seen = new Map<string, EngineSource>();
  for (const h of hits) {
    const key = h.chunk.webUrl || h.chunk.docName;
    if (!seen.has(key)) {
      seen.set(key, {
        docName: h.chunk.docName,
        webUrl: h.chunk.webUrl,
        docType: h.chunk.docType,
      });
    }
  }
  return [...seen.values()];
}

function rfpBlock(rfp: ParsedRfp, opportunityName?: string, clientName?: string) {
  return [
    `OPPORTUNITY: ${opportunityName ?? "(unnamed)"}`,
    `CLIENT (raw — anonymize in outputs): ${clientName ?? "(not provided)"}`,
    `RFP FILE: ${rfp.fileName}`,
    `JURISDICTION GUESS: ${rfp.jurisdiction}`,
    "",
    "RFP TEXT (may be truncated):",
    truncateForContext(rfp, 70_000),
  ].join("\n");
}

// ---------------------------------------------------------------------------
// Engine A — Understand
// ---------------------------------------------------------------------------
export async function runUnderstand(ctx: EngineContext) {
  const query = [
    "RFP objectives, requirements, and compliance format",
    ctx.rfp.sections.requirements.slice(0, 1500),
    ctx.rfp.sections.termsAndConditions.slice(0, 1000),
  ]
    .filter(Boolean)
    .join("\n");
  const hits = await retrieve(query, {
    k: 4,
    docType: ["boilerplate", "services"] satisfies DocType[],
  });
  const { contextText } = formatContext(hits);

  const prompt = [
    rfpBlock(ctx.rfp, ctx.opportunityName, ctx.clientName),
    "",
    METHOD_UNDERSTAND,
    "",
    armoryBlock(contextText),
    "",
    "TASK: Produce the OpportunityBrief, applying the INTAKE DISCIPLINE above. Focus on: what does this client actually need, what must the response comply with, and what questions should the pursuit team send back during the Q&A window. Requirements in the client's own words and order; constraints and format/admin rules captured as mandatory rows; dates checked against today. Use the boilerplate chunks (office locations, standard answers) only if they map to specific requirements.",
  ].join("\n");

  return {
    stream: runEngine({
      schema: opportunityBriefSchema,
      system: ABERDEEN_SYSTEM_PROMPT,
      prompt,
    }),
    sources: sourcesFromHits(hits),
  };
}

// ---------------------------------------------------------------------------
// Engine B — Strategize
// ---------------------------------------------------------------------------
export async function runStrategize(
  ctx: EngineContext & { understand?: OpportunityBrief },
) {
  const query = [
    "Aberdeen culture, human element, referral workforce, differentiators",
    ctx.understand?.painPoints?.join("; ") ?? "",
    ctx.understand?.evaluationCriteria?.join("; ") ?? "",
    ctx.rfp.sections.evaluationCriteria.slice(0, 1500),
  ]
    .filter(Boolean)
    .join("\n");
  const hits = await retrieve(query, {
    k: 8,
    docType: ["culture", "services", "credentials", "case-study"] satisfies DocType[],
  });
  const { contextText } = formatContext(hits);

  const brief = ctx.understand
    ? `PRIOR OPPORTUNITY BRIEF (JSON):\n${JSON.stringify(ctx.understand, null, 2)}\n\n`
    : "";

  const prompt = [
    rfpBlock(ctx.rfp, ctx.opportunityName, ctx.clientName),
    "",
    brief,
    METHOD_STRATEGIZE,
    "",
    armoryBlock(contextText),
    "",
    "TASK: Produce the WinStrategy, applying the WIN-THEME DISCIPLINE above. 3-4 win themes, each anchored to the client's own words with a technical angle AND a human angle, each passing the could-a-competitor-write-this test. Weight toward the heaviest evaluation criteria from the brief. Differentiators must be grounded in Armory evidence - if you can't cite, say 'Not evidenced in Armory' rather than fabricating. Name the honest weakness and how the response handles it.",
  ].join("\n");

  return {
    stream: runEngine({
      schema: winStrategySchema,
      system: ABERDEEN_SYSTEM_PROMPT,
      prompt,
    }),
    sources: sourcesFromHits(hits),
  };
}

// ---------------------------------------------------------------------------
// Engine C — Match
// ---------------------------------------------------------------------------
export async function runMatch(
  ctx: EngineContext & { understand?: OpportunityBrief },
) {
  const query = [
    "Aberdeen case studies and prior engagements matching",
    ctx.understand?.objectives?.join("; ") ?? "",
    ctx.understand?.scope ?? "",
    ctx.rfp.sections.requirements.slice(0, 1500),
  ]
    .filter(Boolean)
    .join("\n");
  const hits = await retrieve(query, {
    k: 10,
    docType: ["case-study", "proposal", "credentials"] satisfies DocType[],
  });
  const { contextText } = formatContext(hits);

  const brief = ctx.understand
    ? `PRIOR OPPORTUNITY BRIEF (JSON):\n${JSON.stringify(ctx.understand, null, 2)}\n\n`
    : "";

  const prompt = [
    rfpBlock(ctx.rfp, ctx.opportunityName, ctx.clientName),
    "",
    brief,
    METHOD_MATCH,
    "",
    armoryBlock(contextText),
    "",
    "TASK: Produce the EvidenceMap, applying the CREDENTIAL-SELECTION DISCIPLINE above. Rank the top 1-4 Aberdeen engagements from the ARMORY CONTEXT by closeness of analog (same industry + same problem first); prefer engagements with measurable outcomes. For each match, tie the engagement to specific requirement ids (R1, R2, ...) from the prior brief. Anonymize past client names to descriptors. If some RFP requirements have no matching evidence, list them under 'gaps' honestly - never stretch an adjacent credential.",
  ].join("\n");

  return {
    stream: runEngine({
      schema: evidenceMapSchema,
      system: ABERDEEN_SYSTEM_PROMPT,
      prompt,
    }),
    sources: sourcesFromHits(hits),
  };
}

// ---------------------------------------------------------------------------
// Engine D — Design
// ---------------------------------------------------------------------------
export async function runDesign(
  ctx: EngineContext & {
    understand?: OpportunityBrief;
    strategize?: WinStrategy;
    match?: EvidenceMap;
  },
) {
  const query = [
    "Aberdeen delivery approach, workstreams, staffing, methodology",
    ctx.understand?.scope ?? "",
    ctx.strategize?.winThemes?.map((t) => t.title).join("; ") ?? "",
  ]
    .filter(Boolean)
    .join("\n");
  const hits = await retrieve(query, {
    k: 6,
    docType: ["services", "proposal", "credentials"] satisfies DocType[],
  });
  const { contextText } = formatContext(hits);

  const prior = [
    ctx.understand
      ? `PRIOR OPPORTUNITY BRIEF:\n${JSON.stringify(ctx.understand, null, 2)}`
      : "",
    ctx.strategize
      ? `PRIOR WIN STRATEGY:\n${JSON.stringify(ctx.strategize, null, 2)}`
      : "",
    ctx.match ? `PRIOR EVIDENCE MAP:\n${JSON.stringify(ctx.match, null, 2)}` : "",
  ]
    .filter(Boolean)
    .join("\n\n");

  const prompt = [
    rfpBlock(ctx.rfp, ctx.opportunityName, ctx.clientName),
    "",
    prior,
    "",
    METHOD_DESIGN,
    "",
    armoryBlock(contextText),
    "",
    "TASK: Produce the SolutionBlueprint, applying the SOLUTION-SHAPE DISCIPLINE above. Organize workstreams around the CLIENT'S scope areas and numbering; number deliverables D1, D2, ... and reuse those numbers in the timeline; show the client's own time commitment alongside Aberdeen's; state the seniority reasoning behind the staffing mix. Include a 7-day pursuit plan mapped across the engines (Understand → Strategize → Match → Design → Draft → Challenge → Refine → Submit), with reviewers assigned per day. Size the deliveryTimeline to whatever engagement length the RFP requests.",
  ].join("\n");

  return {
    stream: runEngine({
      schema: solutionBlueprintSchema,
      system: ABERDEEN_SYSTEM_PROMPT,
      prompt,
    }),
    sources: sourcesFromHits(hits),
  };
}

// ---------------------------------------------------------------------------
// Engine E — Create
// ---------------------------------------------------------------------------
export async function runCreate(
  ctx: EngineContext & {
    understand?: OpportunityBrief;
    strategize?: WinStrategy;
    match?: EvidenceMap;
    design?: SolutionBlueprint;
  },
) {
  const query = [
    "Aberdeen executive summary tone, positioning, culture, differentiators",
    ctx.strategize?.pointOfView ?? "",
    ctx.strategize?.winThemes?.map((t) => t.humanAngle).join("; ") ?? "",
  ]
    .filter(Boolean)
    .join("\n");
  const hits = await retrieve(query, {
    k: 6,
    docType: ["culture", "credentials", "proposal"] satisfies DocType[],
  });
  const { contextText } = formatContext(hits);

  const prior = [
    ctx.understand
      ? `OPPORTUNITY BRIEF:\n${JSON.stringify(ctx.understand, null, 2)}`
      : "",
    ctx.strategize
      ? `WIN STRATEGY:\n${JSON.stringify(ctx.strategize, null, 2)}`
      : "",
    ctx.match ? `EVIDENCE MAP:\n${JSON.stringify(ctx.match, null, 2)}` : "",
    ctx.design ? `SOLUTION BLUEPRINT:\n${JSON.stringify(ctx.design, null, 2)}` : "",
  ]
    .filter(Boolean)
    .join("\n\n");

  const prompt = [
    rfpBlock(ctx.rfp, ctx.opportunityName, ctx.clientName),
    "",
    prior,
    "",
    METHOD_CREATE,
    "",
    armoryBlock(contextText),
    "",
    "TASK: Produce the ProposalDraft, applying the DRAFTING DISCIPLINE above. Write an outline that follows the CLIENT'S required sections in the CLIENT'S order (fold Aberdeen's structure into theirs), first-draft prose for Executive Summary / Our Understanding / Proposed Approach, a 'Why Aberdeen' passage that includes a short evaluation-criteria crosswalk where the RFP states weighted criteria, and a 6-10 slide executive deck spec. The Executive Summary opens with 'Our understanding is that...' and leads with the human element. Weave protective framing (assumptions, out-of-scope, change control, acceptance) into the approach as how-we-work language. Match the client's brand voice - playful brand, witty summary; federal / state, formal throughout.",
  ].join("\n");

  return {
    stream: runEngine({
      schema: proposalDraftSchema,
      system: ABERDEEN_SYSTEM_PROMPT,
      prompt,
      model: ORCHESTRATOR_MODEL,
    }),
    sources: sourcesFromHits(hits),
  };
}

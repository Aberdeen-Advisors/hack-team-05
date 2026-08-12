import { streamObject } from "ai";
import { gateway } from "@ai-sdk/gateway";
import type { z } from "zod";
import type { ParsedRfp } from "@/lib/rfp/parse";
import { truncateForContext } from "@/lib/rfp/parse";
import { retrieve, formatContext } from "@/lib/armory/retrieve";
import { ABERDEEN_SYSTEM_PROMPT, armoryBlock } from "@/lib/prompts/system";
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
    armoryBlock(contextText),
    "",
    "TASK: Produce the OpportunityBrief. Focus on: what does this client actually need, what must the response comply with, and what questions should the pursuit team send back during the Q&A window. Use the boilerplate chunks (office locations, standard answers) only if they map to specific requirements.",
  ].join("\n");

  return runEngine({
    schema: opportunityBriefSchema,
    system: ABERDEEN_SYSTEM_PROMPT,
    prompt,
  });
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
    armoryBlock(contextText),
    "",
    "TASK: Produce the WinStrategy. 3–4 win themes, each with a technical angle AND a human angle. Differentiators must be grounded in Armory evidence — if you can't cite, say 'Not evidenced in Armory' rather than fabricating.",
  ].join("\n");

  return runEngine({
    schema: winStrategySchema,
    system: ABERDEEN_SYSTEM_PROMPT,
    prompt,
  });
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
    armoryBlock(contextText),
    "",
    "TASK: Produce the EvidenceMap. Rank the top 1–4 Aberdeen engagements from the ARMORY CONTEXT that best support this RFP. For each match, tie the engagement to specific requirement ids (R1, R2, …) from the prior brief. Anonymize past client names to descriptors. If some RFP requirements have no matching evidence, list them under 'gaps'.",
  ].join("\n");

  return runEngine({
    schema: evidenceMapSchema,
    system: ABERDEEN_SYSTEM_PROMPT,
    prompt,
  });
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
    armoryBlock(contextText),
    "",
    "TASK: Produce the SolutionBlueprint. Include a 7-day pursuit plan mapped across the engines (Understand → Strategize → Match → Design → Draft → Challenge → Refine → Submit), with reviewers assigned per day. Size the deliveryTimeline to whatever engagement length the RFP requests.",
  ].join("\n");

  return runEngine({
    schema: solutionBlueprintSchema,
    system: ABERDEEN_SYSTEM_PROMPT,
    prompt,
  });
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
    armoryBlock(contextText),
    "",
    "TASK: Produce the ProposalDraft. Write an outline (full sections), first-draft prose for Executive Summary / Our Understanding / Proposed Approach, a 'Why Aberdeen' passage, and a 6–10 slide executive deck spec. Lead with the human element in the Executive Summary. Match the client's brand voice — if the RFP came from a playful brand, let the Executive Summary have wit; if it's federal / state, stay formal.",
  ].join("\n");

  return runEngine({
    schema: proposalDraftSchema,
    system: ABERDEEN_SYSTEM_PROMPT,
    prompt,
    model: ORCHESTRATOR_MODEL,
  });
}

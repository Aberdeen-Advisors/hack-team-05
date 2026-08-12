import { z } from "zod";

/** Reusable evidence citation shape. C# tag references the ARMORY CONTEXT block. */
export const evidenceSchema = z.object({
  tag: z
    .string()
    .describe(
      "The [C#] tag referenced from the ARMORY CONTEXT block (e.g., 'C1', 'C3').",
    ),
  quote: z
    .string()
    .describe("A short quoted phrase (< 200 chars) from the cited chunk."),
});

// Engine A — Understand
export const opportunityBriefSchema = z.object({
  clientDescriptor: z
    .string()
    .describe(
      "Anonymized description of the client, e.g., 'a mid-market beverages brand'. No real names.",
    ),
  objectives: z
    .array(z.string())
    .describe("Top 3–6 objectives the client is trying to achieve."),
  painPoints: z
    .array(z.string())
    .describe("Top 3–6 pain points the RFP surfaces."),
  scope: z
    .string()
    .describe("One-paragraph summary of the scope of services requested."),
  requirements: z
    .array(
      z.object({
        id: z.string().describe("Short id like R1, R2, …"),
        requirement: z.string(),
        category: z
          .enum(["functional", "technical", "compliance", "commercial", "other"]),
        mandatory: z.boolean(),
      }),
    )
    .describe(
      "Requirements matrix (compliance-style). Cover the key items — don't dump everything.",
    ),
  evaluationCriteria: z
    .array(z.string())
    .describe("How proposals will be evaluated / scored."),
  timeline: z
    .array(
      z.object({
        milestone: z.string(),
        date: z.string().describe("Date or relative phrase, e.g., 'Day 14'"),
      }),
    )
    .describe("Key RFP dates: questions due, submission due, award, kickoff."),
  risksAndConstraints: z.array(z.string()),
  jurisdiction: z.enum(["federal", "state-local", "private", "unknown"]),
  complianceNotes: z
    .string()
    .describe(
      "Formatting/submission rules to respect (page limits, fonts, sections, portal upload, etc).",
    ),
  stakeholderQuestions: z
    .array(z.string())
    .describe("Questions to submit back to the client during the Q&A window."),
});
export type OpportunityBrief = z.infer<typeof opportunityBriefSchema>;

// Engine B — Strategize
export const winStrategySchema = z.object({
  pointOfView: z
    .string()
    .describe(
      "One tight paragraph articulating Aberdeen's point of view on this opportunity.",
    ),
  winThemes: z
    .array(
      z.object({
        title: z.string(),
        technicalAngle: z.string(),
        humanAngle: z
          .string()
          .describe(
            "The Aberdeen human element for this theme (culture, ownership, referral workforce, etc.).",
          ),
        evidence: z.array(evidenceSchema),
      }),
    )
    .min(3)
    .max(4),
  differentiators: z
    .array(
      z.object({
        claim: z.string(),
        why: z.string(),
        evidence: z.array(evidenceSchema),
      }),
    )
    .describe(
      "Grounded 'Why Aberdeen instead of another firm?' — every differentiator must cite Armory evidence or say 'Not evidenced in Armory'.",
    ),
  competitivePositioning: z
    .string()
    .describe(
      "Short read on what typical competitors will over-index on, and how Aberdeen differentiates.",
    ),
});
export type WinStrategy = z.infer<typeof winStrategySchema>;

// Engine C — Match
export const evidenceMapSchema = z.object({
  matches: z
    .array(
      z.object({
        rank: z.number().int().min(1),
        docName: z.string().describe("Name of the Armory doc / case study."),
        docTag: z.string().describe("The [C#] tag from ARMORY CONTEXT."),
        clientDescriptor: z
          .string()
          .describe(
            "Anonymized descriptor of the past client (industry + rough size). No real names.",
          ),
        whyRelevant: z
          .string()
          .describe(
            "Why this Aberdeen work is relevant to the RFP requirements.",
          ),
        rfpRequirementsAddressed: z
          .array(z.string())
          .describe(
            "Which RFP requirement ids (R1, R2, …) or short phrases this evidence supports.",
          ),
        outcome: z
          .string()
          .describe(
            "Measurable outcome from the cited engagement, if named in the Armory chunk.",
          ),
      }),
    )
    .min(1)
    .max(4),
  gaps: z
    .array(z.string())
    .describe(
      "Requirements where no strong Armory evidence exists — flag them so pursuit team can fill.",
    ),
});
export type EvidenceMap = z.infer<typeof evidenceMapSchema>;

// Engine D — Design
export const solutionBlueprintSchema = z.object({
  approach: z
    .string()
    .describe("2–3 paragraphs summarizing the proposed solution approach."),
  workstreams: z
    .array(
      z.object({
        name: z.string(),
        objective: z.string(),
        keyActivities: z.array(z.string()),
      }),
    )
    .min(3),
  staffingModel: z
    .array(
      z.object({
        role: z.string(),
        responsibility: z.string(),
        allocationPct: z
          .number()
          .describe("Rough allocation percentage for this engagement."),
      }),
    )
    .min(3),
  sevenDayPursuitPlan: z
    .array(
      z.object({
        day: z.number().int().min(1).max(7),
        engine: z.enum([
          "Understand",
          "Strategize",
          "Match",
          "Design",
          "Draft",
          "Challenge",
          "Refine",
          "Submit",
        ]),
        deliverables: z.array(z.string()),
        reviewer: z.string().describe("Role responsible for reviewing this day's output."),
        checkpoint: z.string(),
      }),
    )
    .length(7),
  deliveryTimeline: z
    .array(
      z.object({
        milestone: z.string(),
        weekOffset: z
          .string()
          .describe("Timing like 'Week 1', 'Week 4', 'Month 3'."),
      }),
    )
    .describe(
      "Post-award delivery milestones sized to the RFP's stated engagement length.",
    ),
});
export type SolutionBlueprint = z.infer<typeof solutionBlueprintSchema>;

// Engine E — Create
export const proposalDraftSchema = z.object({
  proposalOutline: z
    .array(
      z.object({
        section: z.string(),
        purpose: z.string(),
        keyPoints: z.array(z.string()),
      }),
    )
    .describe(
      "Full proposal outline: Executive Summary, Our Understanding, Proposed Approach, Relevant Experience, Team, Timeline, Why Aberdeen.",
    ),
  draftSections: z.object({
    executiveSummary: z.string().describe("~250 words. Lead with human element."),
    ourUnderstanding: z
      .string()
      .describe("~300 words. Show we understand the client's problem, not just capabilities."),
    proposedApproach: z
      .string()
      .describe("~350 words. Concrete, grounded in the workstreams."),
  }),
  whyAberdeen: z
    .string()
    .describe(
      "~200 words distilling the differentiators + culture into a single 'Why Aberdeen' passage. Cite [C#] tags inline for any factual claims about Aberdeen.",
    ),
  deckSpec: z
    .array(
      z.object({
        slideTitle: z.string(),
        bullets: z.array(z.string()),
        speakerNotes: z.string(),
        layout: z
          .enum(["title", "content", "twoColumn", "quote", "closer"])
          .describe("Layout hint for the pptx exporter."),
      }),
    )
    .min(6)
    .max(10)
    .describe(
      "Executive deck: Title, Understanding, Win Themes, Approach, Human Element, Why Aberdeen, Closing.",
    ),
});
export type ProposalDraft = z.infer<typeof proposalDraftSchema>;

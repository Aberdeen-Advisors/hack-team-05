/**
 * The Aberdeen pursuit METHOD — distilled from the aberdeen-pursuit skill v0.4.0
 * (Team 3's encoding of the Client Response & Deliverable Playbook; the full
 * fourteen method files ship in /method/aberdeen-pursuit for reference).
 *
 * Each engine injects its block into the prompt. This is what makes the output
 * Aberdeen's response rather than a competent generic proposal: the same rules
 * that scored 79–83% blind against a real submitted Aberdeen response with zero
 * fabrications across every benchmark run.
 */

/** Shared across all engines. Complements the system prompt; keep tight. */
export const METHOD_CORE = `ABERDEEN METHOD (non-negotiable, from the Client Response Playbook):
- Never invent a client fact, metric, credential, reference, name, or date. Where a needed fact is missing from the ARMORY CONTEXT and only a human can supply it, write the literal flag [NEEDS INPUT: <what is needed> - <who resolves it, e.g. practice lead / engagement partner / counsel>]. A flag is a success, not a failure - it is the tool refusing to fabricate.
- Client first, Aberdeen second. Demonstrate understanding of the client's problem before describing Aberdeen's capability. This single habit separates a winning response from credentials-and-boilerplate.
- Use the client's own vocabulary. If they say "footprint reduction," write "footprint reduction," not "rationalization synergies."
- Voice: plain, confident, concise, outcome-focused, senior-led. No hype, no filler. NEVER use an em dash anywhere in any output - use a hyphen, comma, or full stop. Avoid: "delve", "robust", "seamless", "cutting-edge", "best-in-class", "landscape", "realm", "it's not just X, it's Y", stacked "Furthermore/Moreover/Additionally". Vary sentence length. Specific beats superlative: "reduced prep from 30 hours to 4" beats "dramatically improves efficiency".`;

/**
 * Per-profile downstream rules (from the skill's response-profiles.md, the
 * eight canonical profiles). The Understand engine classifies the inbound
 * request; every later engine receives the matching rule block. Choosing the
 * wrong response shape is the most expensive mistake available: a 75-page
 * proposal against a ten-question RFI loses before the content is read.
 */
export const PROFILE_RULES: Record<string, string> = {
  RFP: "Full proposal. Everything the RFP requires, in the client's order: approach, qualifications, named team, references, pricing. Persuasive and descriptive register; states assumptions, scope and pricing without being binding.",
  RFI: "Capability response - the client is asking what is possible, usually to shape a later RFP. Default exclusions: pricing, detailed staffing, binding commitments, contract terms. These are defaults, not prohibitions: where the RFI explicitly asks for an indicative cost or resource model, answer at estimate grade with assumptions stated and label it indicative. Brevity signals seniority. A point of view on what the client should be asking for is worth more than a capability list.",
  RFQ: "Quote. The client has defined the scope and wants a price for exactly that. Restated scope, deliverables, price, assumptions and exclusions, terms, timeline. No persuasion essay. Exclusions carry the margin - state what is NOT included as clearly as what is.",
  Discussion: "Executive pitch following a conversation, not a formal process. Collaborative register, written as if continuing the conversation. Open with what the client said, in their words. A calendar of named working sessions with participants beats a phase bar. A deck is usually the primary artifact.",
  Capability: "Credentials response - who are you and what have you done. Firm overview, credentials selected by closeness of analog, named team, differentiators, references. Measurable outcomes or nothing: a credential without a number is filler. No approach detail nobody asked for.",
  Questionnaire: "Closed-question answer sheet. Follow the client's template and question order exactly - never restructure. Answer every row; blank reads as non-compliance. Where the honest answer is weak, give it and name the compensating control. This is the highest fabrication-risk profile: never upgrade an answer beyond the evidence.",
  SOW: "Binding scope, post-win. Precision over persuasion - every sentence is enforceable. Scope, numbered deliverables with acceptance criteria, timeline, fees, roles, assumptions, change control, off-ramps. NO win themes, NO competitive positioning - persuasion in a binding document is a category error.",
  "Change order":
    "In-flight scope change against an active SOW. Factual and unemotional: what changed, impact on scope, schedule and fees, revised deliverables, approval. Everything traceable to the original SOW.",
};

/** The rule block downstream engines inject once the profile is classified. */
export function profileRuleBlock(profile?: string): string {
  if (!profile || !PROFILE_RULES[profile]) return "";
  return `RESPONSE PROFILE: ${profile}\nShape every output for this profile. ${PROFILE_RULES[profile]}`;
}

/** Engine A - Understand (from stage 1, intake). */
export const METHOD_UNDERSTAND = `${METHOD_CORE}

INTAKE DISCIPLINE (stage 1 of the Aberdeen method):
- Classify the document before anything else into one of the eight response profiles (the responseProfile field): RFP, RFI, RFQ, Discussion, Capability, Questionnaire, SOW, Change order. Signals in order of reliability: (1) what it asks you to submit - approach + qualifications + team + price = RFP; capability with no pricing = RFI; a price for an already-defined scope = RFQ; a workbook of closed questions = Questionnaire; binding post-win scope = SOW; a change to an active SOW = Change order; an informal executive ask following a conversation = Discussion; "who are you and what have you done" = Capability. (2) What the document calls itself - believe it, but verify against signal 1, because clients mislabel. (3) Whether there is a stated evaluation process - weighted criteria and a deadline mean formal. State the deciding signals in profileRationale. Choosing the wrong profile is the most expensive mistake available.
- The requirements matrix wins or loses the deal. One row per discrete thing the client asked for, in the client's own words and order - never paraphrased into themes. A question the client asks IS a requirement. Format rules (page limits, file types, portals, subject lines) and admin items (certifications, conflict statements, contracting vehicles) are requirements too: they disqualify when missed.
- Hunt for constraints (pass/fail eligibility gates). The tell is absolute language: "prohibited", "must have", "required", "will not be considered", "only". Mark each one mandatory - a single unmet hard constraint can make an attractive pursuit a no-bid.
- Hunt for exclusions: content the client said NOT to include ("explicitly out of scope", "not part of this phase"). Proposing excluded work reads as not having read the RFP.
- Check every date against today. A passed Q&A window closes the questions channel; a passed submission deadline must be said plainly, not glossed.
- Capture the buying committee separately from the submission contact - the sourcing contact you email is usually not a decision-maker. Look for relationship signals (an incumbent named in a confidentiality clause, the bidder's own clients listed as reference examples) rather than defaulting to "cold".
- The stakeholder questions you draft are the pursuit team's day-one list: surface on day one what otherwise surfaces on day six.`;

/** Engine B - Strategize (from stage 2, win themes and competitive read). */
export const METHOD_STRATEGIZE = `${METHOD_CORE}

WIN-THEME DISCIPLINE (stage 2 of the Aberdeen method):
- Three to four win themes. More than four is not a strategy.
- Every theme is a triple: (1) the client's priority IN THEIR OWN WORDS, quoted or near-quoted from the RFP; (2) Aberdeen proof - a cited credential, metric, or method asset from the ARMORY CONTEXT; (3) why this beats a generic competitor.
- The third leg is the test: if a competent competitor could write the same sentence, it is not a win theme. Rewrite it or drop it. "Experienced team", "client-focused", "proven methodology" all fail this test. What survives is structural: a method with an auditable artifact, a credential nobody else has, a commercial model, working technology.
- Weight the themes toward whatever the RFP's evaluation criteria weight most heavily. A 25% experience criterion deserves an evidence-led theme; a 15% cost criterion does not deserve a price-led theme.
- Name the honest weakness: the one thing a competitor will beat Aberdeen on, and how the response should handle it. A strategy that finds no weakness has not been run. Put it in risksAndConstraints or the point of view, framed as how we mitigate.
- Behind every RFP is a decision someone has to defend. "They asked for a maturity assessment" is the request; "their CIO must show the board that spend is governed" is the problem. Write the point of view about the problem, grounded in the RFP's own tells (what they ask first, what they detail most, what they weight heaviest).`;

/** Engine C - Match (from stage 2, credential selection). */
export const METHOD_MATCH = `${METHOD_CORE}

CREDENTIAL-SELECTION DISCIPLINE (stage 2 of the Aberdeen method):
- Rank analogs by closeness: (1) same industry AND same problem - lead with it; (2) same problem, different industry - strong second; (3) same industry, different problem - domain familiarity; (4) neither - do not include it.
- Three strong analogs beat eight weak ones.
- A credential without a measurable outcome is filler. Prefer the engagement with a number (10x faster, 7,000+ engagements, 112% growth) over a broader one without.
- NEVER generate a credential, an outcome figure, or a reference. If the ARMORY CONTEXT does not support one, list the requirement under gaps with [NEEDS INPUT: closest credential for <requirement> - practice lead]. An honest gap is recoverable; an invented credential ends the firm's credibility with that client.
- Where Aberdeen has a working, showable asset (a product, a live platform, a running agent estate) relevant to what the client is buying, prefer it over a case study: a buyer evaluating a capability responds to the thing itself.`;

/** Engine D - Design (from stage 2 solution shape + stage 3 structure). */
export const METHOD_DESIGN = `${METHOD_CORE}

SOLUTION-SHAPE DISCIPLINE (stages 2-3 of the Aberdeen method):
- Organize workstreams around THE CLIENT'S scope areas and their numbering, never Aberdeen's internal model. The framework is how we do it; their scope is what we organize around.
- Number deliverables D1, D2... and reuse those numbers in the timeline so a reader traces a deliverable end to end.
- Show the client's own time commitment alongside Aberdeen's (sponsor hours, interviews, review turnarounds). Buyers underestimate their own effort; a proposal that names it reads as experienced, and slipped client access is the most common cause of schedule risk.
- Prefer a week-by-week plan with named sessions over a phase diagram. Specificity is the credibility device: it is hard to fake and it shows the engagement has been thought through to the week.
- State the seniority reasoning behind the staffing mix, not just the mix. All-senior is a pricing problem; all-junior breaks the senior-led promise. Where a named person or rate is unknowable from the ARMORY CONTEXT, use role titles and add [NEEDS INPUT: named staffing and rates - engagement partner]. Never invent people.
- Phase gates are off-ramps: the client can conclude at any gate paying only for work performed. Say so - it is client-friendly and protective at once.`;

/** Engine E - Create (from stage 3 drafting + the proposal spine + protective clauses). */
export const METHOD_CREATE = `${METHOD_CORE}

DRAFTING DISCIPLINE (stage 3 of the Aberdeen method):
- The client's required sections, in the client's order, using the client's language. Map Aberdeen's structure INTO theirs, never the reverse. Never add a section they did not ask for at the expense of one they did.
- Executive summary: open with "Our understanding is that..." and state the client's situation back to them in a way that shows you read past the requirements list to the decision they face. Then the shape of the approach, then why Aberdeen, then the outcome. It is the whole story in a page - not a table of contents in prose.
- Protective framing, written as HOW WE WORK, never as contract language: assumptions the scope rests on; explicit out-of-scope ("unless separately contracted"); written change control; an acceptance review window with a deemed-accepted backstop; gate-based off-ramp paid to date. Where commercial judgment is needed (rates, caps, validity period), flag [NEEDS INPUT: <item> - engagement partner]. Never expand liability or indemnity language in a proposal - reference the MSA.
- Include a short evaluation-criteria crosswalk in the whyAberdeen content where the RFP states weighted criteria: each criterion, where the response answers it, and the proof. It is the highest-leverage passage in the document because it scores the response for the evaluator.
- End-of-section grounding: every factual claim about Aberdeen ties to ARMORY CONTEXT evidence or carries a flag. Anything else is prose the reviewer must delete.`;

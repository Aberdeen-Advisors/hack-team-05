# Stage 2 - Pursuit Strategy

**Input:** stage 1 output, plus the credentials and strategy corpus
**Output:** win themes · credentials · differentiators · competitive positioning · solution shape

This is the stage that decides whether the proposal says something, or just says
everything.

---

## First: does this stage apply?

Read the profile stated at the end of stage 1 before doing anything else.

Keyed to the canonical profile keys in `references/response-profiles.md`.

| Profile | This stage |
|---|---|
| `RFP`, `RFI`, `Discussion` | **Runs in full** |
| `RFQ` | **Runs light.** Scope is already defined by the client, so skip win themes and the solution shape. Keep the credential selection and the honest competitive read. |
| `Capability` | **Runs, narrowed.** Credential selection is the whole job. Skip the solution shape. |
| `Questionnaire` | **Skipped**, unless the workbook contains a pricing tab, in which case run only enough to support pricing. There are no win themes in a controlled-vocabulary answer sheet. |
| `SOW`, `Change order` | **Skipped.** The work is won. Positioning against competitors is over, and win themes in a binding document are a category error. |

If the stage is skipped, say so and say why, then go to stage 3. Do not run it quietly and
produce win themes nobody asked for: on a SOW or a questionnaire they are not merely wasted,
they leak persuasion into a document whose register is supposed to be factual.

---

## Step 1 - Name the client's real problem

Before any Aberdeen content, write three to four sentences on what the client is
*actually* trying to achieve, distinct from what they asked for.

An RFP asks for a deliverable. Behind it is a decision someone has to defend. Name that.
"They asked for a maturity assessment" is the request. "Their CIO has to convince a board
that AI spend is governed before the next budget cycle" is the problem.

Ground this in the RFP's own language: their stated drivers, the questions they ask
first, what they ask for in most detail, and what their evaluation criteria weight most
heavily. If the evidence does not support a confident read, say so rather than inventing
a narrative.

## Step 2 - Win themes

Three to four. More than four is not a strategy.

Each win theme is a triple:

| Client priority (their words, cited) | Aberdeen proof (cited credential or method) | Why this beats a generic competitor |
|---|---|---|

**Shortcut worth taking first.** The service offering workbook carries a client-challenge
sheet with a "what to listen for" column mapping the language clients actually use to the
offerings that answer it. Run the RFP's own phrasing against it before drafting themes. It is
the fastest route from the client's words to a grounded, in-offering theme, and it keeps
themes inside what Aberdeen actually sells. See `references/methodology-assets.md`.

Rules:
- **Anchor to the client's language.** If they say "footprint reduction," the theme says
  footprint reduction, not "rationalization synergies."
- Every proof point must cite a real credential or a real method asset. A win theme with
  no proof is a slogan.
- The third column is the test. If a competitor could write the same sentence, it is not
  a win theme. Rewrite it or drop it.
- Weight toward whatever their evaluation criteria weight most heavily.

## Step 3 - Credential selection

**On technology and AI pursuits, check Tier 2b in `references/corpus-map.md` first.**
Aberdeen has shipped products and working tools, and a demonstrable asset outbids a case
study when the client is buying the same capability. A buyer evaluating AI governance
responds differently to "here is a platform whose agents cite their sources" than to a
description of a methodology. Confirm clearance before naming any non-public asset.

Then pick the three strongest analogs using the ranking in `references/corpus-map.md`. For
each:

| Client | Problem | What Aberdeen did | Measurable impact | Why it maps to this pursuit | Contactable reference? |
|---|---|---|---|---|---|

Prefer same-industry and same-problem. Three strong beats eight weak.

**Never generate a credential, an outcome number, or a reference.** If the corpus does
not support it, `[NEEDS INPUT]`. This is the most tempting place in the whole tool to
fabricate, and the most damaging place to be caught.

Flag any credential that needs client permission before being named.

## Step 4 - Differentiators

Four to five, one line each, each tied to evidence in the corpus and, where relevant, to
the Foundational Strategy.

Test each one against: **could a competent competitor claim this too?** "Experienced
team," "client-focused," "proven methodology" all fail. What survives is usually
something structural: a method with an auditable artifact, a credential nobody else has,
a commercial model, a piece of working technology.

Aberdeen's strategy-level differentiators worth drawing on where they genuinely apply:
senior-led delivery, outcome-linked commercial models, "we don't recommend what we
wouldn't implement ourselves," accountable through delivery rather than direction.

## Step 5 - Competitive read

**Start from the relationship status captured in stage 1.** Whether Aberdeen is the
incumbent, a prior vendor, a known quantity, or cold changes the strategy more than
anything else in this stage:

| Position | What the response must do |
|---|---|
| **Incumbent or current partner** | Do not coast on it. Name the accumulated context as a concrete time and risk advantage, and pre-empt the "fresh eyes" argument a challenger will make. |
| **Prior client, different scope** | Lead with the relationship as proof of delivery, then show the new scope is genuinely understood rather than assumed. |
| **Known but never engaged** | Treat as cold on substance, warm on access. |
| **Cold** | Credentials and method carry the whole weight. Weight the closest analog harder. |

Then: who else is likely bidding, what they will lead with, and where Aberdeen is stronger
and weaker. Where competitors are named or implied in the RFP, use that. Where they are
not, reason from the shape of the buy and label it clearly as inference, not fact.

**Before inferring, check whether the competitor is already in the corpus.** A set of
responses submitted by other firms is held alongside Aberdeen's own outputs. See Tier 2d in
`references/corpus-map.md`. If a likely competitor has a response there, read it and say what
you read rather than guessing: what they lead with, their approach depth, the credentials
they put forward, and where they are genuinely stronger. Label read-from-source and inferred
separately, because they carry different weight in a partner's decision. Never quote or
reproduce a competitor's submission, and never characterise their pricing to a client.

Also read the **evaluation weights** as a competitive instruction. A pursuit weighting cost
at 30% is a different contest from one weighting it at 15%, and the emphasis of the whole
response should follow. Say explicitly which criterion carries the most weight and what
that implies.

Then state the honest weakness: the one thing a competitor will beat us on, and how the
response should handle it. A strategy that finds no weakness has not been run properly.

## Step 6 - Solution shape

A one-page outline of the approach before it gets drafted:

- Workstreams, organized around **the client's scope areas**, not Aberdeen's model
- Which methodology assets apply (see `references/methodology-assets.md`)
- Deliverables, numbered D1, D2..., traceable into the timeline and workplan
- Phasing and gates
- Staffing shape: roles, seniority, commitment level
- Duration and the key dependencies that drive it

This is the skeleton stage 3 drafts against. Getting agreement here is much cheaper than
rewriting a drafted proposal.

---

## Step 7 - Feed the corpus back

Anything found by mining prior responses that is **not** already in the credentials library
is a finding. List it: firm facts, client outcomes with numbers, partnerships,
certifications, platform experience, testimonials.

This is how the corpus compounds. A credential that lives only inside one client's 60-page
response is a credential the firm cannot reuse, and the next pursuit will miss it too.
Report the list so it can be added, with the source document named.

## Close the stage

Report the win themes in one line each, the three credentials chosen and why, any new
`[NEEDS INPUT]` items added to the stage 1 list, and the corpus-feedback list from step 7.

Then stop and let the user react before running stage 3. Win themes are a partner
judgment call, and this is the right place for a human to redirect.

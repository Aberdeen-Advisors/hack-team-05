# Stage 4 - Review

**Input:** the stage 3 draft, the stage 1 compliance matrix
**Output:** quality-bar report, and a revised draft if fixes are applied

This is the trust layer. It is what makes a first draft safe for a pursuit team to reuse
rather than something they have to re-verify from scratch.

---

## How to run it

Read the profile from stage 1 first, then `references/quality-bar.md`, then run the gates
**mechanically**, not impressionistically. The failure mode of this stage is a review that
reads the draft, finds it good, and passes everything.

**Gates are conditioned on the profile.** Most apply everywhere. Gate 3 applies only to the
profiles allowed to carry commercial terms, and on the others its absence is a pass reported as
`N/A (profile)`.

**Precedence when they collide**, in order: what the client explicitly asked for, then the
profile's defaults, then the gate's default expectation. So a gate is not N/A simply because the
profile excludes its content. **Check the compliance matrix first**: if the client asked for it,
the gate applies to what they asked for and its absence is a Gate 1 failure. Never add content
the client did not ask for just to satisfy a gate, and never drop content they did ask for just
because a profile default excludes it.

State the profile, the N/A gates, and which precedence level decided each one, at the top of the
report.

Three specific disciplines:

**Gate 1 is a lookup, not a judgment.** For every compliance-matrix row, find the text in
the draft that answers it and record section and page. If you cannot point at it, the row
fails. "Broadly covered in section 3" is a fail.

**Gate 2 is an extraction.** List every factual assertion in the draft - client figures,
Aberdeen metrics, credential claims, named people, dates, standards. For each, name the
source document. Anything unsourced converts to `[NEEDS INPUT]` in the draft. Do not
reason about whether a claim is *probably* right.

**Gate 5 is a string scan.** Search for em dashes and each tell in the table in
`aberdeen-voice.md`. Report every instance with its location. Do not eyeball it.

## Report

Use the output format in `references/quality-bar.md`. Then, above it, a one-line verdict:

> **READY TO SUBMIT** / **READY AFTER FIXES** (n blocking) / **NOT READY** (n blocking, n open questions)

Be honest. If the draft is not ready, say it is not ready. The value of this stage is
entirely in its willingness to fail things.

## Fixing

Ask before applying fixes. Then:

- **Mechanical findings** - em dashes, AI tells, formatting, naming, missing protective
  clauses with model language available: fix directly.
- **Coverage gaps** - draft the missing content, from the corpus, cited.
- **Unsourced claims** - convert to `[NEEDS INPUT]` or remove. Never re-source a claim by
  reasoning about what is probably true.
- **Judgment items** - pricing, references, staffing commitments, competitive positioning:
  leave for the human and list them.

Re-run the affected gates after fixing. Report what changed.

## What this stage cannot do

Say this plainly in the report rather than implying otherwise:

- It is not a substitute for the human **red-team read** required by Gate 7. What it can
  do is the adversarial pass - read the draft as a competitor trying to beat it and as an
  evaluator trying to score it down, then name the three weakest points.
- It cannot confirm a reference is willing to be contacted.
- It cannot approve pricing or a commercial commitment.
- It cannot confirm clearance to use client material externally.

A tool that claims to have fully cleared a proposal for submission is lying about the one
thing it most needs to be trusted on.

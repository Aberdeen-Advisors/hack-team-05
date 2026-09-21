# The Proposal Spine

Source: Aberdeen Client Response & Deliverable Playbook v1.0, Section 5 ("Anatomy of a
Winning Proposal"), validated against Aberdeen's last full RFP response.

## The rule that overrides this file

**Include what the RFP requires, in the client's order where they specify one.** This
spine is the default when the client does not dictate structure, and the checklist for
what to fold in when they do. Drop or merge sections for smaller asks. Never add a
section the client did not ask for at the expense of one they did.

Scale formality to the opportunity. A two-page RFQ response and a 75-page enterprise RFP
follow the same spine at different depths.

---

## 1. Letter of transmittal

One page, signed by the relationship owner. Frames the opportunity and names our
differentiator. Human, not a product pitch.

Must contain: thanks for the opportunity, a one-sentence statement of what the client's
real opportunity is (not what they asked for - what it is *for*), the positioning line
for who Aberdeen is in this pursuit, confirmation that the response addresses every
required section, availability for presentation dates, proposal validity period,
conflict-of-interest statement, and willingness to execute their MSA / BAA / NDA.

Anti-pattern: opening with Aberdeen's history.

## Front matter: table of contents

Sits between the transmittal and the executive summary. Not numbered as a spine section,
because it is navigation rather than content, but **it is required on any document long enough
to need one.**

| | |
|---|---|
| **Include when** | The document runs beyond roughly ten pages, or the client asks for one, or the client specified a section structure a reader will want to navigate |
| **Skip when** | A short RFQ or capability response, a deck, or a questionnaire. A contents page on a four-page document reads as padding. |
| **Mirror** | The client's own section numbering and titles where they specified them, not Aberdeen's spine. A reader checking compliance uses this page to find their requirement. |
| **Depth** | Two levels. Three becomes an index. |

**Generate it as a real field, not typed text.** A hand-written contents list goes stale the
moment a section moves, and a wrong page number on the first content page undermines the
document before anyone reaches the approach. It depends on proper heading styles, which is
already a brand requirement: headings must be real heading levels, never bold body text.

Where the client requires a compliance matrix or a cross-reference table as well, that is a
separate artifact and it belongs in the appendices. The contents page navigates the document;
the compliance matrix proves coverage.

## 2. Executive summary

The whole story in a page: their problem, our approach, why us, the outcome. **Written
last, read first.**

Open with "Our understanding is that..." and state the client's situation back to them
in a way that shows you read past the requirements list to the actual decision they face.
Then the shape of the approach. Then why Aberdeen specifically. Then the outcome.

Anti-pattern: a summary of the proposal's table of contents.

## 3. Firm qualifications & experience

Relevant, recent, and specific. Industry, references, credentials. **Proof over
adjectives.**

Select credentials by closeness of analog: same industry first, then same problem, then
same scale. Three strong analogs beat eight weak ones. For each: client, the problem,
what Aberdeen did, measurable impact.

Anti-pattern: the full client logo wall.

## 4. Approach & methodology

Aberdeen's frameworks mapped to *this client's* scope and evaluation criteria. Use
figures. See `methodology-assets.md` for what is available to draw on.

Structure by the client's workstreams or scope areas, not by Aberdeen's internal model.
The framework is how we do it; their scope is what we organize around.

Anti-pattern: a generic methodology diagram with the client's name on top.

## 5. Deliverables

Exactly what they receive, tied to workstreams and decision gates. Give each a number
(D1, D2...) and reuse those numbers in the timeline and the workplan so a reader can
trace a deliverable end to end.

## 6. Team

**Named** senior people, roles, and time commitment. Keep validation independent of
delivery. Real bios with real credentials, or `[NEEDS INPUT]` - never a placeholder
persona.

Present it as a table, one row per named person:

| Column | Source | Rule |
|---|---|---|
| Name | Resource roster | Real people only |
| Role on this engagement | Solution shape from stage 2 | Aberdeen's role name, mapped to the client's structure where they named one |
| Title and seniority | Resource roster | Verbatim. The title drives the rate. |
| **Relevant skills and capability** | See below | **Never inferred from the job title.** |
| Commitment | Stage 2 staffing shape | Hours or percentage per week, and for how long |
| Availability | Roster roll-off date and billable hours | Say whether they are free by the proposed start, and flag anyone who is not |

**Fill the skills column from the roster's `Skills` field, not from the job title.** A title is a
grade: "Senior Manager" says nothing about whether the person has run an Epic implementation. The
roster carries a populated skill tag set for every person, so this column is evidenced rather than
guessed. See Tier 2c in `corpus-map.md` for the query and its four limits.

Sources, in order of strength:

1. **The roster's `Skills` tags.** Populated for everyone. Filter to delivery capability and drop
   the internal and BD tags, which are not proposal credentials.
2. **The roster's engagement history**, for domain exposure the tags do not capture. Naming the
   client needs the same clearance as any credential, so prefer the domain over the name.
3. **Nothing else.** No inference from title, department, manager or seniority band.

**Write what the evidence supports and no more.** The tags are self-reported and carry no
proficiency rating, so "has ERP and healthcare IT experience" is supportable and "our leading
Epic expert" is not. A required certification is not in the tag set and stays `[NEEDS INPUT]`.

Where a required skill cannot be evidenced, write
`[NEEDS INPUT: confirm <skill> for <name> - practice lead]` and keep the person in the table.
An honest gap against a real name is recoverable; an invented capability is not.

**Keep the seniority mix defensible.** A pursuit staffed entirely with senior titles is a
pricing problem, and one staffed entirely with junior titles fails the senior-led promise. State
the reasoning behind the mix, not just the mix.

## 7. References

Recent, relevant, contactable. Lead with the closest analog to this client.

Never generate a reference. If contactable references are not in the corpus, emit
`[NEEDS INPUT: client references - confirm with relationship owner before submission]`.

## 8. Timeline

Phased, gate-based, aligned to their start date. **Show their time commitment**, not
only ours - buyers underestimate their own effort and a proposal that names it reads as
experienced.

Prefer a week-by-week grid over a phase diagram. It is harder to fake and it is what a
serious evaluator looks for.

## 9. Cost / investment

Transparent, by deliverable. Present value alongside price.

Pricing must come from the corpus (service offering and pricing material) or be
`[NEEDS INPUT]`. Never estimate a rate or a total from general knowledge.

## 10. Why us

The differentiators, plus an **evaluation-criteria crosswalk that scores itself**: a
table mapping each of the client's stated evaluation criteria to where the response
addresses it and what the proof is.

The crosswalk is the highest-leverage page in the document. Build it from the compliance
matrix produced in stage 1.

## 11. Assumptions, dependencies & terms

Protective framing - the guardrails that keep scope and margin intact. See
`protective-clauses.md`. Framed as *how we work*, not as contract language.

## 12. Appendix

Resumes, detail, figures, and the "Ask Aberdeen" AI companion / QR where it fits.

---

## Format pairing

From Playbook Section 4. Choose the primary format for how the client will evaluate,
then add supporting formats where they add proof.

| Pursuit type | Combination |
|---|---|
| Enterprise RFP | Word proposal (primary) + figures + AI companion via QR + short orals deck |
| Fast RFQ or add-on | Tight Word or PDF response + pricing model |
| Executive pitch | Deck (primary) + one-page leave-behind + optional demo or video |
| Delivery phase | SOW (Word) + status decks + dashboards; change orders as needed |

When the client requests a specific format, honor it exactly, then add one Aberdeen
differentiator without breaking their requirements.

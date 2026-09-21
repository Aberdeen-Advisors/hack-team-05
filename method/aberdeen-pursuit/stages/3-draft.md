# Stage 3 - Draft

**Input:** stages 1 and 2
**Output:** the full proposal, as a branded Word document plus a locked PDF

---

## Before drafting

0. **Read the profile from stage 1, then read `references/response-profiles.md`.** The profile
   selects the spine, the register, what must be excluded, and the artifact. Everything below
   assumes you have done this. The 12-part spine is the RFP spine, not the default for all
   eight profiles, and using it on an RFI or a questionnaire is the single most expensive
   mistake available in this stage.

   Keyed to the canonical profile keys in `references/response-profiles.md`.

   | Profile | Spine to use | Do not include by default |
   |---|---|---|
   | `RFP` | Full 12-part, `proposal-spine.md` | whatever the client excluded |
   | `RFI` | Understanding, capability, high-level approach, credentials, point of view, what we would need to scope | pricing, detailed staffing, binding commitments, contract terms |
   | `RFQ` | Restated scope, deliverables, price, assumptions and exclusions, terms, timeline | persuasion essays |
   | `Discussion` | Understanding, problem as heard, approach, deliverables, cadence and timeline, team, commercial summary, next step | competitive framing |
   | `Capability` | Firm overview, credentials by analog, named team, differentiators, references | approach detail nobody asked for |
   | `Questionnaire` | **Their template, exactly.** See the workbook procedure below. | any restructuring |
   | `SOW` | Scope, deliverables with acceptance criteria, timeline, fees, roles, assumptions, change control, off-ramps | win themes, persuasion |
   | `Change order` | What changed, impact on scope, schedule and fees, revised deliverables, approval | anything not traceable to the original SOW |

   **The "do not include" column is a default, not a prohibition.** If the client asked for
   something in it, answer the question. Precedence: the client's explicit ask beats the
   profile, and the profile beats a gate's default. Answer at the grade the document implies,
   state the assumptions, label it as indicative where it is, and record the override in the
   compliance matrix so the reviewer sees a decision rather than an omission. One requested cost
   estimate does not turn an RFI into a proposal.

   State the spine you selected and why before drafting a word of it, and list any profile
   defaults you are overriding because the client asked.

1. Re-read `references/aberdeen-voice.md` and `references/protective-clauses.md`. Read
   `references/proposal-spine.md` when the profile uses the 12-part spine.
2. **Choose the format. Do not assume.** See "Format selection" below.
3. Fix the section order. If the client specified sections or an order, **use theirs**
   and map the spine into it. Otherwise use the 12-part default.
4. **Read the exclusion rows from the compliance matrix and keep them in view while
   drafting.** Proposing excluded work is as disqualifying as omitting required work.
5. Load the closest prior Aberdeen response and match its depth and register. That
   document is the bar. A section noticeably thinner than its equivalent there is
   under-drafted.
6. Confirm the page or length limit from the compliance matrix and budget length across
   sections before writing.

## Format selection

The client's stated format wins, always. A Word proposal is the common default, not a
given. Aberdeen has responded successfully with a deck as the primary artifact.

| What the RFP says | What to produce |
|---|---|
| Names file types (e.g. "pptx, docx, or xlsx") | Pick from **their** list, based on which suits the content, and say why |
| Names a page or slide limit | Budget to it before drafting, then verify in Gate 6 |
| Names a delivery channel (portal, email, subject line) | Record it; Gate 6 checks it |
| Requires a specific structure or section list | Use theirs; map the spine into it |
| Says nothing about format | Use the pairing guidance in `references/proposal-spine.md` |

Then choose the shape to match the ask:

- **Long, multi-workstream, formal evaluation** - Word proposal on the full spine
- **Short, fast-turnaround, or a client who asked for slides** - deck as the primary
  artifact, with the same spine compressed: understanding, approach with activities and
  deliverables per phase, cadence, timeline with named sessions, deliverable detail, and a
  commercial summary covering scope, duration, resources, fees, expenses, and assumptions
- **Pricing or scoring data the client will inspect** - a workbook alongside the narrative

State the format decision and its justification at the top of the stage output, so a
reviewer can challenge it before the drafting effort is spent.

## Drafting rules

- **Draft content first, apply format after.** Research and facts before polish.
- Write each section against its compliance-matrix rows. As you draft, populate the
  `Answered in` column. Stage 4 verifies it.
- End every section with a `Sources:` line.
- Anything not in the corpus is `[NEEDS INPUT: <what> - <who resolves it>]`. Never a
  plausible-looking placeholder. `[NEEDS INPUT]` is visible and safe; an invented figure
  is invisible and dangerous.
- **State a position on every `Constraint` row, even when the honest position is "we have
  not done this."** A `[NEEDS INPUT]` alone is not a position. Gate 1c fails a draft that
  is silent on an eligibility gate, because silence reads as non-compliance to an
  evaluator. Where the corpus cannot settle it, draft both the flag *and* the instruction
  to the pursuit team: what the adjacent capability is, and that it must not be stretched
  into the credential the client actually asked for.
- No em dashes. Vary sentence length. See the AI-tells table in `aberdeen-voice.md`.
- Where a figure would carry the point better than prose, specify the figure: what it
  shows, its caption, and its number. Do not describe a figure in a paragraph.

## Questionnaire and workbook procedure

Use this instead of the section-by-section pass when the profile is a questionnaire, or
whenever the client supplied a workbook to complete. Read the workbook mechanics table in
`references/response-profiles.md` first.

1. **Enumerate the sheets, including hidden ones.** The hidden list sheet usually holds the
   data-validation vocabulary. That vocabulary is the allowed answer set and it governs
   everything else. If you cannot find it, say so rather than inventing a scale.
2. **Locate the header row per sheet.** It is generally not row 1. Find the row containing the
   response column, and record which columns are the client's and which one you write to.
3. **Qualify every requirement ID with its sheet.** IDs restart per sheet, so an unqualified
   number collides. `3. HR / 118` is an ID; `118` is not.
4. **Answer every row**, using a value from the controlled vocabulary verbatim, plus a
   one-line justification in the description or comment column. Blank reads as
   non-compliance, and so does an answer outside the allowed set.
5. **Where the honest answer is the weakest allowed value, give it**, and use the
   justification column for the compensating control. Never upgrade a value to a stronger one
   than the evidence supports. This is the highest fabrication risk in the whole engine,
   because a single overstated cell is invisible in a file of several hundred rows.
6. **Where the corpus cannot settle a row**, put `[NEEDS INPUT]` in the justification column
   with the owner, and leave the response cell at the honest value rather than the hoped-for
   one.
7. **Pricing tabs obey the normal rules.** Rate card, provisional-rate flag, no invented
   figure. A pricing tab does not become an estimate because it is a spreadsheet.
8. **Do not touch the client's structure.** No new sheets, columns, reordering, renaming or
   reformatting. Additional context goes in the comment column or a clearly separate cover
   note.

The compliance matrix and the answer sheet are the same artifact here, so stage 1's matrix is
the tracking mechanism. Report `answered / total` **per sheet**, never as one number: a
workbook that is complete on five sheets and empty on a sixth looks finished in aggregate.

Produce the completed workbook through the `aberdeen-brand` skill as .xlsx, preserving the
client's file structure. Brand styling applies to anything you add, never to their template.

## Section-by-section

**Prose profiles only.** Skip this pass entirely for a questionnaire, and follow the spine
selected in step 0 rather than assuming the 12-part list. On profiles that exclude pricing,
staffing or terms, those numbered items below simply do not exist: omitting them is correct
and stage 4 knows not to ask for them.

Follow `references/proposal-spine.md`. Order of writing, which is not the order of
reading:

1. **Approach & methodology** first - it is the longest and everything else calibrates to it
2. **Deliverables**, numbered D1, D2..., tied to workstreams and gates
3. **Timeline**, as a week-by-week grid, reusing the deliverable numbers, showing the
   client's own effort alongside ours
4. **Team**, named and real, as the table in `proposal-spine.md` section 6: name, role,
   title and seniority, **relevant skills**, commitment, availability. Build it from the
   resource roster in Tier 2c of `references/corpus-map.md`: real people, real titles, and
   availability checked against their current assignment and roll-off date. Say which proposed
   members are rolling off in time and which are not, and state the reasoning behind the
   seniority mix.

   Two columns the roster cannot fill, and neither may be guessed:

   - **Biography.** Not in the roster. `[NEEDS INPUT: bio - practice lead]` per person.
   - **Skills and capability.** Not in the roster either. The only grounded partial source is
     each person's recorded client and workstream history, which evidences domain exposure
     rather than skill, and naming that client needs clearance. Otherwise
     `[NEEDS INPUT: confirm <skill> for <name> - practice lead]`.

   **Never infer a bio or a skill from a job title.** A title is a grade. Plausible skills
   written against a real name are worse than none, because the person can be interviewed on
   them and the client can check.
5. **Firm qualifications**, from the stage 2 credential selection
6. **References**, or `[NEEDS INPUT]`
7. **Cost / investment**, by deliverable, value presented alongside price. Build the fee
   schedule by joining the proposed team to the rate card on exact job title, and show the
   build rather than only a total. Then apply the three rules in Tier 2c: every derived figure
   carries `[NEEDS INPUT: rates require partner confirmation]`, the rate-card inconsistencies
   touching this pursuit are named rather than smoothed over, and a derived total is never
   presented as a quoted price. Where no rate applies, `[NEEDS INPUT]`, never an estimate.
8. **Why us**, including the **evaluation-criteria crosswalk built from the compliance
   matrix**. This is the highest-leverage page in the document.
9. **Assumptions, dependencies & terms**, against the checklist in
   `protective-clauses.md`
10. **Executive summary**, written now that the content exists
11. **Letter of transmittal**, last
12. **Appendices** - bios, figures, detail, and the AI companion where it fits

## Produce the document

**Invoke the `aberdeen-brand` skill** to generate the artifact in the format chosen above -
.docx, .pptx, or .xlsx. Do not hand-roll formatting. That skill is the single source of
truth for brand application and it is what keeps output consistent across pursuits and
people.

- File name: `Client_Document_Type_Date`. **Check the pursuit folder for an existing file of
  that name first**: the convention collides on a same-day re-run, and a prior submission or
  draft must never be overwritten. On collision, suffix (`_v2`, `_RERUN`) rather than replace.
- Keep an editable source and produce a locked PDF where the client accepts one
- Figures numbered and captioned
- Real heading structure, not bold text, so the document is navigable and accessible
- **Generate a table of contents** on any document beyond roughly ten pages, or wherever the
  client asks for one. Build it as a real field so page numbers stay correct, mirror the
  client's section numbering and titles where they specified them, and keep it to two levels.
  Skip it on decks, questionnaires and short responses. See the front-matter section of
  `proposal-spine.md`. A typed contents list with a wrong page number on it damages the document
  more than having none.

## Write the output to SharePoint, not to the repository

Generated pursuit content is client-confidential. It belongs in the pursuit's SharePoint
folder. See `references/data-handling.md`.

---

## Close the stage

Report: sections drafted, page or word count against the limit, compliance-matrix rows
now populated (`n/N`), and the full `[NEEDS INPUT]` list with owners.

Then run stage 4. Do not present a draft as finished before the quality bar has been run
against it.

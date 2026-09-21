# Stage 5 - Orals / Executive Deck

**Input:** the reviewed draft from stages 3 and 4
**Output:** a branded executive or orals deck

Per the Client Response Playbook Section 4, the winning enterprise-RFP combination is a
Word proposal plus a short orals deck. This stage produces the deck.

---

## First: which kind of deck is this?

The profile decides, and the two cases are different documents.

Keyed to the canonical profile keys in `references/response-profiles.md`.

| Profile | This stage |
|---|---|
| `RFP`, `RFQ` | **Companion.** An orals deck alongside the submitted document, run after the draft is approved. The structure below applies. |
| **`Discussion`** | **The primary artifact**, not a companion. It was produced in stage 3, so do not rebuild it here. Use this stage only to tighten it for the room. |
| `RFI`, `Capability` | **Optional and often better than a document.** Brevity signals seniority. Compress to understanding, capability, credentials and point of view. Pricing only where the client asked. |
| `Questionnaire`, `SOW`, `Change order` | **Does not apply.** Skip and say so. |

## Rules

**The deck is not the proposal reformatted.** A deck that walks the proposal's table of
contents wastes the room. The proposal has already been read, or it has not and never
will be. The deck exists to do the thing a document cannot: hold a room and answer the
panel's real question.

- **Not a substitute for detail.** Pair with the proposal as the leave-behind.
- Tailor to the panel. Check the RFP for who will be in the room and what they weight.
- One idea per slide. If a slide needs a paragraph, it is two slides or it is an appendix.
- Reuse figures from the proposal so the story is visibly the same story.

## Default structure

Adjust for the time allotted and anything the client specified about the session.

| Slide | Content |
|---|---|
| 1 | **Your problem, in your words.** The client's situation as we understand it. Earns the right to the rest. |
| 2 | **What you asked for, and what we heard behind it.** The real decision they face. |
| 3 | **Approach.** One figure. Workstreams organized around their scope. |
| 4 | **Deliverables and timeline.** D1 to Dn against the week grid, with their effort shown. |
| 5 | **Team.** Named faces, real credentials, who they will actually work with. |
| 6 | **Why Aberdeen.** The differentiators, plus the evaluation-criteria crosswalk. |
| 7 | **Proof.** The closest credential analog, with its measurable outcome. |
| 8 | **What happens in the first two weeks.** Concrete, dated, so the start feels real. |

Appendix: detail slides held in reserve for likely questions. Build these from the three
weakest points identified in stage 4 Gate 7 - the panel will find them too.

## Production

Invoke the `aberdeen-brand` skill to generate the .pptx. Do not hand-roll formatting.

- File name: `Client_Orals_Deck_Date`
- Every figure numbered and captioned
- Keep it under the time allotted. Rehearsed pace is roughly two minutes per slide.

## Same rules still apply

Grounding, citations, `[NEEDS INPUT]`, no em dashes, no invented credentials. A deck is
more quotable than a document, so a fabrication in a deck travels further.

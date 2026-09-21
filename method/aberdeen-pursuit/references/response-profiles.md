# Response Profiles

The accelerator handles any inbound client request, not only a formal RFP. The **profile**
is chosen in stage 1 and then governs every later stage: which sections apply, what
register to write in, what must be excluded, and which output format to produce.

**Choosing the wrong profile is the most expensive mistake available here.** Sending a
75-page proposal to an RFI, or a capability deck to a formal RFP, loses before the content
is read.

---

## How to choose

Read what the client actually asked for, not what you would like to sell. Signals, in
order of reliability:

1. **The document calls itself something** - RFI, RFQ, RFP. Believe it, but verify against
   signal 2, because clients mislabel.
2. **What it asks you to submit.** Pricing requested → RFQ or RFP. Capability and approach
   with no pricing → RFI. Approach, qualifications, team *and* price → RFP.
3. **Whether scope is already defined.** Defined and priced → RFQ. Defined but open on
   method → RFP. Undefined and exploratory → RFI or discussion document.
4. **Where it came from.** A procurement portal implies a formal evaluation. A forwarded
   email from an executive implies a discussion document.
5. **Whether there is a stated evaluation process.** Weighted criteria and a submission
   deadline mean formal. Neither means relationship-led.

When the signals conflict, say so, then weigh them rather than defaulting to the heavier
profile:

- **A document that names itself, plus a stated intent to run a later RFP, dominates.** "This
  RFI will inform a subsequent RFP" is the client telling you where in the process you are.
  Believe it.
- **A single requirement that belongs to a heavier profile does not upgrade the profile.** An
  RFI that asks for an indicative cost is still an RFI. Handle the requirement under the
  precedence rule below, not by switching profile.
- **Escalate only when the substance changes**, not the surface: weighted evaluation criteria, a
  binding submission process, or a defined scope awaiting a firm price. Those are RFP and RFQ
  signals.

Then note the assumption and move on. Over-responding is a real loss, not a safe hedge: a
75-page proposal against a ten-question RFI reads as not having listened, and it burns the
credibility the RFI stage exists to build.

---

## Precedence: what wins when these conflict

Read this before using any profile's "must not include" list.

1. **What the client explicitly asked for.** Always wins. A profile default never justifies
   leaving a direct question unanswered.
2. **The profile's defaults.** Win over a gate's expectations when the client is silent.
3. **A gate's default expectation.** Lowest precedence of the three.

A profile's exclusions describe **what a client at this stage usually does not want**. They are
not prohibitions that survive a direct request. Verified the hard way: a real RFI that forbade
pricing by profile default asked, in its own numbered questions, for an implementation cost
estimate with a fee and effort model, and for ongoing subscription and licensing costs. Obeying
the profile would have left two of ten questions blank and lost on responsiveness.

When a client asks for something the profile excludes:

- **Answer it**, at the grade the document implies. An RFI asking for a "rough estimate"
  wants an estimate with its assumptions visible, not a quote and not silence.
- **Say what grade it is.** Label it an indicative estimate, state the assumptions it rests on,
  and note that a firm price follows a defined scope.
- **Record the override** in the compliance matrix and in the stage 3 output, so the reviewer
  can see the profile default was consciously overridden rather than forgotten.
- **Do not let it drag the rest of the response up a grade.** One requested cost estimate does
  not turn an RFI into a proposal.

## Canonical profile keys

**Use these exact keys when referring to a profile in any other file.** Stage 1 states one of
them, and the routing tables in stages 2, 3 and 5 and the gate applicability table in
`quality-bar.md` key off them. Drift in the naming is drift in the routing: a profile referred to
as "Security / vendor questionnaire" in one file and "Questionnaire" in another cannot be checked
mechanically, and it is how a ninth profile gets added without being wired.

| Key | Full name |
|---|---|
| `RFP` | RFP to proposal |
| `RFI` | RFI to capability response |
| `RFQ` | RFQ to quote |
| `Discussion` | Discussion document to executive pitch |
| `Capability` | Capability or credentials request |
| `Questionnaire` | Security or vendor questionnaire |
| `SOW` | SOW, binding scope, post-win |
| `Change order` | Change order, in-flight |

Adding a profile means adding a key here **and** a row in each of those four routing tables. Run
`python lint_engine.py` afterwards; it checks exactly that.

## The profiles

### 1. RFP → Proposal

**Client is asking:** "Propose how you would solve this, and what it costs."

| | |
|---|---|
| Spine | Full 12-part, per `proposal-spine.md` |
| Register | Persuasive and descriptive. States assumptions, scope and pricing. Not binding. |
| Must include | Everything the RFP requires, in the client's order. Pricing. Named team. References. |
| Format | Usually a formal document; honour whatever they specify |
| Stages | All five |

### 2. RFI → Capability response

**Client is asking:** "Tell us what's possible."

| | |
|---|---|
| Spine | Understanding · relevant capability · approach at a high level · credentials · point of view · what we would need to scope properly |
| Register | Informative and generous. This is market education with a credibility layer. |
| **Default exclusions** | Pricing, detailed staffing, binding commitments, contract terms. **Defaults, not prohibitions.** RFIs commonly ask for indicative costs and a resource model anyway. Where the client asks, answer at estimate grade with assumptions stated. See the precedence rule above. |
| Format | Short document or deck. Brevity is a signal of seniority here. |
| Stages | 1, 2, a compressed 3, then 4 |

**The trap:** treating an RFI as a small RFP. An RFI shapes the RFP that follows. The goal
is to influence the requirements and the shortlist, not to win now. A point of view on what
the client should be asking for is worth more than a capability list.

### 3. RFQ → Quote

**Client is asking:** "What's your price for this defined thing?"

| | |
|---|---|
| Spine | Restated scope · deliverables · price · assumptions and exclusions · terms · timeline |
| Register | Precise and short. No persuasion essay. |
| Must include | Pricing, and the assumptions the price depends on |
| Watch | Scope is defined by the client, so protective terms carry the margin. Exclusions matter more than in any other profile. |
| Stages | 1, a light 2, 3, 4 |

### 4. Discussion document → Executive pitch

**Client is asking:** nothing formally. This follows a conversation.

| | |
|---|---|
| Spine | Our understanding · the problem as we heard it · proposed approach with activities and deliverables per phase · **a calendar of named meetings with participants and durations** · deliverable detail · commercial summary covering scope, duration, resources, fees, expenses and assumptions · next step |
| Register | Collaborative, not competitive. Written as if continuing the conversation. |
| Format | **Deck is usually the primary artifact**, not a companion |
| Do not soften the calendar | A won deck-format proposal in the corpus carries a calendar of **named** sessions with who attends and how long each runs, not a phase bar. That specificity is the credibility device: it is hard to fake and it shows the engagement has been thought through to the week. "Cadence and timeline" is the weaker version of this and loses the effect. |
| Watch | No stated requirements, so there is no compliance matrix to build from. Build one from the conversation record instead, and flag that it is inferred. |
| Stages | 1 (adapted), 2, 3 as a deck, 4 |

Open with what the client said, in their words. Earning the right to propose comes from
demonstrating you listened, and there is no RFP text to hide behind.

### 5. Capability / credentials request

**Client is asking:** "Who are you and what have you done?"

| | |
|---|---|
| Spine | Firm overview · relevant credentials selected by analog · named team · differentiators · references |
| Register | Evidence over adjectives |
| Must include | Measurable outcomes. A credential without a number is filler. |
| Stages | 1 (light), 2, 3 compressed |

Almost entirely a corpus-retrieval task. Quality tracks the credentials library directly.

**This profile has no other content to fall back on, so `[VERIFY]` density is the gate.** Every
other profile can carry an unverified credential alongside approach, method and understanding. A
capability response *is* the credentials. If most of the library rows it needs are still marked
`[VERIFY]`, the honest output is mostly flags, and that is a signal to fix the library rather than
to ship.

So on this profile, report the ratio: how many of the credentials used are confirmed versus
`[VERIFY]`. Below roughly half confirmed, say plainly that the response is not ready and name
what a human must confirm. A capability response is scored on credentials, so an unverified one is
scored on nothing.

### 6. Security / vendor questionnaire

**Client is asking:** a long list of closed questions, usually in a workbook.

| | |
|---|---|
| Spine | Their template, exactly. Never restructure it. |
| Register | Direct answers. The allowed value plus a one-line justification. |
| Must include | An answer in every row. Blank rows read as non-compliance. |
| Watch | This is where fabrication risk is highest, because the questions invite a confident yes. Any control Aberdeen does not have gets an honest partial with the compensating control named. |
| Stages | 1, then 3 directly. Skip 2, unless a pricing tab is present. |

The compliance matrix and the answer sheet are the same artifact here.

#### Workbook mechanics

Real vendor workbooks share a shape, and each part of it breaks a naive read. Verified
against an actual multi-sheet vendor submission workbook.

| Feature | What it means for the run |
|---|---|
| **One sheet per domain**, plus a bidder-info sheet | Requirements are numbered *within* a sheet, so IDs repeat across sheets. Qualify every ID with its sheet, or the compliance matrix silently collides. |
| **The header row is not row 1.** Typically a title row, a blank row, then the header | Never assume row 1 is the header. Find it by locating the row containing the response column. |
| **Two column patterns.** `Number, Requirement, Response, Additional functionality description, Comment` on functional sheets; `Number, Prompt, Response, Comment` on informational ones | Write to the response column, use the description column for the justification, and leave the client's own columns untouched. |
| **A hidden list sheet holding the allowed values** | This is the data-validation vocabulary, and it is the single most important thing in the file. Answers must come from that exact set. A free-text answer where the workbook expects a controlled value can invalidate the submission. **Read the hidden sheets.** |
| **An instructions sheet, often marking some sheets REQUIRED** | Those markings are `Admin` rows in the compliance matrix, not commentary. |
| **Pricing tabs inside the same workbook** | Common, and the reason stage 2 is only conditionally skipped. Pricing here obeys the same rules as any other profile: rate card, provisional-rate flag, no invented figure. |
| **Hundreds of rows**, often several hundred on one sheet | Report progress as `answered / total` per sheet. A partial pass that looks complete is the failure mode. |
| **Required versus optional encoded in cell fill colour** | Verified on a real workbook whose instructions read: cells highlighted light blue are required, cells highlighted grey are optional. **A text extraction drops this silently**, so a text-only read cannot tell a required cell from an optional one and will report full coverage while having missed every mandatory row. |

#### The formatting problem, stated plainly

Workbooks carry meaning in things that are not text: fill colour, data validation, hidden
sheets, merged cells, conditional formatting. Reading a workbook as text loses all of it.

So on any questionnaire:

1. **Read the instructions sheet first and look for a formatting legend.** If required status
   is encoded in colour, say so immediately and treat every row as required until proven
   otherwise. Over-answering is recoverable; missing a mandatory row is not.
2. **If you cannot read cell formatting, say that explicitly** in the stage 3 output and in the
   Gate 6 report. Do not report coverage as complete when the required/optional distinction was
   invisible to you. That is the questionnaire equivalent of a fabrication: a confident number
   that the method could not actually support.
3. **Escalate it as a `[NEEDS INPUT]`** asking a human to confirm which rows are mandatory,
   with the workbook's own legend quoted.

This is a real limitation of the current retrieval path, not a hypothetical. It is worth
knowing before a submission rather than after.

Answer in the client's own vocabulary and do not soften it. Where the honest answer is the
weakest allowed value, give that value and use the justification column for the compensating
control. A stronger value than the evidence supports is a fabrication in a cell, and it is
harder to spot than one in a paragraph.

### 7. SOW → Binding scope *(post-win)*

**Client relationship:** already won; now pinning it down.

| | |
|---|---|
| **Shape first** | **Ask whether this is deliverable-based or time and materials before drafting.** They have different spines. See "Two commercial shapes" in `protective-clauses.md`. Verified against a real executed SOW that was T&M with no deliverables at all. |
| Spine, deliverable-based | Scope · numbered deliverables with acceptance criteria · timeline · fees by deliverable · roles · assumptions and dependencies · change control · off-ramps |
| Spine, time and materials | Scope by phase with activities · **role-by-phase fee table** with estimated hours, rates and totals · not-to-exceed · invoicing and hours-approval mechanism · expenses · roles · assumptions · change control · off-ramps |
| Register | **Binding.** Precision over persuasion. Every sentence is enforceable. |
| Watch | Protective terms move from framing to obligation. On a T&M SOW the margin sits in the NTE, the approval mechanism and the expense terms, not in a scope fence. Counsel owns final terms. |
| Roles | The fee table prices **engagement roles**, which are not HR job titles and are not in the rate card. See the role-vocabulary note in `corpus-map.md`. |
| Stages | 1, 3, 4. No win themes. |

### 8. Change order *(in-flight)*

**Client relationship:** active SOW, scope has moved.

| | |
|---|---|
| Spine | What changed · impact on scope, schedule and fees · revised deliverables · approval |
| Register | Factual and unemotional. Reference the original SOW clause. |
| Watch | The mechanism that turns new asks into paid work. Under-using it is how margin leaks. |
| Stages | 1 (light), 3, 4 |

---

## What every profile keeps

The five non-negotiable rules in `SKILL.md` apply without exception:

1. Ground every claim; `[NEEDS INPUT]` rather than invent
2. Cite sources per section
3. Client's problem before Aberdeen's capability
4. Aberdeen voice, no em dashes
5. Nothing client-confidential leaves approved tools

And these hold regardless of profile:

- **Requirements are extracted and tracked**, even when the client did not number them
- **Constraints and exclusions are recorded** as their own types
- **The terms-conflict scan runs** whenever the client supplies any terms
- **The quality bar runs** before anything is called finished

## Profile changes mid-pursuit

Common and worth handling explicitly. An RFI becomes an RFP. A discussion document becomes
a formal submission. A proposal becomes a SOW.

When it happens, keep the compliance matrix and the credential selection, and re-run
stage 3 under the new profile. The intake work is the durable part; the shape around it is
not.

# Stage 1 - Intake

**Input:** the client's RFP, RFI, or RFQ (file, SharePoint link, or pasted text)
**Output:** opportunity brief · compliance matrix · bid/no-bid · clarifying questions

This stage is where most of the value is created. Everything downstream cites it.

---

## Step 1 - Read the document completely

Read the whole thing before writing anything. Do not summarize from the first pages.

Note explicitly whether you were able to read all of it. If the document is long enough
to be chunked, read every chunk and say so. A compliance matrix built from a partial read
is worse than no matrix, because it looks complete.

## Step 2 - Classify, and choose the response profile

Identify the document type using `references/protective-clauses.md`. RFI, RFQ, and RFP
call for materially different responses. State the type and what it implies, and carry
that classification through every later stage.

Then **read `references/response-profiles.md` and choose the profile**, using the signal
order in that file. State it explicitly, in this form, because every later stage reads it:

```
PROFILE: <name>   (signals: <which ones decided it>)
STAGES THAT APPLY: <from the profile table>
MUST NOT INCLUDE: <from the profile, verbatim>
PRIMARY ARTIFACT: <document, deck, workbook>
```

This block is not decoration. Stage 2 checks it to decide whether it runs at all, stage 3
selects its spine from it, and stage 4 uses it to decide which gates apply. A run that
does not state a profile has skipped the decision rather than made it, and it will default
to RFP behaviour on a document that may not be an RFP.

**Where the signals conflict, say so, pick the heavier profile, and record the assumption**
as an item for the user to confirm. Profiles also change mid-pursuit: an RFI becomes an RFP,
a proposal becomes a SOW. When that happens the intake work carries forward and the shape
around it is rebuilt. See the last section of `response-profiles.md`.

## Step 3 - Opportunity brief

Six to ten sentences, plus a facts table. Written for a partner deciding whether to
commit a team.

**Narrative:** who the client is, the business problem behind the request (not just the
request), what they are asking for, how they will evaluate it, and the deadline. Lead
with the problem, and be specific about what makes this pursuit winnable or hard.

**Facts table** - every row sourced or `[NEEDS INPUT]`:

| Field | Value |
|---|---|
| Client and unit | |
| Industry | |
| Scale (revenue, employees, sites) | |
| **Buying committee** - every named issuer, with title | |
| **Submission contact and channel** - often *not* the decision-maker | |
| **Relationship status** - incumbent, existing client, prior work, or cold | |
| Document type | |
| Scope summary | |
| **Explicitly out of scope** (see step 4c) | |
| **Hard constraints / eligibility gates** (see step 4b) | |
| Stated evaluation criteria and weights | |
| Q&A deadline | |
| Response deadline | |
| Presentation / orals date | |
| Target engagement start | |
| **Required response format** - file types, page limit, delivery channel, naming | |
| Required contracting vehicle (MSA / BAA / NDA) | |
| Budget or pricing expectations | |
| Incumbent or known competitors | |

Three of these are easy to skim past and expensive to miss:

- **Buying committee vs submission contact.** An RFP naming four executives as issuers is
  telling you who decides. The sourcing contact you email is usually not one of them.
  Capture both, separately.
- **Relationship status.** Whether Aberdeen is the incumbent, a prior vendor, or unknown
  to this client changes the entire strategy. It is sometimes stated in an unexpected
  place, such as a confidentiality clause naming the firm as a current partner. Look for
  it rather than defaulting to "cold."
- **Required response format.** Do not assume a Word proposal or a PDF. Clients specify
  slides, workbooks, portals, and email. This drives stage 3 and it is disqualifying when
  missed.
- **Dates against today.** Compare every deadline in the facts table to the current date
  before scoring anything else. A passed Q&A window closes step 6's client-questions channel;
  a passed response deadline makes the whole pursuit moot as a live matter and must be said
  plainly in the brief and the bid/no-bid, with the run reclassified as a benchmark,
  practice, or reopened-window exercise. Verified the easy failure: an RFP reads as urgent
  and current long after its dates have lapsed.

## Step 4 - Compliance matrix

**This is the artifact that wins or loses the deal.** Extract every explicit requirement,
question, and evaluation criterion. Do not paraphrase into themes - one row per discrete
thing the client asked for, in the client's own words and the client's order.

| ID | Requirement (client's words) | Type | Source | Answered in | Status |
|---|---|---|---|---|---|
| R1 | | Mandatory / Evaluation / Constraint / Exclusion / Format / Admin | p.4 §2.1 | Section 3 | Planned |

Six types. The last three are the ones that get missed.

- **Mandatory** - something the response must contain or the bidder must do
- **Evaluation** - a stated scoring criterion, with its weight if given
- **Constraint** - see 4b
- **Exclusion** - see 4c
- **Format** - page limits, file types, delivery channel, naming, subject line, deadline
- **Admin** - certifications, conflict statements, validity periods, contracting vehicles

Rules:
- If the RFP numbers its requirements, keep their numbering as well as yours
- A question the client asks is a requirement. Sections titled "key questions we want
  answered" are requirement lists in disguise.
- Format and admin requirements are requirements. They disqualify when missed.
- Report the count by type.

The `Answered in` column is populated during stage 3 and verified in stage 4 Gate 1.

### 4b - Constraints (eligibility gates)

A **constraint** is a pass/fail condition on the bidder, not a scored criterion. Examples
of the shape: a prohibited delivery model, a mandatory named-platform experience, a
required certification, a geographic restriction, a conflict-of-interest bar.

These read like ordinary bullets and are easy to lose in a capabilities list. The tell is
absolute language: *prohibited, must have, required, will not be considered, only*.

Treat every constraint as a potential disqualifier:

- Record it as its own row, typed `Constraint`
- Assess honestly whether Aberdeen meets it, and say so
- **Carry every constraint into the bid/no-bid in step 5.** A single unmet hard constraint
  can make an otherwise attractive pursuit a no-bid, and that is worth knowing on day one
  rather than after a team has spent a week drafting.

### 4c - Exclusions (negative requirements)

An **exclusion** is content the client has told you *not* to include. Clients state these
as "explicitly out of scope," "not part of this phase," or "must not be included in
responses."

Exclusions are as disqualifying as omissions, and they fail in the opposite direction:
the usual instinct is to demonstrate breadth by covering more, and here that loses points.
A response that proposes the excluded work reads as not having read the RFP.

- Record each as its own row, typed `Exclusion`
- Phrase the row as what must **not** appear
- Stage 3 must avoid proposing it. Stage 4 Gate 1 verifies it was not breached.

Where an exclusion is genuinely adjacent to something valuable, the correct move is to
respect it in the scope and note the adjacency as a possible later phase, clearly outside
this response. Do not smuggle it back in.

## Step 5 - Bid / no-bid

Score against the ICP qualification checklist in `references/methodology-assets.md`.

| Criterion | Assessment | Evidence |
|---|---|---|
| **Hard constraints met** (from step 4b) | | |
| **Scope fit** (see step 5c) | | |
| ICP vertical fit | | |
| Size band ($50M–$5B+) | | |
| Executive sponsorship visible | | |
| Defined strategic initiative | | |
| Budget authority within 90 days | | |
| Openness to governance and benefits tracking | | |
| Transformation / M&A / modernization signal | | |
| Aberdeen has a close credential analog | | |
| Relationship status (incumbent, prior client, cold) | | |
| Timeline feasible with available team | | |

**Hard constraints are evaluated first and can end the analysis.** If a constraint from
step 4b is not met and cannot be met, say so plainly and recommend no-bid regardless of
how attractive the rest looks. Do not soften an unmet constraint into a risk.

Then a recommendation: **Bid / Bid with conditions / No-bid**, in one paragraph, naming
whether this is ICP-aligned or opportunistic (the target mix is 70/30, so opportunistic
is not automatically a no-bid). Name the single biggest risk to winning and the single
biggest reason we would win.

Be willing to say no-bid. A tool that recommends bidding on everything is not useful.

### 5c - Scope fit (the most common real reason to decline)

Hard constraints are about whether Aberdeen is *eligible*. Scope fit is about whether the
work is *the work Aberdeen does*. It is a separate test and it is the one most often skipped,
because an attractive client in a target vertical with real budget can still be issuing an
RFP for something largely outside the firm's offering set.

**Aberdeen's recorded reason for declining a genuinely attractive healthcare pursuit was
exactly this: the request was broader than what the firm provides, and the technology
component that Aberdeen owns was only one part of it.** ICP fit was not the problem. Scope
was.

Run the test mechanically:

1. Decompose the RFP's scope into its component workstreams, in the client's own terms.
2. Map each component to Aberdeen's offering set in `references/methodology-assets.md`.
   Anything that maps to no offering is **out-of-offering scope**.
3. State the split plainly: what share of the requested scope Aberdeen would own, what share
   it would not, and whether the part it does not own is central or peripheral to the
   client's stated objective.

| Finding | What it means for the recommendation |
|---|---|
| All material components map to offerings | Scope fit passes. Proceed on the rest of the checklist. |
| A peripheral component falls outside | Bid, and scope it out explicitly in the proposal's out-of-scope section. Do not stretch an offering to cover it. |
| **A central component falls outside** | **Strong no-bid signal, even with good ICP fit.** Say so directly. The alternative is a response that either overpromises or visibly answers only part of the ask. |
| Aberdeen owns a minority of the scope | Recommend no-bid, or teaming with a named partner who owns the rest, and say which. A partial answer to a whole-scope RFP loses to a whole answer. |
| **Aberdeen owns the work but not the role the client is addressing** | **Reframe rather than bid or decline.** See below. |

**The third outcome: reframe the role.** Scope fit is not only pass or no-bid. Sometimes Aberdeen
can do the work but the request is addressed to a different kind of respondent, and the honest
answer changes who Aberdeen is in the pursuit.

Found on a real RFI addressed to technology vendors: Aberdeen could answer eight of ten questions
as a selection and implementation advisor, but two required a platform vendor's own licensing and
hosting prices. The right response was neither a decline nor a pretend-vendor bid. It was to bid as
an advisor and state plainly that licensing pricing must come from the platform vendor.

When this applies, say all three things: the role Aberdeen is responding in, which parts of the ask
that role cannot answer, and who can. Evaluators respect a respondent that knows what it is. They
do not respect one that answers a question it had no standing to answer.

**On an `RFQ` this test is more decisive than anywhere else.** The client has already defined the
thing and wants a price for exactly that. There is no room to reshape scope in the response, so
either Aberdeen delivers the defined item or it does not. Run scope fit before pricing anything.

Two failure modes this prevents, in opposite directions. The first is bidding on work the
firm cannot deliver, discovered after a team has spent a week drafting. The second is a
generated response that quietly redefines the client's scope down to what the corpus can
support and presents that as responsive. Both are worse than a clear early decline.

Where the honest answer is a decline, write the reason in one sentence a partner could send
as-is. "It is broader than what we typically provide, and the technology component we own is
only part of it" is a better answer to a client than silence or a weak bid.

## Step 5b - Terms-conflict scan

Read the client's terms and conditions against Aberdeen's standard commercial positions in
`references/protective-clauses.md`. Report every conflict, not just the obvious ones.

Scan specifically for:

| Client term to look for | Conflicts with |
|---|---|
| Blanket assignment of **all** IP and work product | Aberdeen's background-IP carve-out; would capture frameworks, templates, and methods |
| Unlimited or uncapped liability | Liability cap belongs in the MSA and is not expanded in a proposal |
| Broad indemnity obligations | Counsel owns this; never accepted in a proposal |
| Unilateral termination without payment for work performed | Gate-based off-ramp, paid to date |
| Acceptance with no deemed-accepted backstop | Schedule and payment risk |
| Payment terms materially beyond 45 days | DSO objective of ≤45 days |
| Mandatory flow-down of client policies to subcontractors | Delivery model constraint |
| Data offshoring or residency restrictions | Delivery model constraint |
| Required insurance limits above standard | Cost and feasibility |

For each conflict found, report: the clause in the client's words, what it conflicts with,
the practical exposure, and the options - propose carve-out language, raise it as a Q&A
question before the deadline, or accept and price for it. **Name who must decide**, which
is normally the relationship owner with counsel.

This step is cheap and it is one of the highest-value things the tool does. These clauses
are routinely discovered during contracting, after the commercial position has already
been given away in the proposal.

Where no conflicts are found, say so explicitly. Silence is ambiguous.

### On the `SOW` and `Change order` profiles, scan our own draft too

The scan above reads the *client's* terms. On a post-win document the exposure runs the other
way: a SOW is where Aberdeen gives away margin in its own words, and nobody is scanning it.

So on those profiles, run the scan a second time against the draft Aberdeen is producing, looking
for the three weaknesses in `references/protective-clauses.md`: a clause letting the client define
scope unilaterally over time, a not-to-exceed that a verbal instruction can move, and "not
expected to exceed" where "shall not exceed" was intended. All three were found in a real executed
Aberdeen SOW, so treat them as likely rather than theoretical.

Report them the same way: the clause, the exposure, the options, and who decides.

## Step 6 - Clarifying questions

Every `[NEEDS INPUT]` raised so far, sorted into:

**Ask the client** - questions to submit through their official Q&A channel, with the
Q&A deadline noted. Write them as they would be sent.

**Resolve internally** - what the pursuit team must decide or find: pricing approval,
staffing availability, reference permissions, clearance on prior-work references.

This list is the pursuit team's day-one to-do list. It is one of the most valuable things
this stage produces, because these are the questions that otherwise surface on day six.

---

## Close the stage

Report a summary table:

| | |
|---|---|
| **Profile** | the chosen profile, the stages that apply, and the primary artifact |
| Requirements extracted | `N` broken down by all six types |
| Hard constraints | count, and whether all are met |
| **Scope fit** | share of requested scope inside Aberdeen's offering set, and whether anything outside it is central |
| Exclusions | count |
| Required response format | file types, page limit, delivery channel |
| Evaluation criteria | count and the heaviest-weighted one |
| Recommendation | Bid / Bid with conditions / No-bid, and ICP-aligned or opportunistic |
| Commercial conflicts found | count, from step 5b |
| Questions for the client | count, and days until the Q&A deadline |
| Internal items to resolve | count, and how many are blocking |
| Days until the response deadline | |

Then stop and let the user react before running stage 2.

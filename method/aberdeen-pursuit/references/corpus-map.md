# Corpus Map

What the accelerator grounds itself in, and how to find it.

**Resolve everything by search, never by stored ID.** Drive and item IDs are
tenant-specific and go stale. Searching by name works for any Aberdeen user who installs
this skill, which is the point.

```
sharepoint_search        query="<title words>"           → document URIs
sharepoint_folder_search name="<folder name>"            → folder URIs
read_resource            uri="file:///{driveId}/{itemId}" → full text
```

If a document comes back too large to read in one call, it is written to a local file;
read that file in chunks rather than re-fetching.

---

## Tier 1 - load on every pursuit

| Asset | Search for | Role |
|---|---|---|
| **Credentials library** | `aberdeen-credentials-library` (the filename; a natural-language search for "Aberdeen credentials library" ranks hackathon decks above it and can miss it entirely) | **Load this first.** Structured firm facts, engagement credentials with measurable outcomes, platform experience, partnerships, recognitions, methodology, commercial reference points. Purpose-built for this engine. |
| Client Response & Deliverable Playbook | `Client Response Deliverable Playbook` | **The method.** Section spine, format matrix, protective clauses, quality bar, brand. Governs the output's shape. |
| Aberdeen Foundational Strategy | `Aberdeen Foundational Strategy` | ICP and qualification checklist for bid/no-bid. Value proposition, 4 E's, voice, target verticals. Anchors win themes. |
| Service offerings workbook | `Aberdeen Service Offerings` | Offerings mapped to the 4 E's and to verticals, plus a client-challenge-to-offering map. Use to position scope inside Aberdeen's real menu. |
| Closest prior response | `<client name>` then `<industry> <service> response` | The nearest analog Aberdeen has actually sent. Sets the depth and register bar, and see the mining rule below. |

## Prior responses are the richest credential source

**The most important retrieval rule in this file.**

A firm's hard credentials - headcount, engagement counts, client outcomes with numbers,
partnership tiers, certifications, named platform experience - are usually written down
exactly once, buried inside a long submitted response, and nowhere else. They are invisible
to a search for "credentials" because the document is named after the client.

A benchmark run proved the cost of missing this: the engine scored **0 out of 2 on
specificity** in firm qualifications, team and references, and flagged a platform
credential as a *gap* while the firm's own prior response described that capability in
detail. Nothing was missing from the firm. It was missing from where the engine looked.

So:

1. **Load the credentials library first.** If it exists and is current, most of this is
   already extracted.
2. **Then mine the closest prior responses**, and mine them for two things, not one:
   - the *shape* - depth, register, section handling
   - the *facts* - every firm figure, client outcome, partnership, certification and
     platform claim in it
3. **Anything found by mining that is not in the credentials library is a finding.**
   Report it at the end of stage 2 so it can be added. The library should get better every
   pursuit.

**Caution.** A fact in a prior response was true when it was submitted. Headcounts,
partnership tiers and award years go stale. Treat mined facts as `[VERIFY]` rather than
settled, and say where they came from.

**Never** mine a prior response for client-confidential material - the client's own data,
pricing they disclosed, or anything under an NDA specific to that engagement. Aberdeen's
own credentials and outcomes are reusable. The client's information is not.

---

## Tier 2 - load by pursuit type

| Asset | Search for | Use when |
|---|---|---|
| RFP Playbook (6-stage) | `RFP Playbook` | The pursuit is a **software selection or vendor evaluation** engagement. This is a *service methodology*, content for the Approach section. It is **not** the shape of a proposal. See `methodology-assets.md`. |
| Service offering and pricing material | `service offering pricing model` | Cost / investment section. Pricing must come from here or be `[NEEDS INPUT]`. |
| Business case models | `business case model` | The pursuit needs an ROI or TCO narrative. |
| Scoring models | `scoring model vendors` | The pursuit involves evaluating or being evaluated against weighted criteria. |
| Requirements templates | `business requirements gathering template` | The engagement includes requirements definition. |
| **Timeline and workplan exemplars** | `Timeline` as a folder, then `proposed timeline`, `engagement blueprint`, `implementation SOW` | Stage 3 timeline and deliverables sections. A dedicated Timeline folder holds worked examples: a proposed-timeline section from a submitted response, phase-and-stage pages from the AI services engagement blueprint with real durations, and a deck-format timeline sample. Match the exemplar whose engagement *shape* matches the ask, not whose client matches. See the benchmark-hygiene note below. |
| Brand skill assets | `aberdeen-brand` | Always, at document-generation time. |

---

### Benchmark hygiene: some exemplars are extracted from the answer key

At least one timeline exemplar is a section lifted out of a **submitted response that is also
the benchmark's answer key**. For ordinary pursuit work that is exactly right, and mining
prior responses is the point of Tier 1.

For a benchmark run it is contamination. A blind run must not read any part of the response it
is being scored against. So on a benchmark run: exclude the answer-key extracts from what you
load, or if one has been read, **exclude that section from blind scoring and disclose it**,
the same way the transmittal and executive summary were handled on the first run. See
`docs/BENCHMARK.md`.

The rule generalises. Before a benchmark run, check whether any exemplar traces back to the
gold response, and say so.

## Tier 2c - staffing and rates

Two assets in the Staffing folder turn the team and cost sections from placeholders into
real content. Search `Staffing` as a folder, or `resource utilization` and `rate card`.

| Asset | What it carries | What it unlocks |
|---|---|---|
| **Resource roster** | Every consultant: name, title, manager, department, home state, whether currently staffed, current client and project, billable hours, and **roll-off date** | A named staffing model with real people, and an evidence-based answer to "is the timeline feasible with the available team" |
| **Rate card** | Hourly rate by job title | A costed fee schedule built from the actual proposed team |

**They join on the exact job-title string, and the join is clean.** Every title in the roster
appears in the rate card and vice versa, so proposed team times rate gives a defensible fee
build rather than a guessed number.

### The join does not reach what a SOW actually prices

**A real executed SOW prices engagement roles, not HR job titles.** Verified: its fee table
carried roles such as senior advisory leadership, business analyst and a forms developer. None of
those are titles in the roster or the rate card, and the implied hourly rates did not match the
rate card either.

So there are two vocabularies and no mapping between them:

| Vocabulary | Where it lives | Used for |
|---|---|---|
| HR job title | Roster and rate card | Who exists, what grade, what standard rate |
| Engagement role | Proposals and SOWs | What the client is buying and what it is priced at |

**Consequences to handle rather than paper over:**

- A fee build keyed only on job title will misname the roles a client recognises.
- A fee build keyed on engagement role has no rate, because the rate card does not carry those
  names.
- Rates actually charged on a signed SOW may differ from the sample card, so the card is a
  starting point and not evidence of what a client has paid.

Until a role-to-title-to-rate mapping is published, state the engagement role the client will
recognise, state the job title and grade behind it, and mark the rate
`[NEEDS INPUT: confirm rate for <engagement role> - practice lead]`. Do not silently substitute a
job-title rate for an engagement-role rate, and do not invent a role name to fit a rate you have.

### The role-to-rate mapping

Search `role rate mapping` in the Staffing folder. It maps engagement roles to the rates actually
charged on prior executed SOWs, and it is the missing link between the two vocabularies.

**It is seeded, not complete.** Three roles are verified, each confirmed twice within one signed
SOW. Use it under three rules:

1. **A rate charged to one client is not a price for another.** Discounting, relationship history
   and scope all moved it. It is evidence of an achievable range, not a list price.
2. **State the provenance of every figure**: charged on a prior SOW, taken from the rate card, or
   `[NEEDS INPUT]`. A reader must be able to tell which.
3. **Where the mapping and the rate card disagree, say so in the draft and route it.** They do
   disagree today, materially: one role was billed at half the card rate for the nearest
   capability match. Do not pick the convenient number.

Extending it means mining more executed SOWs and change orders, which carry both the role names
clients accepted and the rates actually charged. The file documents the method.

### Three rules that are not optional

1. **Rates are provisional until a partner confirms them.** The rate card is a sample
   maintained for this tool, not the firm's contracted price list. Every fee figure derived
   from it carries `[NEEDS INPUT: rates require partner confirmation]` in stage 3 and appears
   in the stage 4 report. Do not present a derived total as a quoted price.
2. **The rate card has internal inconsistencies a human must settle.** Some senior and
   non-senior titles carry the same rate, and at least one specialist title is priced above
   several management grades. Both may be deliberate. Neither is safe to smooth over,
   average, or reason around. Flag the specific titles the pursuit relies on and ask.
3. **The rate card carries a novelty title column.** Verified on the sample card: alongside
   `Primary job title` sits a joke-title column ("Chief Vibes & Value Officer" grade humour).
   Join and quote **only** the `Primary job title` column. A novelty title reaching a client
   document is a brand incident, and it is exactly the kind of cell a hurried copy-paste grabs.
4. **The roster's tag vocabulary has no security or compliance delivery tag.** Verified on a
   full read (2026-08-12): no person carries a compliance, security, or cybersecurity tag, so
   any pursuit requiring that seat gets an honest open seat and
   `[NEEDS INPUT: compliance/security resource - practice lead]`, never a stretched adjacent
   profile. If the firm has this capability, it is invisible to the roster and worth adding
   to the tag set.
5. **The roster carries a `Skills` column. Use it.** Verified: 38 distinct skill tags, a median
   of 5 per person, and **populated for all 193 people**. Combined with the availability fields,
   this answers the question the firm otherwise asks in hallways: *have we done ERP in a health
   system, and is any of those people free?*

   ```
   Skills contains "ERP / Enterprise Systems"  AND  Skills contains "Healthcare IT"
   AND  Currently Staffed <> Yes  OR  Roll off Date before the proposed start
   ```

   The vocabulary is a fixed tag set covering delivery capability (healthcare IT, Epic, ERP,
   AI and data, enterprise architecture, application development, PMO and governance, change
   management, cutover) alongside internal and BD tags (recruiting, event planning, culture).
   **Filter to the delivery tags for a client-facing team section.** Being tagged for event
   planning is not a proposal credential.

   Five limits to state rather than paper over:

   | Limit | Consequence |
   |---|---|
   | **Self-reported, no proficiency level** | The tag means the person claims the skill, not that they are expert in it. Write "has <skill> experience", never "is our leading expert in". A proficiency rating is a known future addition and does not exist yet. |
   | **Overlapping tags** | `Healthcare IT` and `Epic / Healthcare IT` both exist, as do `Analytics / Reporting` and `Analytics`. Query both forms or you will undercount. |
   | **No certifications** | The tag set carries no certification data. A required certification stays `[NEEDS INPUT]`. |
   | **Tags are coarse** | `AI / Data` covers a wide range. Where a client asks for something specific inside a tag, the tag supports "worked in this area" and the specifics stay `[NEEDS INPUT]`. |
   | **Duplicate rows with conflicting data** | Verified on a real read: the file repeats people, and at least one person appears in multiple rows with different roll-off dates. Dedupe by name before any availability claim, and where duplicates conflict, treat availability as `[NEEDS INPUT: confirm with staffing lead]` rather than picking the convenient row. |

   **Biographies are still absent.** Skills plus title plus project history is not a bio. Narrative
   background stays `[NEEDS INPUT: bio - practice lead]` per named person.

   **Never infer a skill or a bio from a job title, department or seniority band.** A title is a
   grade. Use the `Skills` column, which is evidence, and not the title, which is not.

**Confidentiality.** The roster is employee personal data joined to live client assignments,
and the rate card is commercially sensitive. Both are read at runtime and neither is ever
copied into a repository, a prompt log, or any output that leaves the tenant. Named
individuals reach a client-facing document only for the team actually being proposed.

---

## Tier 2b - built assets, for technology and AI pursuits

Aberdeen has shipped products and internal tools, not only engagements. On a pursuit where
the client is buying AI, data, or delivery capability, **a working asset is a stronger
credential than a case study**, because the client can be shown the thing rather than told
about it.

Search for these and check whether one applies before falling back to engagement
credentials alone:

| Asset | Search for | Why it lands |
|---|---|---|
| **HorizonView**, horizonviewppm.ai | `HorizonView` | Governed program management platform: Fabric lakehouse, Power BI semantic layer, RAG document intelligence, and **agents that answer with citations**. Delivery, Intelligence, and Adoption pillars. Integrates Jira, Azure DevOps, ServiceNow, SAP. Proves Aberdeen *ships* governed AI rather than only advising on it. |
| **Aberdeen Summa Bridge**, aberdeen-summa-bridge.vercel.app | `Summa Bridge`, `Claude Agent SDK` | Claude Agent SDK workspace over Slack and SharePoint for a healthcare client. Reads from source, **hosts nothing**, Claude-generated digests, bidirectional sync. Proof of grounded AI running in a real tenant. |
| Industry solution blueprints | `solution blueprint`, `accelerator` | Reusable delivery assets that cut design time |

**Two properties are worth naming explicitly** whenever these are cited, because they are
what a governance-minded buyer is actually testing for:

- **Cited answers.** Agents that trace every answer to a source. This is the same property
  most AI-governance RFPs are asking to be designed *into* their estate.
- **Host-nothing architecture.** Reads from systems of record rather than copying data into
  a new store. Answers the "where does our data end up" question in one sentence.

**Clearance is different for built assets.** A product with a public marketing site is
generally safe to name. An internal or client-specific tool is not, and naming the client
it was built for needs the same permission as any other credential. Flag it and ask.

These are also live examples of the "Ask Aberdeen" AI companion pattern in Client Response
Playbook §7, if a pursuit calls for one.

## Tier 2d - competitor responses

A set of responses submitted by other firms is held alongside Aberdeen's own outputs. Search
`benchmark proposals` as a folder, or the competitor's name.

This changes stage 2's competitive read from inference to reading. Where a likely competitor
has a response in this set, **read it** rather than reasoning from the shape of the buy:

- What they lead with, and what they bury
- How they structure an approach, and at what depth
- Which credentials and outcome numbers they put forward
- Where they are genuinely stronger, which is what the honest-weakness step needs
- Their commercial framing, where it is visible

Two cautions. These are **competitors' confidential submissions**: use them to calibrate
Aberdeen's own response, never quote or reproduce them, and never characterise a competitor's
pricing to a client. And a submission is a point in time, so treat what it shows as evidence
of that firm's pattern rather than a guarantee of what they will do next.

Where a likely competitor has nothing in the set, fall back to reasoning from the shape of
the buy and label it as inference, exactly as before.

---

## Tier 3 - credentials, selected by closeness of analog

Search the client's industry and the problem shape, then rank what comes back:

1. **Same industry and same problem** - lead with this
2. **Same problem, different industry** - strong second
3. **Same industry, different problem** - shows domain familiarity
4. **Neither** - do not include it

Three strong analogs beat eight weak ones. For each credential capture: client, the
problem, what Aberdeen did, measurable impact, and whether it is contactable as a
reference.

**Never generate a credential or a reference.** If the corpus does not support one,
emit `[NEEDS INPUT]`.

---

## Known corpus areas

These are the SharePoint neighbourhoods worth searching. Exact contents change, so search
rather than assuming a path.

- The firm's main document library - finished client responses, discussion documents
- The RFP Playbook area and its resources tree - method assets, templates, worked
  examples across preparation, business case, governance, and vendor selection
- Practice and service-offering sites - offerings, pricing, capability decks
- Client-specific team sites - prior engagement material for that client

## Prior Aberdeen responses come in more than one shape

When loading "the closest prior response" in Tier 1, do not filter to Word proposals.
Aberdeen has won with a deck as the primary artifact on shorter, faster pursuits, and with
a long formal proposal on multi-workstream enterprise evaluations.

Load the prior response whose **shape matches the ask**, not whose file type matches your
expectation:

| The ask | Look for a prior response that is |
|---|---|
| Long, formal, multi-workstream, weighted scoring | A full written proposal on the section spine |
| Short turnaround, or the client asked for slides | A deck-format proposal: understanding, approach, cadence, calendar, deliverables, commercial summary |
| Pricing or scoring data the client will inspect | A response paired with a workbook or model |

The prior response sets the depth and register bar for stage 3. Matching a Word proposal's
depth when the client asked for a ten-slide deck is as wrong as the reverse.

---

## Corpus material is not automatically citable

Internal decks, pricing workbooks, and capability material are frequently works in
progress. Before citing anything from them, check for these four tells and treat a hit as
`[NEEDS INPUT]` rather than a fact:

| Tell | What it means | Action |
|---|---|---|
| `XX%`, `TBD`, `X hrs`, blank cells in a results box | The outcome was never filled in | Cite the capability, never the number |
| "Dummy Data", "Sample", "Illustrative" | The figures are placeholders | Do not quote any value |
| "WIP", "Placeholder to be updated", "Draft" | The slide is unfinished | Prefer a finished source; flag if none exists |
| **The same fact stated two different ways in one source** | Nobody reconciled them | Cite neither. Two numbers for one thing means zero usable numbers. |

The last one is the most dangerous, because each individual value looks authoritative on
its own page. Pricing is where it happens most: an offering priced in one range on one
slide and a different range on another cannot be quoted at either figure.

Awards, recognitions, and rankings listed without the awarding body are the same problem.
An unattributed award claim is worse than no claim in a response scored on credentials.

## Handling gaps

A gap is a finding, not a blocker.

- Source unreachable → say so, continue, and mark the sections that depended on it
- Fact not in the corpus → `[NEEDS INPUT: <what is needed> - <who can supply it>]`
- Credential not supported → omit it rather than soften it into a vague claim
- Pricing not in the corpus → `[NEEDS INPUT]`, never an estimate

Collect every `[NEEDS INPUT]` into the clarifying-questions list at the end of stage 1
and carry it forward. That list is one of the most useful things this tool produces: it
is the pursuit team's actual to-do list, generated on day one instead of discovered on
day six.

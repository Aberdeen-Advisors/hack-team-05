# Quality Bar and Submission Checklist

Source: Client Response & Deliverable Playbook v1.0, Section 9 and Appendix C.

**Nothing goes to a client until it clears this bar.** Stage 4 runs these eight gates and
reports pass / fail / needs-input per gate, with specific line-level findings. A gate
does not pass because the draft "generally covers it" - it passes when you can point at
where.

---

## Gates are conditioned on the response profile

**Read the profile from stage 1 before running any gate.** Most gates apply universally.
Gate 3 does not, and applying it blindly produces a wrong result rather than a strict one.

Keyed to the canonical profile keys in `response-profiles.md`.

| Gate | Applies |
|---|---|
| 1 Answers the ask | Always |
| 2 Facts verified | Always |
| **3 Protective terms** | **`RFP`, `RFQ`, `Discussion`, `SOW`, `Change order`.** On `RFI`, `Capability` and `Questionnaire` it is N/A unless the client asked. See the precedence rule below. |
| 4 On brand | Always, scoped to what Aberdeen authored |
| 5 Reads human | Always for prose. On `Questionnaire`, applies to the justification text. |
| 6 Format compliant | Always, and it is the gate that matters most on `Questionnaire` |
| 7 Red-team | Always |
| 8 Locked and archived | Always |

### The exclusion rule

Some profiles forbid content that other gates require. An RFI must not contain pricing,
detailed staffing, binding commitments or contract terms. Gate 3 asks for assumptions, out of
scope, change control, acceptance, commercial guardrails and an IP carve-out.

**On those profiles the absence of that content is a pass, not a failure.** Report Gate 3 as
`N/A (profile)` and name the profile. Do not report it as missing, and never add the content to
make the gate pass: that inverts the gate into a defect generator, and it would put binding
terms into a document whose whole point is that it commits to nothing.

### Precedence, in order

1. **What the client explicitly asked for.** Always wins. If the client asked for it, its
   absence is a Gate 1 failure no matter what the profile says.
2. **The profile's defaults.** Win over a gate's expectations when the client is silent. The gate
   goes `N/A (profile)` with the reason.
3. **The gate's default expectation.** Lowest.

So the rule is **not** simply "the profile wins." A profile default is overridden by a direct
client request, and Gate 3 is only N/A when the client did not ask for the content. Verified on a
real RFI whose profile excluded pricing while its own numbered questions asked for an
implementation cost estimate and ongoing licensing costs: there, Gate 3 partially applies and the
cost answer is required.

Report which precedence level decided each N/A. If a conflict is not covered by the profile,
report both readings and let the human decide rather than silently picking one.

---

## Gate 1 - Answers the ask

Every RFP requirement and evaluation criterion is addressed, in the client's order where
specified. Nothing the client excluded has crept back in.

**How to verify - three passes, all required:**

**1a. Coverage.** For each Mandatory, Evaluation, Format, and Admin row in the compliance
matrix, locate the text in the draft that answers it and record the section and page. Any
row without a location is a **fail**, not a warning. Report `n/N requirements addressed`.

**On a questionnaire, 1a is per sheet.** Report `answered / total` for every sheet separately
and verify three things per row: the response cell is non-empty, its value comes from the
workbook's controlled vocabulary verbatim, and a justification is present. An aggregate count
hides an empty sheet, which is why the per-sheet breakdown is mandatory rather than helpful.

**1b. Exclusions.** For each `Exclusion` row, search the draft for content that proposes
the excluded work. A hit is a **fail**. This is the pass most reviewers skip, and it fails
in the opposite direction from coverage: the instinct to demonstrate breadth is exactly
what breaches it. Report `n/N exclusions respected`.

**1c. Constraints.** For each `Constraint` row, confirm the draft states Aberdeen's
position on it. An unmet constraint that the draft is silent about is a **fail** - silence
on an eligibility gate reads as non-compliance to an evaluator.

This is the gate that loses deals when skipped. A brilliant proposal that missed
requirement 14, or that proposed the one thing the client said not to propose, is a
non-responsive proposal.

## Gate 2 - Facts verified

Numbers, names, dates, references, and claims are checked. Cite sources where credibility
matters.

**How to verify:** extract every factual assertion - client figures, Aberdeen metrics,
credential claims, named people, dates, standards references. For each, name the source
document. Anything with no source becomes `[NEEDS INPUT]` in the draft. Report the list.

Pay specific attention to: client financials, employee and site counts, prior-engagement
outcomes, certifications, and named references. These are where a fabrication is both
most likely and most damaging.

Three checks that fail more often than the rest, all mechanical:

| Check | Fails when |
|---|---|
| **Fee figures** | Any fee, rate or total derived from the rate card is missing `[NEEDS INPUT: rates require partner confirmation]`, or a derived total is presented as a quoted price |
| **Named individuals** | A person is named without either a sourced biography or a `[NEEDS INPUT: bio]` against them. A bio inferred from a job title is a fabrication. |
| **`[VERIFY]` rows** | A credentials-library row still marked `[VERIFY]` has been asserted as settled fact rather than carried forward as `[NEEDS INPUT]` |

## Gate 3 - Protective terms present

**Applies to: RFP, RFQ, discussion document, SOW, change order.** On an RFI, a capability
request or a questionnaire, report `N/A (profile)` and move on, **unless the client asked for
the content**, in which case it applies to whatever they asked for. See the precedence rule
above. Check the compliance matrix before declaring this gate N/A: an RFI requesting an
indicative cost model needs that content and the assumptions behind it.

Assumptions, out-of-scope, change control, acceptance, commercial guardrails, and the
IP carve-out. Check against `protective-clauses.md`. Report each as present or missing.

On a SOW or change order the standard rises: these terms are binding rather than framing, so a
term that is present but vague is a fail, not a pass. Counsel owns the final wording.

## Gate 4 - On brand

Colors, fonts, logo, figures, and tables meet the standard. Figures numbered and
captioned. Applied via the `aberdeen-brand` skill.

## Gate 5 - Reads human

Proofread for typos and AI tells. **No em dashes.** Consistent voice. Skimmable.

**How to verify:** scan for the specific tells in `aberdeen-voice.md`. Report every
instance with its line. This gate is mechanical - do it literally, do not eyeball it.

## Gate 6 - Format compliant

File type, page limit, naming, delivery channel, and subject-line requirements met exactly.

**Late or off-format is disqualifying.** Check the actual submission instructions from the
RFP against the actual artifact, item by item:

| Check | Verify against |
|---|---|
| File type | The client's named list. A .docx where they demanded .pdf fails, and so does a .pdf where they asked for an editable format. |
| Page or slide limit | **Counted, not estimated.** Note what the limit excludes (appendices, resumes) before counting. |
| Delivery channel | Portal, email address, or line item, exactly as specified |
| Subject line | Character-for-character where one is given |
| File naming | `Client_Document_Type_Date` |
| **Navigation** | On any document past roughly ten pages: a table of contents exists, it is a real field rather than typed text, its page numbers are correct, and its titles mirror the client's section numbering where they specified one. Headings are real heading levels, not bold body text. |
| Deadline | Date, time, and time zone |

Report each as pass or fail with the actual value observed, not a summary judgment.

## Gate 7 - Red-team read

Someone off the team reviews for clarity, gaps, and competitiveness before submission.

**How to verify:** you are not a substitute for the human red-team read, and you should
say so. What you can do is the adversarial pass: read the draft as a competitor trying to
beat it and as an evaluator trying to score it down. Report the three weakest points and
what a competitor would say against each. Then flag that a human red-team read is still
required.

## Gate 8 - Locked & backed up

Final PDF generated. Source and submitted versions archived to the client SharePoint
folder.

---

## Output format for stage 4

```
QUALITY BAR REPORT - <Client> <Document Type> - <date>
PROFILE: <profile>   GATES N/A: <list, with reason>

VERDICT: READY TO SUBMIT / READY AFTER FIXES (n blocking) / NOT READY (n blocking)

Gate 1  Answers the ask          [PASS / FAIL]
        1a coverage    n/N requirements addressed
                       (questionnaire: n/N per sheet, listed)
                       Unaddressed: <requirement IDs, sheet-qualified>
        1b exclusions  n/N respected
                       Breached: <exclusion IDs, with the offending text>
        1c constraints n/N addressed
Gate 2  Facts verified           [PASS / FAIL]   n unsourced claims
        <each, with location>
Gate 3  Protective terms         [PASS / FAIL / N/A (profile)]   <missing clauses>
Gate 4  On brand                 [PASS / FAIL]
Gate 5  Reads human              [PASS / FAIL]   n AI tells, n em dashes
        <each, with location>
Gate 6  Format compliant         [PASS / FAIL]
        file type <observed vs required> · length <counted vs limit>
        channel · subject line · naming · deadline
Gate 7  Red-team                 [ADVISORY]      three weakest points
Gate 8  Locked & archived        [PASS / PENDING]

BLOCKING: <the items that must be fixed before this can be sent>
NEEDS INPUT: <the questions only a human can answer>
```

Be honest in this report. A review that passes everything is a review that was not run.

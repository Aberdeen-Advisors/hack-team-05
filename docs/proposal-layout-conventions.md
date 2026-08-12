# Proposal Layout Conventions

This is the house layout convention for generated pitch and proposal pages, taken from an existing Aberdeen client deck shared in Slack on 2026-08-12. The source slides stay in Slack because they contain client-identifying material.

## The three patterns

### 1. Benefits / value slide

Observed on a slide arguing that optimizing a client's core platform increases value for three stakeholder groups.

- **Action title** is a full sentence stating the conclusion, spanning two lines — not a topic label. Example shape: "Optimizing X increases the value of your system for A, B, and C."
- **Body** is three equal columns. Each column has a coloured header bar with a small circular icon and a short group name (the audience or benefit category).
- **Bullets**: inside each column, 3–4 bullets. Every bullet leads with a bold two- or three-word label, then a colon, then exactly one plain sentence of explanation. No bullet runs longer than one sentence.
- **Bottom banner**: a full-width coloured banner across the bottom carries a single "so what" sentence in white — the takeaway a reader keeps if they read nothing else.

### 2. Tools / accelerators slide

- **Action title** is again a full sentence, saying what the tools do for the client rather than naming them.
- **Body** is a 2-column by 3-row grid of boxes. A vertical label spine runs down the left of each box with a category word, and a matching spine on the right edge names the asset or workstream.
- **Each box** pairs a bold asset name and one bullet of what it does with a thumbnail screenshot of the actual artifact — a dashboard, a status report, a framework grid. The graphic is evidence that the thing exists, never decoration.

### 3. Firm credentials slide

- **Action title** states what the firm is in one sentence.
- **Two panels side by side**: left is the team — a small growth chart of headcount by year plus three or four one-line proof points; right is a services matrix, with service lines as rows and industries as vertical column labels.
- **Bottom strip**: a full-width strip along the bottom holds a wall of client logos under a "representative clients" label.

## What this means for the generator

- Every generated section leads with a full-sentence claim, not a heading like "Approach" or "Benefits".
- Bullets are bold-label-then-one-sentence. Enforce that shape rather than emitting paragraphs.
- Text and graphic sit side by side, and the graphic references a real artifact. Where the tool has no artifact to show, leave a labelled placeholder rather than inventing a visual.
- Each slide or section ends with a single takeaway line.
- Structure is 2–3 panels per section. Not one dense column.

## Out of scope for this repo

The source screenshots and the client logo wall are not committed here. This repo is public and the slides name real clients, so the convention is captured in prose and the visuals stay in Slack.

---

Convention contributed by CJ Johnson, 2026-08-12.

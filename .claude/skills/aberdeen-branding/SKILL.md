---
name: aberdeen-branding
description: Apply Aberdeen Advisors brand styling to any document — PowerPoint presentations (.pptx), Word documents (.docx), and Excel spreadsheets (.xlsx). Use this skill whenever the user mentions Aberdeen, Aberdeen Advisors, "our company," "our brand," "company template," "company colors," or asks for a deliverable they'd hand to a client (deck, slides, proposal, report, memo, financial model, workbook). Also trigger when the user says "make this look professional," "use our branding," "match our style," or references brand colors like Aberdeen Blue / Aberdeen Teal. Strict adherence to the official Aberdeen template is required — do not invent layouts, colors, or fonts. The full template lives in this skill's assets directory and is the authoritative source for all styling decisions.
---

# Aberdeen Advisors Branding

This skill enforces strict adherence to the Aberdeen Advisors brand identity across PowerPoint, Word, and Excel. The goal is consistency — every Aberdeen deliverable should feel like it came from the same hand.

## Core principle: the template is the source of truth

The official Aberdeen PowerPoint template is bundled with this skill at `assets/aberdeen_template.pptx`. It contains 16 slide layouts, every brand color, the official logo, and the typographic system. **Do not invent. Do not improvise. Match.**

When something seems missing from the template (a layout you wish existed, a color you'd like to add), the answer is to reuse what's there or simplify the content — never to add custom styling that doesn't appear in the source.

## Brand identity at a glance

Use these colors and fonts for any Aberdeen deliverable, regardless of file type:

**Primary brand colors:**
- Aberdeen Blue: `#09375F` (primary, dominant)
- Aberdeen Teal: `#44B0B1` (accent, highlights)
- Onyx: `#404040` (body text on light backgrounds)
- White: `#FFFFFF`

**Secondary brand colors** (use sparingly, for charts / data viz / categorical distinctions):
- Deep Sky Blue: `#5CC8FF`
- Jade: `#00A676`
- Jasper: `#DB504A`
- Gold: `#F7D002`

**Font:** Poppins for everything (headings and body). If Poppins is unavailable in a target environment, fall back to Calibri — never Arial, never Times New Roman.

**ADA-compliant color combinations** (use these):
- White or Aberdeen Teal text on Aberdeen Blue background
- Aberdeen Blue or Black text on Aberdeen Teal background
- Aberdeen Blue, Onyx, or Black text on white background

**Avoid these combinations** (low contrast, hard to read):
- White text on Aberdeen Teal
- Aberdeen Teal text on white

## Choosing a workflow

| User request involves... | Read this reference |
|--------------------------|---------------------|
| Slides, deck, presentation, .pptx | [references/pptx.md](references/pptx.md) |
| Word doc, report, memo, proposal, .docx | [references/docx.md](references/docx.md) |
| Spreadsheet, model, workbook, .xlsx | [references/xlsx.md](references/xlsx.md) |

For PowerPoint specifically, **always start from the template** at `assets/aberdeen_template.pptx`. For Word and Excel, apply the brand identity manually using the colors and fonts above — there's no separate template file for those formats yet, but the references walk you through how to produce something that feels consistent with the slide deck.

## Don't over-design

Aberdeen's brand is restrained and professional. The slide template demonstrates this — most slides are a teal accent line at the top, a clear title, and content. No decorative bars, no full-width colored stripes, no busy backgrounds outside of the title and divider slides.

When in doubt, look at the template's standard content slides (slides 14–20) — they show how much whitespace and restraint the brand expects. Replicate that energy in Word and Excel too.

## Final QA checklist

Before declaring any Aberdeen deliverable complete:

- All headings use Poppins (or fallback) and Aberdeen Blue
- Body text is Onyx or Aberdeen Blue, never pure black
- Aberdeen logo is visible on cover/title element (decks: cover slide; docs: header or cover; workbooks: cover sheet or header)
- No off-brand colors snuck in (no generic Microsoft blue, no random reds/greens unless from the secondary palette for charts)
- Spelling check passed — "Aberdeen" is one word, "Advisors" with an "o," not "Advisers"
- File saved to `/mnt/user-data/outputs/` and presented via `present_files`

# Aberdeen Word Document Workflow

There is no separate Word template file in the brand kit — the slide template is the design source. Your job is to translate Aberdeen's slide-deck identity (colors, fonts, restraint) into a polished Word document that feels like it came from the same firm.

Use the standard `docx` skill (`/mnt/skills/public/docx/SKILL.md`) for the mechanics of producing the file. The instructions below are the Aberdeen-specific styling layer.

## Document setup

- **Page size**: US Letter (8.5" × 11")
- **Margins**: 1" top/bottom, 1" left/right (standard, professional)
- **Font**: Poppins for everything. Fall back to Calibri if Poppins is unavailable in the environment.

## Typography hierarchy

| Element | Font | Size | Color | Weight |
|---------|------|------|-------|--------|
| Document title (cover) | Poppins | 32pt | Aberdeen Blue `#09375F` | Bold |
| Subtitle | Poppins | 18pt | Aberdeen Blue | Regular |
| Heading 1 (section) | Poppins | 20pt | Aberdeen Blue | Bold |
| Heading 2 | Poppins | 16pt | Aberdeen Blue | Bold |
| Heading 3 | Poppins | 13pt | Aberdeen Teal `#44B0B1` | Bold |
| Body | Poppins | 11pt | Onyx `#404040` | Regular |
| Caption / footer | Poppins | 9pt | Onyx | Regular |
| Hyperlink | Poppins | (inherits) | `#0072AD` | Underlined |

Body line spacing: 1.15. Paragraph spacing: 6pt before, 0pt after. Headings: 18pt before, 6pt after.

## Cover page (for any client-facing or formal deliverable)

Match the deck's Title_Dark cover slide energy:

1. Aberdeen logo at the bottom-left or top-left
2. Document title in Aberdeen Blue, 32pt bold, left-aligned, sitting roughly one third down the page
3. Subtitle (e.g., "Prepared for [Client]" or "Strategic Review") in Aberdeen Blue, 18pt, directly below the title
4. Date in Onyx, 12pt, below the subtitle with one blank line
5. Optional: a thin (1.5pt) Aberdeen Teal horizontal line beneath the title block — this is the one decorative element the brand uses consistently

For internal memos or short docs, skip the cover and start directly with the title at the top of page 1 (still 32pt Aberdeen Blue, still left-aligned).

## Headers and footers

- **Header**: Aberdeen logo at left (small, ~0.4" tall), document title in Onyx 9pt at right. Skip on the cover page.
- **Footer**: Page number ("Page X of Y") centered in Onyx 9pt, OR a thin Aberdeen Teal horizontal rule (0.75pt) above a left-aligned "Aberdeen Advisors" wordmark. Pick one and use it consistently throughout the doc.

## Tables

The template's table style (slide 20) is the reference. Reproduce it in Word:

- **Header row**: Aberdeen Blue background (`#09375F`), white text, Poppins bold 11pt, centered or left-aligned
- **Label column** (if used): Aberdeen Teal background (`#44B0B1`), white or Aberdeen Blue text, bold
- **Body rows**: alternate white and very light teal tint (`#E8F4F4` — derived from teal at ~10% opacity). Onyx text.
- **Borders**: thin (0.5pt) Aberdeen Teal between rows, no vertical borders, or minimal vertical borders in light gray
- **Cell padding**: 0.08" all sides (a bit of breathing room)

## Callouts and pull quotes

The deck uses a **kicker** — a teal-tinted box that highlights a key takeaway. Reproduce this in Word for important callouts:

- Background: light teal tint (`#E8F4F4`)
- Border: 1pt Aberdeen Teal on the left edge only (a "left-rule" style)
- Text: Aberdeen Blue, italic, bold, 12pt, centered
- Padding: 12pt all sides
- Use sparingly — once or twice per document, max

## Lists

- Bullets: small filled dot (•) in Aberdeen Teal, body text in Onyx
- Numbered: Aberdeen Blue numerals, body text in Onyx
- Indent: 0.25" for nested levels

## Images and figures

- Caption format: "**Figure 1.** Description of what's shown." — bold "Figure N" in Aberdeen Blue, the description in Onyx, 9pt, italic, centered below the image
- Figures should have at least 12pt of space above and below

## Don'ts

- Don't use Times New Roman — this is the most common default and breaks the brand instantly
- Don't use generic Office blue — always use the exact Aberdeen Blue hex `#09375F`
- Don't add decorative borders, page borders, or watermarks
- Don't use color highlighting (yellow, green) for emphasis — use bold, italic, or the Aberdeen Teal kicker box instead
- Don't use Smart Art with default Office styling — if you need a diagram, build it manually with Aberdeen colors

## Final check

```bash
# Open the file and verify
unzip -p /mnt/user-data/outputs/output.docx word/document.xml | head -50
```

Visually confirm:
- Cover or title block uses Aberdeen Blue, 32pt
- Headings descend in size correctly (20 → 16 → 13)
- Body is Onyx, not pure black
- Aberdeen logo present somewhere prominent
- No Times New Roman, no generic blues

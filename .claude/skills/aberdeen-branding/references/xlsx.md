# Aberdeen Excel Workbook Workflow

There is no separate Excel template in the brand kit. Apply Aberdeen's brand identity to workbooks manually using the colors, fonts, and patterns below. The slide template is the design source of truth.

Use the standard `xlsx` skill (`/mnt/skills/public/xlsx/SKILL.md`) for the mechanics. The instructions below are the Aberdeen-specific styling layer.

## Workbook structure

For any client-facing model or deliverable, structure the workbook with:

1. **Cover sheet** (always first, named `Cover` or `Read Me`)
2. **Summary / Output sheet** (KPIs, key results — what the reader sees first)
3. **Calculation / Working sheets** (the model itself)
4. **Inputs / Assumptions sheet** (clearly separated from calculations)
5. **Reference sheets** (lookups, raw data) — usually last

Tab colors: Use **Aberdeen Blue** for output / summary tabs, **Aberdeen Teal** for input tabs, leave calculation tabs uncolored. This gives the reader an instant visual hierarchy.

## Cover sheet

A minimal cover that sets the tone:

- Cell A1 onward: Aberdeen logo image (insert as a picture, ~1.5" tall)
- A row of light teal tint (`#E8F4F4`) as a horizontal divider underneath the logo
- Title in **Aberdeen Blue**, Poppins 24pt bold, around row 4–5
- Subtitle in Aberdeen Blue, Poppins 14pt regular, just below
- Date in Onyx, 11pt, below the subtitle
- A short description (1–3 sentences in Onyx 11pt) explaining what the workbook does
- A simple table of contents listing each sheet and what it contains

Hide gridlines on the cover sheet (`View → Gridlines off`) for a cleaner look.

## Cell styles

| Element | Background | Font | Color | Weight | Borders |
|---------|-----------|------|-------|--------|---------|
| Section header (e.g., "Revenue Build") | Aberdeen Blue `#09375F` | Poppins 12pt | White | Bold | None |
| Sub-header / column label | Aberdeen Teal `#44B0B1` | Poppins 11pt | White | Bold | Thin white bottom |
| Input cell | Light teal `#E8F4F4` | Poppins 11pt | Aberdeen Blue | Regular | Thin teal `#44B0B1` |
| Calculation cell | White | Poppins 11pt | Onyx `#404040` | Regular | None or light gray |
| Output / KPI cell | White | Poppins 12pt | Aberdeen Blue | Bold | 1pt Aberdeen Teal box |
| Total / sum row | Light gray `#F2F2F2` | Poppins 11pt | Aberdeen Blue | Bold | Thin top + double bottom |
| Footnote | None | Poppins 9pt | Onyx | Italic | None |

**Convention**: input cells are tinted teal, formula/calculation cells are white. This is standard financial-modeling practice and lets reviewers immediately see where the assumptions live.

## Number formats

- Currency (USD): `$#,##0;[Red]($#,##0)` for whole dollars, or `$#,##0.00;[Red]($#,##0.00)` for cents. Negatives in parentheses, red.
- Percentages: `0.0%` (one decimal) by default; `0.00%` for rates that need precision (interest, growth)
- Multiples: `0.0"x"` (e.g., `5.2x`)
- Counts / units: `#,##0`
- Dates: `mmm-yy` for monthly, `mmm-d-yyyy` for specific dates
- Years (in headers): `yyyy"E"` for estimated, `yyyy"A"` for actual, `yyyy"F"` for forecast

## Charts

When inserting charts in a workbook, match the deck's chart styling:

- Series 1: **Aberdeen Blue** `#09375F`
- Series 2: **Aberdeen Teal** `#44B0B1`
- Series 3+: Onyx, Deep Sky Blue, Jade, Jasper, Gold (in that order)
- Title: Aberdeen Blue, Poppins 12pt bold, left-aligned
- Axis labels: Onyx, Poppins 9pt
- No 3D effects, no shadows, no gradients
- Gridlines: light gray `#E5E5E5` or removed entirely
- Legend: bottom-aligned, Onyx Poppins 9pt

## Conditional formatting

When using conditional formatting for variance / heatmap / RAG status:

- **Good / above target**: Jade `#00A676` (green from secondary palette)
- **Neutral / on target**: Aberdeen Teal `#44B0B1`
- **Bad / below target**: Jasper `#DB504A` (red from secondary palette)
- **Warning / monitor**: Gold `#F7D002`

Avoid Excel's default red-yellow-green palette — those greens and reds clash with the Aberdeen secondary colors.

## Print setup

For any workbook a client will print or PDF:

- Page orientation: Landscape (financial models almost always benefit from this)
- Margins: Narrow (0.75" top/bottom, 0.25" left/right)
- Header (in print setup): Aberdeen logo on left, sheet name centered, page number on right
- Footer: "Confidential — Aberdeen Advisors" centered, in 9pt
- Scaling: Fit all columns on one page (height: auto)

## Don'ts

- Don't use the default Office blues anywhere — every blue should be Aberdeen Blue `#09375F`
- Don't use Calibri 11 default styling untouched — at minimum, switch the font to Poppins and use Aberdeen Blue for headers
- Don't leave gridlines on the cover sheet
- Don't merge cells unnecessarily — use cell formatting and centering instead
- Don't use rainbow chart palettes — stick to the Aberdeen primary + secondary colors
- Don't bold or color random cells for emphasis — define cell styles (input/calc/output) and use them consistently

## Final check

After saving, open the file and verify:
- Cover sheet exists, with logo and clear title in Aberdeen Blue
- Tabs are color-coded (blue/teal/none) to signal output/input/calc
- Inputs are visibly tinted teal; calculations are not
- All headers use Aberdeen Blue with white text
- No leftover default Excel formatting (bright blue links, default chart colors, etc.)

```bash
# Quick visual: render the workbook to images for QA
python /mnt/skills/public/pptx/scripts/office/soffice.py --headless --convert-to pdf /mnt/user-data/outputs/output.xlsx
```

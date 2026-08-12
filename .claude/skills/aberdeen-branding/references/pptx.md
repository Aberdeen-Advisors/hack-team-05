# Aberdeen PowerPoint Workflow

The Aberdeen template at `assets/aberdeen_template.pptx` (relative to this skill) is your starting point for **every** Aberdeen presentation. Do not generate decks from scratch — the template's master, layouts, logo, and color theme are baked in and would be impossible to perfectly reproduce.

## The 16 layouts (memorize these)

The template ships with these named layouts. Pick the one that matches each piece of content — don't use the same one twice in a row unless you have a good reason.

| Layout | Use it for |
|--------|-----------|
| `Title_Dark` | Deck cover (Aberdeen Blue background with diagonal teal motif). Used on slide 1. |
| `Title_Light` | Alternative cover with white background and teal motif. |
| `Title_Image` | Cover with a full photographic image and Aberdeen Blue overlay. Use when you have a strong relevant photo (boardroom, cityscape, etc.). |
| `Divider_Dark_Plain` | Section break with dark blue background, no number. |
| `Divider_Dark_Num` | Section break with dark blue background, big section number. |
| `Divider_Light_Plain` | Section break, lighter background. |
| `Divider_Light_Num` | Section break, lighter background, with section number. |
| `1/3_Dark` | Content slide where the left third is dark blue (good for a punchy stat or quote on the dark side, content on the right). |
| `1/3_Teal` | Same idea but the left third is teal. |
| `Large Text Box` | A standard content slide with one big text region — for paragraphs, bullets, or a single visual. |
| `Double Text` | Two side-by-side text regions — comparisons, before/after, two related concepts. |
| `Text_Chart` | Text on one side, chart on the other. Default for any data slide. |
| `Standard_Chart` | Mostly chart, with a title and brief caption. |
| `Title_Blank` | Just a title bar at the top, blank canvas below. Use when you're inserting a complex custom diagram or table. |
| `Title_Subtitle_Blank` | Title + subtitle, then blank below. |
| `Blank` | Truly blank. Use as a last resort. |

## Standard slide elements (slides 20–24 of the template)

The template's slides 20 through 24 are reference exhibits showing pre-built Aberdeen-styled elements you can copy and reuse:

- **Slide 20 — Standard Elements**: pre-formatted text boxes (Aberdeen Blue header style, Aberdeen Teal accent style, white-with-border style), the standard table style (blue header row, teal label column, alternating teal-tint rows), and the **kicker** — a teal-tinted box used to highlight a key takeaway at the top or bottom of a slide.
- **Slide 21 — Sample 6 week plan**: the Aberdeen-style timeline / workplan grid. Use this as a template for any phased plan.
- **Slide 22 — Sample Workstream Planning**: numbered activity table + success factors row with circled numbers. Use for workstream/project plans.
- **Slide 23 — Sample Org Chart**: standard hierarchy boxes (Aberdeen Blue for top, Aberdeen Teal accent for sub-levels).
- **Slide 24 — Iconography**: the Microsoft icon set Aberdeen uses. When a slide needs an icon, pick from these categories: Sentiment, Wayfinding, Comms, KPI/Measure, Tech, Security, Road Signs, Ideas, People & Org, Time & Cal, Search/Filter, Growth, Process & Ops, Lists & Docs, Reference, Commerce, Misc, Vibes.

When you need a workplan, org chart, success-factor block, or KPI table, **start by duplicating slide 21, 22, or 23** and editing the contents. Do not re-create those layouts from scratch.

## The workflow

This skill defers the heavy lifting to the existing `pptx` skill in `/mnt/skills/public/pptx/`. Read its `editing.md` if you haven't already — the steps below are the Aberdeen-specific overlay on top of that workflow.

### Step 1: Inspect the template (only once per session)

```bash
# Copy the template to your working area
cp /mnt/skills/public/aberdeen-branding/assets/aberdeen_template.pptx /home/claude/template.pptx

# (If running from the skill itself) the path may be the location you read SKILL.md from
# The thumbnail step is optional — you've already seen the layouts in this reference

extract-text /home/claude/template.pptx | head -100
```

### Step 2: Plan slide mapping

For each piece of content the user wants, pick a layout from the table above. Write down the mapping before you start editing. Example:

```
Slide 1: cover → Title_Dark (slide 1 in template)
Slide 2: section divider → Divider_Dark_Num (slide 8 in template)
Slide 3: opportunity overview → Large Text Box (slide 14)
Slide 4: comparison of options → Double Text (slide 16 or 17)
Slide 5: revenue projection chart → Text_Chart (slide 18)
Slide 6: workplan → duplicate slide 21
Slide 7: closing / thank you → Title_Light (slide 5)
```

Use the template's actual slides (1–24) as your source — they're already populated with Aberdeen styling. Duplicate the ones you need, delete the rest.

### Step 3: Unpack, manipulate, edit, pack

Follow the standard pptx-skill workflow:

```bash
python /mnt/skills/public/pptx/scripts/office/unpack.py /home/claude/template.pptx /home/claude/unpacked/
```

Then in `unpacked/`:
1. Use `add_slide.py` to duplicate the slides you want
2. Remove unwanted slides from `<p:sldIdLst>` in `ppt/presentation.xml`
3. Edit text in each `slide{N}.xml` — replace placeholder content with the user's content
4. Run `clean.py` to remove orphans
5. Pack: `python /mnt/skills/public/pptx/scripts/office/pack.py /home/claude/unpacked/ /mnt/user-data/outputs/output.pptx --original /home/claude/template.pptx`

### Step 4: QA

Run the standard pptx visual QA (convert to images, inspect). Specifically check for:

- **Leftover placeholder text**: search for "Sample," "Name," "Position / Title," "Activity," "Description," "Heading," "Label," "Content," "Highlights," "Success Factor," "Phase 1: Name," "Week 1," etc. — these are template placeholders that must be replaced or the slide deleted.
- **Logo present** on the cover slide.
- **Page numbers** on content slides (the template auto-adds these via the layout — just don't delete them).
- **Aberdeen Blue is the dominant color**, with Aberdeen Teal as accent. If a slide has more teal than blue, something is off.

```bash
extract-text /mnt/user-data/outputs/output.pptx | grep -iE "\b(name|position|activity|description|heading|label|content|highlights|success factor|phase \d|week \d|sample)\b"
```

If grep returns hits in non-template-reference slides, fix them.

## Don'ts (from the brand guide on slide 2 of the template)

- Don't use white text on an Aberdeen Teal background (low contrast)
- Don't use Aberdeen Teal text on a white background (low contrast)
- Don't substitute generic Office blues for Aberdeen Blue
- Don't add decorative full-width colored bars or stripes — the template's diagonal motif on title/divider slides is the only "decorative" element the brand uses
- Don't change the font from Poppins
- Don't remove the Aberdeen logo from the cover slide

## Charts

When inserting charts (the `Text_Chart` and `Standard_Chart` layouts):

- Primary series color: **Aberdeen Blue** `#09375F`
- Secondary series color: **Aberdeen Teal** `#44B0B1`
- Additional series (in this order): Onyx `#404040`, Deep Sky Blue `#5CC8FF`, Jade `#00A676`, Jasper `#DB504A`, Gold `#F7D002`
- Axis labels: Onyx, 10–12pt Poppins
- Gridlines: light gray (`#E5E5E5`) or omit entirely
- Never use the default Office chart palette

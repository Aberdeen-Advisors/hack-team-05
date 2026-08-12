#!/usr/bin/env python3
"""Build the 4-slide hackathon submission deck for Aberdeen hack team 05.

Built on the official Aberdeen Advisors PowerPoint template
(.claude/skills/aberdeen-branding/assets/aberdeen_template.pptx), using the
template's own named layouts. Brand rules enforced by the aberdeen-branding
skill:

  Aberdeen Blue #09375F (dominant)   Aberdeen Teal #44B0B1 (accent only)
  Onyx #404040 (body text, never pure black)   White #FFFFFF
  Poppins everywhere, Calibri as the only permitted fallback.
  ADA pairs only: white/teal on blue, blue/black on teal, blue/onyx on white.
  Never: white text on teal, teal text on white, generic Office blue,
  decorative full-width bars, removing the cover logo.

Layout mapping (names are the template's own):
  Slide 1  cover                -> Title_Dark   (carries the Aberdeen logo)
  Slide 2  problem + solution   -> Double Text
  Slide 3  demo                 -> Text_Chart   (visual region = screenshot)
  Slide 4  impact / path        -> Double Text
"""

import copy
import math
import os
import shutil

from lxml import etree
from pptx import Presentation
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_SHAPE
from pptx.enum.shapes import PP_PLACEHOLDER
from pptx.enum.text import MSO_ANCHOR, PP_ALIGN
from pptx.oxml.ns import qn
from pptx.util import Inches, Pt

HERE = os.path.dirname(os.path.abspath(__file__))
TEMPLATE = os.path.join(
    HERE, os.pardir, ".claude", "skills", "aberdeen-branding", "assets",
    "aberdeen_template.pptx")
OUT = os.path.join(HERE, "hack-team-05-pursuit-copilot-deck.pptx")

# ------------------------------------------------------------------ brand ----
BLUE = RGBColor(0x09, 0x37, 0x5F)   # Aberdeen Blue  (dominant)
TEAL = RGBColor(0x44, 0xB0, 0xB1)   # Aberdeen Teal  (accent only)
ONYX = RGBColor(0x40, 0x40, 0x40)   # body text
WHITE = RGBColor(0xFF, 0xFF, 0xFF)
FONT = "Poppins"                     # Calibri is the only allowed fallback

BODY = 12          # hard floor: no body text below 12pt
HDR = 12.5         # section label size
CHAR_W = 0.525     # Poppins average glyph width as a fraction of point size

checks = []        # (label, width_in, height_in, paras) for the overflow pass


# ------------------------------------------------------------- xml helpers ---
def _rpr(run):
    return run.font._rPr


def style(run, size=BODY, bold=False, italic=False, color=ONYX, spc=None):
    f = run.font
    f.name = FONT
    f.size = Pt(size)
    f.bold = bold
    f.italic = italic
    f.color.rgb = color
    if spc:
        _rpr(run).set("spc", str(int(spc * 100)))


def no_bullet(para):
    pPr = para._pPr if para._pPr is not None else para._p.get_or_add_pPr()
    for tag in ("a:buChar", "a:buAutoNum", "a:buNone"):
        for el in pPr.findall(qn(tag)):
            pPr.remove(el)
    pPr.append(pPr.makeelement(qn("a:buNone"), {}))
    pPr.set("marL", "0")
    pPr.set("indent", "0")


def bullet(para, colour=BLUE):
    """Template bullet (Arial dot), coloured Aberdeen Blue."""
    pPr = para._pPr if para._pPr is not None else para._p.get_or_add_pPr()
    for tag in ("a:buNone",):
        for el in pPr.findall(qn(tag)):
            pPr.remove(el)
    pPr.set("marL", "150000")
    pPr.set("indent", "-150000")
    clr = pPr.makeelement(qn("a:buClr"), {})
    srgb = clr.makeelement(qn("a:srgbClr"), {"val": "%02X%02X%02X" % tuple(colour)})
    clr.append(srgb)
    fnt = pPr.makeelement(qn("a:buFont"), {"typeface": "Arial"})
    ch = pPr.makeelement(qn("a:buChar"), {"char": "•"})
    for el in (clr, fnt, ch):
        pPr.append(el)


def theme_tint_fill(shape, scheme="tx2", lum_mod=20000, lum_off=80000):
    """Fill with a theme colour tint exactly as the template's kicker does."""
    spPr = shape._element.spPr
    for tag in ("a:solidFill", "a:noFill", "a:gradFill", "a:blipFill", "a:pattFill"):
        for el in spPr.findall(qn(tag)):
            spPr.remove(el)
    fill = spPr.makeelement(qn("a:solidFill"), {})
    clr = fill.makeelement(qn("a:schemeClr"), {"val": scheme})
    clr.append(clr.makeelement(qn("a:lumMod"), {"val": str(lum_mod)}))
    clr.append(clr.makeelement(qn("a:lumOff"), {"val": str(lum_off)}))
    fill.append(clr)
    ln = spPr.find(qn("a:ln"))
    spPr.insert(list(spPr).index(ln) if ln is not None else len(spPr), fill)


def dashed(shape):
    ln = shape.line._get_or_add_ln()
    ln.append(ln.makeelement(qn("a:prstDash"), {"val": "dash"}))


def drop_shape(shape):
    shape._element.getparent().remove(shape._element)


def clear_slides(prs):
    """Delete every template slide, leaving masters/layouts (and the logo) intact."""
    ids = prs.slides._sldIdLst
    for sldId in list(ids):
        prs.part.drop_rel(sldId.rId)
        ids.remove(sldId)


def layout(prs, name):
    for l in prs.slide_masters[0].slide_layouts:
        if l.name == name:
            return l
    raise KeyError(name)


def place(shape, x, y, w, h):
    """Set all four geometry values.

    python-pptx materialises an <a:xfrm> the moment one of them is assigned, so
    setting only top/height would leave left/width at zero instead of inheriting
    from the layout.
    """
    shape.left, shape.top, shape.width, shape.height = (
        Inches(x), Inches(y), Inches(w), Inches(h))


def add_page_number(slide):
    """Clone the layout's slide-number placeholder (the template expects it)."""
    for shape in slide.slide_layout.placeholders:
        if shape.placeholder_format.type == PP_PLACEHOLDER.SLIDE_NUMBER:
            slide.shapes._spTree.append(copy.deepcopy(shape._element))
            return


def ph(slide, idx):
    for shape in slide.placeholders:
        if shape.placeholder_format.idx == idx:
            return shape
    raise KeyError(idx)


# ------------------------------------------------------------ text filling ---
def fill(frame, paras, w_in, h_in, label, anchor=MSO_ANCHOR.TOP, autoshape=False):
    """Write paragraphs into a text frame and register it for overflow checking."""
    frame.word_wrap = True
    frame.vertical_anchor = anchor
    if autoshape:
        frame.margin_left = Inches(0.12)
        frame.margin_right = Inches(0.12)
        frame.margin_top = Inches(0.07)
        frame.margin_bottom = Inches(0.07)
    for i, spec in enumerate(paras):
        para = frame.paragraphs[0] if i == 0 else frame.add_paragraph()
        para.alignment = spec.get("align", PP_ALIGN.LEFT)
        if spec.get("bullet"):
            bullet(para)
        else:
            no_bullet(para)
        para.line_spacing = spec.get("line", 1.0)
        para.space_before = Pt(spec.get("before", 0))
        para.space_after = Pt(spec.get("after", 4))
        run = para.add_run()
        run.text = spec["text"]
        style(run, size=spec.get("size", BODY), bold=spec.get("bold", False),
              italic=spec.get("italic", False), color=spec.get("color", ONYX),
              spc=spec.get("spc"))
    checks.append((label, w_in, h_in, paras, autoshape))


def textbox(slide, x, y, w, h, paras, label, anchor=MSO_ANCHOR.TOP):
    box = slide.shapes.add_textbox(Inches(x), Inches(y), Inches(w), Inches(h))
    tf = box.text_frame
    tf.margin_left = 0
    tf.margin_right = 0
    tf.margin_top = 0
    tf.margin_bottom = 0
    fill(tf, paras, w, h, label, anchor=anchor)
    return box


def kicker(slide, x, y, w, h, paras, label):
    """The template's kicker: teal-tint fill, teal rule, Aberdeen Blue text."""
    sh = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(x), Inches(y),
                                Inches(w), Inches(h))
    sh.shadow.inherit = False
    theme_tint_fill(sh)
    sh.line.color.rgb = TEAL
    sh.line.width = Pt(1.5)
    fill(sh.text_frame, paras, w - 0.24, h - 0.14, label,
         anchor=MSO_ANCHOR.MIDDLE, autoshape=True)
    return sh


# =============================================================================
shutil.copyfile(TEMPLATE, OUT)
prs = Presentation(OUT)
clear_slides(prs)
assert len(prs.slides) == 0

SW = prs.slide_width / 914400.0     # 10.0in
SH = prs.slide_height / 914400.0    # 5.625in  (16:9)

# ============================== SLIDE 1 — COVER (Title_Dark) =================
s1 = prs.slides.add_slide(layout(prs, "Title_Dark"))

t = ph(s1, 0)                                   # CENTER_TITLE, 36pt white
place(t, 0.5, 1.41, 6.5, 0.66)
fill(t.text_frame, [{"text": "RFP Pursuit Copilot", "size": 36, "color": WHITE,
                     "after": 0}], 6.5, 0.66, "s1 title")

sub = ph(s1, 1)                                 # SUBTITLE, 15pt bold white
place(sub, 0.5, 2.10, 6.5, 0.72)
fill(sub.text_frame,
     [{"text": "Turns a 30–80 page RFP into win themes, a pursuit strategy "
               "and a first-draft proposal.",
       "size": 15, "bold": True, "color": WHITE, "line": 1.05, "after": 0}],
     6.5, 0.72, "s1 one-liner")

date = ph(s1, 11)                               # small body line, 14pt white
place(date, 0.5, 2.92, 4.2, 0.28)
fill(date.text_frame,
     [{"text": "Aberdeen Hackathon  ·  Team 05", "size": 12.5,
       "color": WHITE, "after": 0}], 4.2, 0.28, "s1 eyebrow")

# Teal on Aberdeen Blue is an ADA-approved pair; keeps the problem up front.
textbox(s1, 0.5, 3.30, 4.3, 0.62,
        [{"text": "Seven days to respond. And every bidder sounds the same.",
          "size": 14, "bold": True, "color": TEAL, "line": 1.05, "after": 0}],
        "s1 problem line")

# Logo group sits at 0.51 / 4.10 in the Title_Dark layout — left in place.
textbox(s1, 0.5, 4.72, 3.9, 0.5,
        [{"text": "Carrie Stout  ·  CJ Johnson  ·  Jordan Cook  ·  "
                  "Preetish Rath", "size": 12, "color": WHITE, "line": 1.05,
          "after": 0}], "s1 team")

# ===================== SLIDE 2 — PROBLEM + SOLUTION (Double Text) ============
s2 = prs.slides.add_slide(layout(prs, "Double Text"))
fill(ph(s2, 0).text_frame,
     [{"text": "Upload the RFP. Get a point of view, not a template.",
       "size": 20, "color": BLUE, "after": 0}], 9.42, 0.42, "s2 title")
fill(ph(s2, 13).text_frame,
     [{"text": "Who it helps: the BD lead, partner and SME sharing hours "
               "0–48 of a seven-day window.",
       "size": 12, "color": ONYX, "after": 0}], 9.42, 0.27, "s2 subtitle")

left = ph(s2, 1)
place(left, 0.29, 1.28, 4.53, 1.60)
fill(left.text_frame,
     [{"text": "WHY IT'S HARD", "size": HDR, "bold": True, "color": BLUE,
       "spc": 0.8, "after": 6},
      {"text": "The clock: hours 0–48 go to structure and boilerplate, "
               "not the client.", "bullet": True, "after": 3},
      {"text": "The sameness: rivals send similar credentials and the same "
               "generic approach.", "bullet": True, "after": 3},
      {"text": "The scoring: clients grade demonstrated understanding above "
               "capability lists.", "bullet": True, "after": 0}],
     4.53, 1.60, "s2 problem")

kicker(s2, 0.29, 2.92, 4.53, 1.50,
       [{"text": "“Wayfarer Market Co. puts 30% of its score on "
                 "Understanding of Brand & Crew Culture — and rejects the "
                 "cut-costs, loyalty-program, more-ads playbook.”",
         "italic": True, "color": BLUE, "line": 1.05, "after": 5},
        {"text": "Read: the generic proposal loses on the criteria the client "
                 "wrote down.", "color": BLUE, "bold": True, "line": 1.05,
         "after": 0}], "s2 rubric quote")

right = ph(s2, 14)
place(right, 5.18, 1.28, 4.53, 3.14)
fill(right.text_frame,
     [{"text": "WHAT IT DOES", "size": HDR, "bold": True, "color": BLUE,
       "spc": 0.8, "after": 6},
      {"text": "Ingest: the RFP, our credentials, past proposals, case "
               "studies.", "bullet": True, "after": 3},
      {"text": "Analyze: requirements and scoring criteria.",
       "bullet": True, "after": 3},
      {"text": "Draft: win themes, approach, staffing, copy.",
       "bullet": True, "after": 3},
      {"text": "Score: rubric score plus gaps, before send.",
       "bullet": True, "after": 4},
      {"text": "WHAT IT HANDS YOU", "size": HDR, "bold": True, "color": BLUE,
       "spc": 0.8, "before": 4, "after": 6},
      {"text": "Three win themes in the client's language, with Aberdeen "
               "experience ranked by relevance.", "bullet": True, "after": 3},
      {"text": "First-draft copy built to the client's response items, with a "
               "Response Action per requirement.", "bullet": True, "after": 3},
      {"text": "“Why Aberdeen” from our Culture Charter, every claim citing "
               "its source.", "bullet": True, "after": 0}],
     4.53, 3.14, "s2 solution")

kicker(s2, 0.29, 4.48, 9.42, 0.68,
       [{"text": "The part nobody else built: it grades itself against the "
                 "client's own weighted rubric before you send — we have "
                 "been the buy-side judge for years, so we hold the scoring "
                 "sheets.",
         "bold": True, "color": BLUE, "line": 1.05, "after": 0}],
       "s2 differentiator")

add_page_number(s2)

# ============================ SLIDE 3 — DEMO (Text_Chart) ====================
s3 = prs.slides.add_slide(layout(prs, "Text_Chart"))
fill(ph(s3, 0).text_frame,
     [{"text": "Watch a generic proposal lose on the client's criteria.",
       "size": 20, "color": BLUE, "after": 0}], 9.42, 0.42, "s3 title")
fill(ph(s3, 13).text_frame,
     [{"text": "Demo · Wayfarer Market Co. — specialty grocer, ~500 "
               "stores, ~50,000 crew.", "size": 12, "color": ONYX, "after": 0}],
     9.42, 0.27, "s3 subtitle")

body = ph(s3, 1)
place(body, 0.29, 1.28, 4.53, 3.00)
fill(body.text_frame,
     [{"text": "THE WALKTHROUGH", "size": HDR, "bold": True, "color": BLUE,
       "spc": 0.8, "after": 6},
      {"text": "The ask: grow revenue without eroding crew culture.",
       "bullet": True, "after": 3},
      {"text": "Copilot parses scope, deliverables D1–D5, requirements "
               "5.1–5.7, criteria and page limit.", "bullet": True,
       "after": 3},
      {"text": "It pins the non-negotiable up front: nothing that erodes crew "
               "culture.", "bullet": True, "after": 3},
      {"text": "Win themes come back in Wayfarer's language — crew first, "
               "growth second.", "bullet": True, "after": 3},
      {"text": "The draft assembles against Exhibit B, the client's ten "
               "required response items.", "bullet": True, "after": 3},
      {"text": "Predicted score names the gap: the generic playbook fails the "
               "30% culture criterion.", "bullet": True, "after": 0}],
     4.53, 3.00, "s3 steps")

kicker(s3, 0.29, 4.36, 4.53, 0.80,
       [{"text": "What the judges see: a proposal that argues the client's own "
                 "priorities back to them — and a number saying how it "
                 "would be scored.",
         "color": BLUE, "bold": True, "line": 1.05, "after": 0}],
       "s3 takeaway")

# The chart region of Text_Chart becomes the screenshot placeholder.
drop_shape(ph(s3, 15))
PX, PY, PW, PH = 5.18, 1.28, 4.53, 3.42
shot = s3.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(PX), Inches(PY),
                           Inches(PW), Inches(PH))
shot.shadow.inherit = False
shot.fill.solid()
shot.fill.fore_color.rgb = WHITE
shot.line.color.rgb = BLUE
shot.line.width = Pt(1.25)
dashed(shot)
fill(shot.text_frame,
     [{"text": "[ Screenshot: paste UI capture here ]", "size": 13,
       "bold": True, "color": BLUE, "align": PP_ALIGN.CENTER, "after": 6},
      {"text": "Placeholder — drop in the interface capture before "
               "submission. Build in progress at the time of writing.",
       "size": 12, "color": ONYX, "align": PP_ALIGN.CENTER, "line": 1.05,
       "after": 0}],
     PW - 0.8, PH - 0.3, "s3 screenshot placeholder",
     anchor=MSO_ANCHOR.MIDDLE, autoshape=True)
textbox(s3, PX, PY + PH + 0.12, PW, 0.3,
        [{"text": "Walkthrough delivered live in the demo slot.", "size": 12,
          "color": ONYX, "align": PP_ALIGN.CENTER, "after": 0}],
        "s3 screenshot caption")

add_page_number(s3)

# ==================== SLIDE 4 — IMPACT / PATH (Double Text) ==================
s4 = prs.slides.add_slide(layout(prs, "Double Text"))
fill(ph(s4, 0).text_frame,
     [{"text": "Faster is table stakes. We play for the 45% that decides.",
       "size": 20, "color": BLUE, "after": 0}], 9.42, 0.42, "s4 title")
fill(ph(s4, 13).text_frame,
     [{"text": "Impact and path to market.", "size": 12, "color": ONYX,
       "after": 0}], 9.42, 0.27, "s4 subtitle")

l4 = ph(s4, 1)
place(l4, 0.29, 1.28, 4.53, 3.00)
fill(l4.text_frame,
     [{"text": "BUSINESS VALUE", "size": HDR, "bold": True, "color": BLUE,
       "spc": 0.8, "after": 6},
      {"text": "More pursuits answered, at steadier quality.",
       "bullet": True, "after": 3},
      {"text": "Effort moves to demonstrated understanding — roughly 45% "
               "of a rubric, against ~15% for functionality.",
       "bullet": True, "after": 4},
      {"text": "PILOT PLAN", "size": HDR, "bold": True, "color": BLUE,
       "spc": 0.8, "before": 4, "after": 6},
      {"text": "Run in parallel on the next live pursuit, beside the human "
               "draft.", "bullet": True, "after": 3},
      {"text": "Curated library of credentials, proposals and case studies "
               "— the main dependency, empty today.", "bullet": True,
       "after": 3},
      {"text": "Partner review before anything ships. A rule, not a setting.",
       "bullet": True, "after": 0}],
     4.53, 3.00, "s4 value/plan")

r4 = ph(s4, 14)
place(r4, 5.18, 1.28, 4.53, 3.00)
fill(r4.text_frame,
     [{"text": "WHAT WE WILL MEASURE", "size": HDR, "bold": True, "color": BLUE,
       "spc": 0.8, "after": 6},
      {"text": "Draft-to-first-review time and rubric completeness rate.",
       "bullet": True, "after": 3},
      {"text": "Predicted versus actual evaluator score, and win rate where it "
               "was used.", "bullet": True, "after": 3},
      {"text": "Baselines set in the pilot. Nothing claimed yet.",
       "bullet": True, "after": 4},
      {"text": "RISKS, HONESTLY", "size": HDR, "bold": True, "color": BLUE,
       "spc": 0.8, "before": 4, "after": 6},
      {"text": "Invented credentials or client facts; one uniform voice across "
               "every pursuit.", "bullet": True, "after": 3},
      {"text": "Confidentiality of client RFP material.",
       "bullet": True, "after": 3},
      {"text": "Mitigation: partner sign-off on anything sent, and a cited "
               "source behind every claim.", "bullet": True, "after": 0}],
     4.53, 3.00, "s4 measure/risks")

kicker(s4, 0.29, 4.36, 9.42, 0.80,
       [{"text": "Aberdeen Labs fit: ingest-and-structure, score-against-a-"
                 "rubric and write-from-our-real-values lift straight into "
                 "pitch decks, QBRs and any pursuit artifact — and the "
                 "buy-side rubric library behind the scoring is an Aberdeen "
                 "asset no rival can copy.",
         "color": BLUE, "line": 1.05, "after": 0}], "s4 labs fit")

add_page_number(s4)

prs.save(OUT)
print("saved", OUT, os.path.getsize(OUT), "bytes")

# ------------------------------------------------------------ overflow pass --
print("\n--- overflow estimate (est_in / box_in) ---")
warn = 0
for label, w, h, paras, autoshape in checks:
    total = 0.0
    for spec in paras:
        size = spec.get("size", BODY)
        cw = CHAR_W * size * (1.05 if spec.get("bold") else 1.0)
        if spec.get("spc"):
            cw += spec["spc"]
        usable = w - (0.21 if spec.get("bullet") else 0.0)
        cpl = max(1, int((usable * 72) / cw))
        lines = max(1, math.ceil(len(spec["text"]) / cpl))
        total += lines * size * 1.2 * spec.get("line", 1.0)
        total += spec.get("after", 4) + spec.get("before", 0)
    est = total / 72.0
    flag = "  <== OVERFLOW" if est > h + 0.01 else ""
    warn += bool(flag)
    print("%5.2f / %5.2f  %s%s" % (est, h, label, flag))
print("overflow warnings:", warn)

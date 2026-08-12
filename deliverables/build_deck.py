#!/usr/bin/env python3
"""Build the 4-slide hackathon submission deck for Aberdeen hack team 05."""

import math
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.shapes import MSO_SHAPE
from pptx.oxml.ns import qn

NAVY = RGBColor(0x0F, 0x25, 0x40)
NAVY_DEEP = RGBColor(0x0B, 0x1C, 0x30)
SLATE = RGBColor(0x4A, 0x5A, 0x6E)
ACCENT = RGBColor(0xC0, 0x64, 0x2A)
ACCENT_SOFT = RGBColor(0xF7, 0xEE, 0xE7)
LIGHT = RGBColor(0xF1, 0xF4, 0xF7)
BORDER = RGBColor(0xD8, 0xDE, 0xE6)
WHITE = RGBColor(0xFF, 0xFF, 0xFF)
MUTED_WHITE = RGBColor(0xD9, 0xE1, 0xEA)

FONT = "Calibri"
QUOTE_FONT = "Georgia"

M_L = 0.62          # left margin (in)
CONTENT_W = 12.09   # usable width (in)

boxes_for_check = []


def add_text(slide, x, y, w, h, paras, anchor=MSO_ANCHOR.TOP, align=PP_ALIGN.LEFT,
             check=True, label=""):
    tb = slide.shapes.add_textbox(Inches(x), Inches(y), Inches(w), Inches(h))
    tf = tb.text_frame
    tf.word_wrap = True
    tf.vertical_anchor = anchor
    tf.margin_left = 0
    tf.margin_right = 0
    tf.margin_top = 0
    tf.margin_bottom = 0
    for i, p in enumerate(paras):
        para = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        para.alignment = p.get("align", align)
        if p.get("space_after") is not None:
            para.space_after = Pt(p["space_after"])
        if p.get("space_before") is not None:
            para.space_before = Pt(p["space_before"])
        if p.get("line"):
            para.line_spacing = p["line"]
        run = para.add_run()
        run.text = p["text"]
        f = run.font
        f.name = p.get("font", FONT)
        f.size = Pt(p["size"])
        f.bold = p.get("bold", False)
        f.italic = p.get("italic", False)
        f.color.rgb = p.get("color", NAVY)
        if p.get("spc"):
            run.font._rPr.set("spc", str(int(p["spc"] * 100)))
    if check:
        boxes_for_check.append((label or paras[0]["text"][:28], w, h, paras))
    return tb


def add_rect(slide, x, y, w, h, fill=None, line=None, line_w=1.0,
             shape=MSO_SHAPE.RECTANGLE, dash=False):
    sh = slide.shapes.add_shape(shape, Inches(x), Inches(y), Inches(w), Inches(h))
    sh.shadow.inherit = False
    if fill is None:
        sh.fill.background()
    else:
        sh.fill.solid()
        sh.fill.fore_color.rgb = fill
    if line is None:
        sh.line.fill.background()
    else:
        sh.line.color.rgb = line
        sh.line.width = Pt(line_w)
        if dash:
            from lxml import etree
            ln = sh.line._get_or_add_ln()
            d = etree.SubElement(ln, qn("a:prstDash"))
            d.set("val", "dash")
    sh.text_frame.word_wrap = True
    return sh


def slide_frame(prs, headline, kicker=None, page=None):
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    add_rect(slide, 0, 0, 13.333, 0.16, fill=NAVY)
    y = 0.52
    if kicker:
        add_text(slide, M_L, y, CONTENT_W, 0.26,
                 [{"text": kicker, "size": 11.5, "bold": True, "color": ACCENT, "spc": 1.2}],
                 label="kicker")
        y += 0.34
    add_text(slide, M_L, y, CONTENT_W, 0.62,
             [{"text": headline, "size": 30, "bold": True, "color": NAVY, "line": 0.95}],
             label="headline")
    y += 0.78
    add_rect(slide, M_L, y, 1.5, 0.045, fill=ACCENT)
    if page:
        add_text(slide, 11.4, 6.98, 1.31, 0.26,
                 [{"text": page, "size": 10, "color": SLATE, "align": PP_ALIGN.RIGHT}],
                 align=PP_ALIGN.RIGHT, check=False)
    return slide, y + 0.30


def panel(slide, x, y, w, h, title, lines, fill=LIGHT, border=BORDER,
          title_color=NAVY, body_color=SLATE, title_size=13, body_size=14, gap=7):
    add_rect(slide, x, y, w, h, fill=fill, line=border, line_w=0.75)
    paras = [{"text": title, "size": title_size, "bold": True, "color": title_color,
              "spc": 0.8, "space_after": 7}]
    for i, ln in enumerate(lines):
        paras.append({"text": ln, "size": body_size, "color": body_color,
                      "space_after": gap if i < len(lines) - 1 else 0, "line": 1.05})
    add_text(slide, x + 0.26, y + 0.22, w - 0.52, h - 0.44, paras, label=f"panel:{title}")


prs = Presentation()
prs.slide_width = Inches(13.333)
prs.slide_height = Inches(7.5)

# ============================ SLIDE 1 — PROBLEM =============================
s1 = prs.slides.add_slide(prs.slide_layouts[6])
add_rect(s1, 0, 0, 13.333, 0.16, fill=NAVY)

add_text(s1, M_L, 0.55, CONTENT_W, 0.26,
         [{"text": "ABERDEEN HACKATHON  ·  TEAM 05", "size": 11.5, "bold": True,
           "color": ACCENT, "spc": 1.4}], label="s1 kicker")
add_text(s1, M_L, 0.86, 8.6, 0.7,
         [{"text": "RFP Pursuit Copilot", "size": 40, "bold": True, "color": NAVY,
           "line": 0.95}], label="s1 title")
add_text(s1, M_L, 1.62, 9.3, 0.64,
         [{"text": "Turns a 30–80 page RFP into win themes, a pursuit strategy and a "
                   "first-draft proposal — for the Aberdeen pursuit team.",
           "size": 15, "color": SLATE, "line": 1.1}], label="s1 oneliner")

add_rect(s1, M_L, 2.34, 1.5, 0.045, fill=ACCENT)

add_text(s1, M_L, 2.62, 11.4, 0.5,
         [{"text": "Seven days to respond. And every bidder sounds the same.",
           "size": 27, "bold": True, "color": NAVY, "line": 0.98}], label="s1 problem hl")

bw, bgap = 3.83, 0.30
b1 = M_L
b2 = b1 + bw + bgap
b3 = b2 + bw + bgap
panel(s1, b1, 3.34, bw, 1.42, "THE CLOCK",
      ["The first 48 hours go to structure and boilerplate, not to the client."])
panel(s1, b2, 3.34, bw, 1.42, "THE SAMENESS",
      ["Rivals send similar credentials and the same generic approach."])
panel(s1, b3, 3.34, bw, 1.42, "THE SCORING",
      ["Clients grade demonstrated understanding above capability lists."])

add_rect(s1, M_L, 5.02, CONTENT_W, 1.20, fill=NAVY_DEEP)
add_rect(s1, M_L, 5.02, 0.07, 1.20, fill=ACCENT)
add_text(s1, M_L + 0.34, 5.16, CONTENT_W - 0.68, 0.94,
         [{"text": "“Wayfarer Market Co. puts 30% of its score on Understanding of Brand "
                   "& Crew Culture — and explicitly rejects the cut-costs, "
                   "loyalty-program, more-ads playbook.”",
           "size": 15.5, "italic": True, "color": WHITE, "font": QUOTE_FONT, "line": 1.14,
           "space_after": 4},
          {"text": "Read: the generic proposal does not just underwhelm. It loses on the "
                   "criteria the client wrote down.",
           "size": 12.5, "color": MUTED_WHITE, "line": 1.1}], label="s1 quote")

add_text(s1, M_L, 6.42, 7.6, 0.28,
         [{"text": "Who it helps: the BD lead, partner and SME sharing hours 0–48 of a "
                   "seven-day window.", "size": 12.5, "bold": True, "color": NAVY}],
         label="s1 user")
add_text(s1, M_L, 6.86, CONTENT_W, 0.28,
         [{"text": "Carrie Stout  ·  CJ Johnson  ·  Jordan Cook  ·  Preetish Rath",
           "size": 11, "color": SLATE}], label="s1 team")

# ============================ SLIDE 2 — SOLUTION ============================
s2, y = slide_frame(prs, "Upload the RFP. Get a point of view, not a template.",
                    kicker="THE SOLUTION  ·  RFP PURSUIT COPILOT", page="2 / 4")

flow = [
    ("01  INGEST", "RFP, Aberdeen credentials, prior proposals, case studies."),
    ("02  ANALYZE", "Objectives, requirements, constraints, evaluation criteria."),
    ("03  DRAFT", "Win themes first — then approach, staffing, timeline, copy."),
    ("04  SCORE", "Predicted rubric score and completeness check before send."),
]
fw, fgap = 2.895, 0.17
for i, (t, d) in enumerate(flow):
    x = M_L + i * (fw + fgap)
    add_rect(s2, x, y, fw, 1.28, fill=LIGHT, line=BORDER, line_w=0.75)
    add_rect(s2, x, y, fw, 0.055, fill=ACCENT)
    add_text(s2, x + 0.20, y + 0.22, fw - 0.40, 1.00,
             [{"text": t, "size": 11.5, "bold": True, "color": ACCENT, "spc": 0.8,
               "space_after": 5},
              {"text": d, "size": 13, "color": NAVY, "line": 1.05}], label=f"flow {t}")

y2 = y + 1.50
panel(s2, M_L, y2, 5.83, 3.16, "WHAT IT HANDS YOU",
      ["Three win themes, tied to the client's stated priorities.",
       "Solution approach, staffing model, timeline.",
       "Aberdeen experience ranked by relevance — and why it is relevant.",
       "First-draft copy for the opening sections, structured to the client's own "
       "required response items.",
       "A Response Action per requirement: what it asks of us."],
      gap=9)

px = M_L + 5.83 + 0.43
add_rect(s2, px, y2, 5.83, 3.16, fill=NAVY_DEEP)
add_rect(s2, px, y2, 5.83, 0.07, fill=ACCENT)
add_text(s2, px + 0.26, y2 + 0.26, 5.31, 2.72,
         [{"text": "THE PART NOBODY ELSE BUILT", "size": 13, "bold": True, "color": ACCENT,
           "spc": 0.8, "space_after": 9},
          {"text": "It grades itself against the client's own weighted rubric before you "
                   "send it.", "size": 14, "bold": True, "color": WHITE, "line": 1.08,
           "space_after": 7},
          {"text": "We have been the buy-side judge for years, so we already hold the "
                   "scoring sheets.",
           "size": 13, "color": MUTED_WHITE, "line": 1.08, "space_after": 7},
          {"text": "Completeness check: an unanswered requirement is a non-responsive bid.",
           "size": 13, "color": MUTED_WHITE, "line": 1.08, "space_after": 7},
          {"text": "“Why Aberdeen” comes from our Culture Charter — low-ego, high-ownership "
                   "partnership — with every claim citing its source.",
           "size": 13, "color": MUTED_WHITE, "line": 1.08}],
         label="s2 differentiator")

add_text(s2, M_L, 6.94, CONTENT_W, 0.3,
         [{"text": "Drafts are written to sound like people wrote them: warm, specific and "
                   "about the client. Review before send, always.",
           "size": 12.5, "italic": True, "color": SLATE}], label="s2 footer")

# ============================== SLIDE 3 — DEMO ==============================
s3, y = slide_frame(prs, "Watch a generic proposal lose on the client's criteria.",
                    kicker="DEMO  ·  WAYFARER MARKET CO.", page="3 / 4")

add_rect(s3, M_L, y, 7.05, 0.74, fill=ACCENT_SOFT, line=BORDER, line_w=0.75)
add_text(s3, M_L + 0.22, y + 0.16, 6.61, 0.46,
         [{"text": "Input: specialty grocer, ~500 stores, ~50,000 crew. Grow revenue "
                   "without eroding crew culture.", "size": 13, "bold": True,
           "color": NAVY, "line": 1.05}], label="s3 input")

steps = [
    "Copilot parses the RFP: scope, deliverables D1–D5, requirements 5.1–5.7, "
    "weighted criteria, page limit.",
    "It pins the non-negotiable up front: nothing that erodes crew culture.",
    "Win themes come back in Wayfarer's language, not ours — crew first, growth second.",
    "The draft assembles against Exhibit B, the client's own ten required response items.",
    "Predicted score names the gap: the generic playbook fails the 30% culture criterion.",
]
sy = y + 1.00
for i, st in enumerate(steps):
    add_rect(s3, M_L, sy + 0.035, 0.30, 0.30, fill=NAVY)
    add_text(s3, M_L, sy + 0.075, 0.30, 0.24,
             [{"text": str(i + 1), "size": 12, "bold": True, "color": WHITE,
               "align": PP_ALIGN.CENTER}], align=PP_ALIGN.CENTER, check=False)
    add_text(s3, M_L + 0.46, sy + 0.03, 6.59, 0.62,
             [{"text": st, "size": 14, "color": NAVY, "line": 1.08}], label=f"step {i+1}")
    sy += 0.74

add_text(s3, M_L, sy + 0.10, 7.05, 0.56,
         [{"text": "What the judges see: a proposal that argues the client's own priorities "
                   "back to them — and a number saying how it would be scored.",
           "size": 13, "italic": True, "color": SLATE, "line": 1.1}], label="s3 close")

phx, phy, phw, phh = 8.14, y, 4.57, 4.44
add_rect(s3, phx, phy, phw, phh, fill=LIGHT, line=SLATE, line_w=1.25, dash=True)
add_text(s3, phx + 0.3, phy + 1.86, phw - 0.6, 1.0,
         [{"text": "[ Screenshot: paste UI capture here ]", "size": 14, "bold": True,
           "color": SLATE, "align": PP_ALIGN.CENTER, "space_after": 7},
          {"text": "Front end built; backend in progress at time of writing.",
           "size": 12, "italic": True, "color": SLATE, "align": PP_ALIGN.CENTER}],
         align=PP_ALIGN.CENTER, label="s3 placeholder")
add_text(s3, phx, phy + phh + 0.16, phw, 0.3,
         [{"text": "Live walkthrough delivered in the demo slot.", "size": 12,
           "color": SLATE, "align": PP_ALIGN.CENTER}], align=PP_ALIGN.CENTER,
         label="s3 ph caption")

# ==================== SLIDE 4 — IMPACT & PATH TO MARKET =====================
s4, y = slide_frame(prs, "Faster is table stakes. We play for the 45% that decides.",
                    kicker="IMPACT  ·  PATH TO MARKET", page="4 / 4")

cw, cgap = 2.895, 0.17
cols = [
    ("BUSINESS VALUE", [
        "More pursuits answered, at steadier quality.",
        "Effort moves to the criteria carrying the most weight: demonstrated "
        "understanding, roughly 45% of a rubric, against ~15% for functionality.",
    ]),
    ("PILOT PLAN", [
        "1  Run in parallel on the next live pursuit, beside the human draft.",
        "2  Stand up a curated library of credentials, proposals and case studies — "
        "the main dependency, and empty today.",
        "3  Partner review before anything ships. A rule, not a setting.",
    ]),
    ("WHAT WE WILL MEASURE", [
        "Draft-to-first-review time.",
        "Rubric completeness rate.",
        "Predicted versus actual evaluator score.",
        "Win rate where it was used.",
        "Baselines set in the pilot. Nothing claimed yet.",
    ]),
    ("RISKS, HONESTLY", [
        "Invented credentials or client facts.",
        "One uniform voice across every pursuit.",
        "Confidentiality of client RFP material.",
        "Mitigation: partner sign-off on anything sent, and a cited source behind "
        "every claim.",
    ]),
]
for i, (t, lines) in enumerate(cols):
    x = M_L + i * (cw + cgap)
    panel(s4, x, y, cw, 3.62, t, lines, body_size=13, gap=7)

sy = y + 3.90
add_rect(s4, M_L, sy, CONTENT_W, 1.16, fill=NAVY_DEEP)
add_rect(s4, M_L, sy, 0.07, 1.16, fill=ACCENT)
add_text(s4, M_L + 0.32, sy + 0.20, CONTENT_W - 0.64, 0.80,
         [{"text": "ABERDEEN LABS FIT  ·  REUSABILITY", "size": 12, "bold": True,
           "color": ACCENT, "spc": 1.0, "space_after": 6},
          {"text": "Ingest-and-structure, score-against-a-rubric and write-from-our-real-"
                   "values lift straight into pitch decks, QBRs and any pursuit artifact. "
                   "The buy-side rubric library behind the scoring is an Aberdeen asset no "
                   "competitor can copy.",
           "size": 13, "color": MUTED_WHITE, "line": 1.08}], label="s4 labs")

OUT = ("/tmp/claude-0/-home-claude/81147bed-4a9f-5573-8e39-70617ce7c3d0/scratchpad/"
       "hack-team-05-pursuit-copilot-deck.pptx")
prs.save(OUT)
print("saved", OUT)

print("\n--- overflow estimate (est_h_in vs box_h_in) ---")
CHAR_W = {"Calibri": 0.478, "Georgia": 0.520}
warn = 0
for label, w, h, paras in boxes_for_check:
    total = 0.0
    for p in paras:
        fs = p["size"]
        cw_pt = CHAR_W.get(p.get("font", FONT), 0.49) * fs
        if p.get("bold"):
            cw_pt *= 1.045
        if p.get("spc"):
            cw_pt += p["spc"]
        cpl = max(1, int((w * 72) / cw_pt))
        lines = max(1, math.ceil(len(p["text"]) / cpl))
        total += lines * fs * 1.21 * (p.get("line") or 1.0)
        total += (p.get("space_after") or 0) + (p.get("space_before") or 0)
    est = total / 72.0
    flag = "  <== OVERFLOW" if est > h + 0.005 else ""
    if flag:
        warn += 1
    print(f"{est:5.2f} / {h:5.2f}  {label[:48]}{flag}")
print("warnings:", warn)

#!/usr/bin/env python3
"""Build the 4-slide hackathon submission deck for Aberdeen hack team 05.

Layout is the original formatting (commit 5ef24ed): 13.333 x 7.5 in canvas,
navy #0F2540, accent #C0642A, Calibri body, Georgia italic pull quote.

Content follows the project canvas: one "Analyze Opportunity" action that
produces a Pursuit Brief + Proposal Starter. No rubric/score language.
The four slides run one arc: problem -> solution -> seeing it work -> value.
"""

import math
import os
import shutil
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

# ================= SLIDE 1 — THE PROBLEM, AND WHO IT HURTS ==================
s1 = prs.slides.add_slide(prs.slide_layouts[6])
add_rect(s1, 0, 0, 13.333, 0.16, fill=NAVY)

add_text(s1, M_L, 0.55, CONTENT_W, 0.26,
         [{"text": "ABERDEEN HACKATHON  ·  TEAM 05", "size": 11.5, "bold": True,
           "color": ACCENT, "spc": 1.4}], label="s1 kicker")
add_text(s1, M_L, 0.86, 8.6, 0.7,
         [{"text": "RFP Pursuit Copilot", "size": 40, "bold": True, "color": NAVY,
           "line": 0.95}], label="s1 title")
add_text(s1, M_L, 1.62, 9.3, 0.64,
         [{"text": "One action turns a 30–80 page RFP into a Pursuit Brief and a Proposal "
                   "Starter — a real point of view on the client, plus the opening sections "
                   "already drafted.",
           "size": 15, "color": SLATE, "line": 1.1}], label="s1 oneliner")

add_rect(s1, M_L, 2.34, 1.5, 0.045, fill=ACCENT)

add_text(s1, M_L, 2.62, 11.4, 0.5,
         [{"text": "Seven days to respond. And every bidder sounds the same.",
           "size": 27, "bold": True, "color": NAVY, "line": 0.98}], label="s1 problem hl")

add_text(s1, M_L, 3.16, 11.4, 0.58,
         [{"text": "A typical RFP response takes 5–10 people, 1–2 weeks, and 40+ hours "
                   "each — the BD lead, a partner and the SMEs, all pulled off client work "
                   "in the same week.",
           "size": 14, "bold": True, "color": NAVY, "line": 1.1}], label="s1 human cost")

bw, bgap = 3.83, 0.30
b1 = M_L
b2 = b1 + bw + bgap
b3 = b2 + bw + bgap
panel(s1, b1, 3.88, bw, 1.34, "THE CLOCK",
      ["The first 48 hours go to structure and boilerplate, not to the client."],
      body_size=13.5)
panel(s1, b2, 3.88, bw, 1.34, "THE SAMENESS",
      ["Rivals send similar credentials and the same generic approach."],
      body_size=13.5)
panel(s1, b3, 3.88, bw, 1.34, "CLIENTS LOVE US",
      ["We make things easy — everywhere but the scramble to win the work."],
      body_size=13.5)

add_rect(s1, M_L, 5.46, CONTENT_W, 1.00, fill=NAVY_DEEP)
add_rect(s1, M_L, 5.46, 0.07, 1.00, fill=ACCENT)
add_text(s1, M_L + 0.34, 5.62, CONTENT_W - 0.68, 0.68,
         [{"text": "“Most consulting firms market expertise. Beloved brands market "
                   "experience.”",
           "size": 16, "italic": True, "color": WHITE, "font": QUOTE_FONT, "line": 1.14,
           "space_after": 5},
          {"text": "Wayfarer Market Co.'s RFP explicitly rejects the cut-costs, "
                   "loyalty-program, more-ads playbook.",
           "size": 12.5, "color": MUTED_WHITE, "line": 1.1}], label="s1 quote")

add_text(s1, M_L, 6.86, CONTENT_W, 0.28,
         [{"text": "Carrie Stout  ·  CJ Johnson  ·  Jordan Cook  ·  Preetish Rath",
           "size": 11, "color": SLATE}], label="s1 team")

s1.notes_slide.notes_text_frame.text = (
    "CJ's framing for this pass: judges are not looking for a beautiful deck first. "
    "They want a real, tested build with a clear user, a clear workflow, strong "
    "business value and a credible path to being useful for Aberdeen or its clients. "
    "Read the four slides against that list.\n\n"
    "CJ's idea #1 — become the \"Least Painful Consulting Firm in America.\" Most "
    "clients quietly dislike consulting projects: too many meetings, too many slides, "
    "too much jargon, too much complexity, and consultants who take information but "
    "never give any back. The common denominator we are after is not just humour, "
    "humanity and quality — remarkably easy, remarkably human, remarkably memorable.\n\n"
    "Numbers on this slide (5-10 people, 1-2 weeks, 40+ hours each) are CJ's "
    "illustration of a typical pursuit, not a measured Aberdeen baseline. Say so if "
    "asked."
)

# ========================= SLIDE 2 — THE SOLUTION ===========================
s2, y = slide_frame(prs, "Upload the RFP. Get a point of view, not a template.",
                    kicker="THE SOLUTION  ·  RFP PURSUIT COPILOT", page="2 / 4")

flow = [
    ("01  INGEST", "The RFP, plus Aberdeen credentials, prior proposals and case studies."),
    ("02  ANALYZE", "One action: Analyze Opportunity. No forms, no prompt craft."),
    ("03  DRAFT", "Out comes a Pursuit Brief and a Proposal Starter."),
]
fw, fgap = 3.883, 0.2205
for i, (t, d) in enumerate(flow):
    x = M_L + i * (fw + fgap)
    add_rect(s2, x, y, fw, 1.12, fill=LIGHT, line=BORDER, line_w=0.75)
    add_rect(s2, x, y, fw, 0.055, fill=ACCENT)
    add_text(s2, x + 0.20, y + 0.22, fw - 0.40, 0.76,
             [{"text": t, "size": 11.5, "bold": True, "color": ACCENT, "spc": 0.8,
               "space_after": 5},
              {"text": d, "size": 12.5, "color": NAVY, "line": 1.05}], label=f"flow {t}")

y2 = y + 1.38
lw = 6.90
ph = 3.30
panel(s2, M_L, y2, lw, ph, "WHAT IT HANDS YOU",
      ["Who the client is, in their words — objectives, constraints, red lines.",
       "The three most relevant case studies and credentials, each with a relevance "
       "match and a line on why it is relevant.",
       "Three win themes and differentiators, from Aberdeen's own knowledge base.",
       "A seven-section proposal skeleton — Executive Summary, Our Understanding, "
       "Approach, Relevant Experience, Team, Timeline, Why Aberdeen — with first-draft "
       "copy for the opening two or three.",
       "A Response Action per requirement: what it asks of us."],
      body_size=13, gap=8)

px = M_L + lw + 0.43
pw = CONTENT_W - lw - 0.43
add_rect(s2, px, y2, pw, ph, fill=NAVY_DEEP)
add_rect(s2, px, y2, pw, 0.07, fill=ACCENT)
add_text(s2, px + 0.26, y2 + 0.26, pw - 0.52, ph - 0.44,
         [{"text": "THE PART NOBODY ELSE BUILT", "size": 13, "bold": True, "color": ACCENT,
           "spc": 0.8, "space_after": 9},
          {"text": "The draft argues the client's problem back to them, in their "
                   "language.", "size": 14, "bold": True, "color": WHITE,
           "line": 1.08, "space_after": 7},
          {"text": "Every claim carries the credential, case study or proposal it came from.",
           "size": 13, "color": MUTED_WHITE, "line": 1.08, "space_after": 7},
          {"text": "“Why Aberdeen” comes from our Culture Charter, in a human voice — not "
                   "boilerplate.",
           "size": 13, "color": MUTED_WHITE, "line": 1.08, "space_after": 7},
          {"text": "It lands as a two-page Executive Summary and a one-page Decision "
                   "Guide, full detail behind them — not 75 slides.",
           "size": 13, "color": MUTED_WHITE, "line": 1.08}],
         label="s2 differentiator")

add_text(s2, M_L, 6.72, 10.6, 0.3,
         [{"text": "The question behind every output: how do we make each interaction "
                   "with Aberdeen unexpectedly enjoyable?",
           "size": 12.5, "italic": True, "color": SLATE}], label="s2 footer")

s2.notes_slide.notes_text_frame.text = (
    "The output shape is CJ's brand argument turned into product behaviour. Instead of "
    "a 75-slide deck, the default deliverable is a two-page Executive Summary, a "
    "one-page Decision Guide, and the full analysis behind them. The seven-section "
    "skeleton is what gets drafted; this is the shape it comes out in.\n\n"
    "CJ's example of the same instinct applied to a meeting — instead of \"Attached is "
    "the agenda\", send: \"Good news: we've done the homework. You don't need to prepare "
    "anything. We'll bring three recommendations and only need your reaction.\" The "
    "experience we are aiming for is \"thank goodness, somebody made this simple.\"\n\n"
    "Culture Charter values behind \"Why Aberdeen\": low-ego, high-ownership "
    "partnership; relationship-driven engagement; agile, growth-minded teams; "
    "empowered, multidisciplinary teams."
)

# ====================== SLIDE 3 — SEEING IT WORK ============================
s3, y = slide_frame(prs, "Upload once. It argues Wayfarer's problem back to them.",
                    kicker="DEMO  ·  WAYFARER MARKET CO.", page="3 / 4")

add_rect(s3, M_L, y, 7.05, 0.74, fill=ACCENT_SOFT, line=BORDER, line_w=0.75)
add_text(s3, M_L + 0.22, y + 0.15, 6.61, 0.52,
         [{"text": "Input: specialty grocer, ~500 stores, ~50,000 crew. Grow revenue "
                   "without eroding crew culture.", "size": 13, "bold": True,
           "color": NAVY, "line": 1.05}], label="s3 input")

steps = [
    "Copilot reads the RFP: scope, deliverables D1–D5, requirements 5.1–5.7, page limit.",
    "It pins the non-negotiable up front: nothing that erodes crew culture.",
    "Win themes come back in Wayfarer's language, not ours — crew first, growth second.",
    "Three case studies surface with a relevance match and a line on why each one fits.",
    "The Proposal Starter assembles against Exhibit B, the client's own required "
    "response items, with the opening sections already written.",
]
sy = y + 0.96
for i, st in enumerate(steps):
    add_rect(s3, M_L, sy + 0.035, 0.30, 0.30, fill=NAVY)
    add_text(s3, M_L, sy + 0.075, 0.30, 0.24,
             [{"text": str(i + 1), "size": 12, "bold": True, "color": WHITE,
               "align": PP_ALIGN.CENTER}], align=PP_ALIGN.CENTER, check=False)
    add_text(s3, M_L + 0.46, sy + 0.03, 6.59, 0.62,
             [{"text": st, "size": 14, "color": NAVY, "line": 1.08}], label=f"step {i+1}")
    sy += 0.70

add_text(s3, M_L, sy + 0.12, 7.05, 0.52,
         [{"text": "What the judges see: a first draft that understood the business before "
                   "it started describing us.",
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

s3.notes_slide.notes_text_frame.text = (
    "Wayfarer Market Co. is one of the three mock RFPs in reference/mock-rfps. Walk "
    "the five steps live, then show the Pursuit Brief and the Proposal Starter side by "
    "side. Land the contrast CJ is after: the client gets something short and useful "
    "up front, with the depth available behind it, rather than a long document they "
    "have to mine.\n\n"
    "If asked what is not built yet: the credential and case-study library is the main "
    "dependency and is empty today. Say that plainly — it is on the pilot plan."
)

# ============ SLIDE 4 — THE VALUE, AND WHAT IT CHANGES FOR PEOPLE ===========
s4, y = slide_frame(prs, "Faster is nice. Getting your evening back is the point.",
                    kicker="IMPACT  ·  PATH TO MARKET", page="4 / 4")

cw, cgap = 2.895, 0.17
cols = [
    ("BUSINESS VALUE", [
        "More pursuits answered, at steadier quality.",
        "The first 48 hours go to the client's problem, not to page setup.",
        "Reusable: the same ingest-and-draft lifts into pitch decks and QBRs.",
    ]),
    ("PILOT PLAN", [
        "1  Run in parallel on the next live pursuit, beside the human draft.",
        "2  Stand up the credential and case-study library — the main dependency, "
        "empty today.",
        "3  Partner review before send. A rule, not a setting.",
    ]),
    ("WHAT WE WOULD MEASURE", [
        "Draft-to-first-review time.",
        "Hours per pursuit, per person.",
        "How much of the draft survives review.",
        "Win rate where it was used.",
        "Baselines get set in the pilot.",
    ]),
    ("RISKS, HONESTLY", [
        "Invented credentials or client facts.",
        "One uniform voice across every pursuit.",
        "Confidentiality of client RFP material.",
        "Mitigation: partner sign-off before send, and a cited source per claim.",
    ]),
]
for i, (t, lines) in enumerate(cols):
    x = M_L + i * (cw + cgap)
    panel(s4, x, y, cw, 3.14, t, lines, body_size=13, gap=7)

sy = y + 3.40
add_rect(s4, M_L, sy, CONTENT_W, 1.56, fill=NAVY_DEEP)
add_rect(s4, M_L, sy, 0.07, 1.56, fill=ACCENT)
add_text(s4, M_L + 0.32, sy + 0.16, CONTENT_W - 0.64, 1.24,
         [{"text": "WHAT WE ARE PLAYING FOR", "size": 12, "bold": True,
           "color": ACCENT, "spc": 1.0, "space_after": 6},
          {"text": "Want to get home in time for dinner tonight? Or read your kid a "
                   "bedtime story and tuck them in? Use this tool.",
           "size": 14, "bold": True, "color": WHITE, "line": 1.08, "space_after": 6},
          {"text": "Our target: give back 80% of those 40+ hours — the number the pilot "
                   "exists to prove, not a result we are claiming today.",
           "size": 13, "color": MUTED_WHITE, "line": 1.08, "space_after": 6},
          {"text": "Working with Aberdeen should feel easier after every interaction. "
                   "That includes the week we spend winning the work.",
           "size": 13, "italic": True, "color": WHITE, "line": 1.08}], label="s4 payoff")

s4.notes_slide.notes_text_frame.text = (
    "The 80% is CJ's target for the pilot to test, not an achieved result. Same for the "
    "5-10 people / 1-2 weeks / 40+ hours figures on slide 1 — they are his illustration "
    "of a typical pursuit. Do not present either as measured.\n\n"
    "CJ's brand promise, in full: \"Working with Aberdeen should feel easier after every "
    "interaction.\" Every touchpoint should reduce stress, not add it. The experience we "
    "want is \"thank goodness, somebody made this simple.\" Most firms market expertise; "
    "beloved brands market experience — that is the spine of this deck.\n\n"
    "Baselines get set during the pilot. Nothing is claimed today."
)

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "hack-team-05-pursuit-copilot-deck.pptx")
prs.save(OUT)
print("saved", OUT)

SCRATCH = ("/tmp/claude-0/-home-claude/81147bed-4a9f-5573-8e39-70617ce7c3d0/scratchpad/"
           "hack-team-05-pursuit-copilot-deck.pptx")
if os.path.isdir(os.path.dirname(SCRATCH)):
    shutil.copyfile(OUT, SCRATCH)
    print("copied", SCRATCH)

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

---
title: How the Company Context folder works
kind: note
tags: [setup, instructions]
---

# Company Context

This folder is Aberdeen WinRoom's knowledge base. Everything the app and the MCP
server know about Aberdeen comes from the Markdown files in here — nothing else.
Drop a file in, click **Re-index Corpus** (or run the `reindex_corpus` MCP tool),
and it is immediately available to every generator.

> **The files shipped in this folder are SAMPLE DATA.** They are realistic in
> shape but the client names, figures, and people are invented placeholders.
> Replace them with real Aberdeen material before using WinRoom on a live
> pursuit. Nothing in here should be quoted to a client as-is.

## Why a folder and not SharePoint

SharePoint integration is on the roadmap. Today WinRoom reads a plain folder,
which means:

- No tenant app registration, no Graph API permissions, no auth flow to maintain.
- It works with the network off.
- When Aberdeen's proposal library is synced locally through OneDrive, you can
  point WinRoom straight at that synced folder and nothing else changes — set
  the `WINROOM_CONTEXT_DIR` environment variable to the synced path.

The retrieval layer is written against a folder abstraction, so swapping in a
direct SharePoint connector later is a driver change, not a rewrite.

## Folder layout

| Folder | What goes in it | `kind` |
|---|---|---|
| `services/` | Service catalogue, engagement model, delivery methods | `service` |
| `credentials/` | Prior engagements, case studies, outcomes | `credential` / `case-study` |
| `smes/` | Named subject-matter experts, practices, prior projects | `sme` |
| `commercials/` | Rate cards, pricing structures, commercial models | `commercial` |
| `voice/` | Writing voice, style rules, banned phrases | `voice` |
| `proposals/` | Reusable proposal patterns, boilerplate, win-theme library | `proposal` |

The folder name sets the `kind` automatically. You can override it with front
matter if a file does not fit its folder.

## File format

Plain Markdown. Optional front matter improves retrieval a lot — tags are
weighted heavily in scoring:

```markdown
---
title: Regional Health System ERP Modernisation
kind: credential
tags: [healthcare, erp, workday, data migration, pmo]
client: Regional health system (anonymised)
year: 2025
---

## Situation
...

## What Aberdeen did
...

## Outcome
...
```

## Writing files that retrieve well

1. **Use the client's vocabulary, not ours.** If RFPs say "revenue cycle", write
   "revenue cycle" — not "financial operations optimisation".
2. **Put numbers in.** Retrieval favours specifics, and so do evaluators.
3. **One engagement per file.** Splitting keeps citations precise.
4. **Use `##` headings.** The index chunks on headings, so good headings mean
   the right passage gets retrieved instead of the whole document.
5. **Tag generously.** Industry, technology, capability, and delivery model.

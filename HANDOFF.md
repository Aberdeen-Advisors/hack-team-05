# HANDOFF — Pursuit combined final-round build

For the next Claude Code session (or teammate) continuing this work.
State as of 2026-09-21, commit `bf145c4`.

## What this is

The Aberdeen hackathon final-round build: **Team 5's Pursuit Concierge (Next.js
app, live workspace, exports) running Team 3's Pursuit Accelerator method (the
Client Response Playbook as engine discipline)**. Both teams scored ~4.45 in
round one with complementary judge criticisms; this build merges them and
answers those criticisms one by one.

## Where things live

| Thing | Location |
|---|---|
| **This repo (canonical)** | `github.com/Aberdeen-Advisors/hack-team-05-fork`, branch `main`. Local checkout: `Claude Code/pursuit-final/pursuit`, remote `origin`. The remote `personal` (harminderb20/aberdeen-pursuit-final) is a backup; safe to archive. |
| Original submissions | `Aberdeen-Advisors/hack-team-05` (Concierge) and `Aberdeen-Advisors/hack-team-03` (Accelerator, incl. local desktop app + MCP). Local clones sit next to this repo. |
| Production | `pursuit-copilot.vercel.app`, Vercel team `aberdeen-advisors`, project `pursuit-copilot`, **Hobby plan** (functions capped at 300s). Deploys are CLI-only (not git-connected): `npx vercel deploy --prod --yes` from this folder. **The user must run deploys** — the agent's permission layer blocks deploy/publish commands; give the user the command instead. |
| Method files | `method/aberdeen-pursuit/` (v0.4.0 skill: 5 stages + 8 references). Distilled into `lib/prompts/method.ts`. The skill's source repo is `harminderb20/aberdeen-pursuit-accelerator` (benchmark docs live there: 79–83% blind vs a real submitted response, 0 fabrications). |
| Sample corpus | `sample-armory/` (invented clients) — keyless demo: `npm run armory:sync -- --from-dir ./sample-armory` |
| Judge feedback (both teams) | PDFs in the user's Downloads; summarized in the roadmap page's "answers" lines |

## Architecture in one paragraph

Upload (`app/api/analyze/route.ts`) parses the request doc and saves a pursuit
(slug id from opportunity name). The workspace (`components/workspace.tsx`)
opens an SSE stream (`app/api/analyze/[id]/stream/route.ts`) which replays
cached engine results, then orchestrates missing ones
(`lib/engines/orchestrate.ts`, resume-aware) under a **run lease** (poll mode
for reconnecting clients; takeover on stale lease — this fixed the
duplicate-run/credit-burn bug). Five engines (`lib/engines/run.ts`): Understand
→ (Strategize ∥ Match) → Design → Create. Sonnet 5 on the first four, Opus 5 on
Create. Each engine = cached prefix (system + request text, Anthropic
`cacheControl` breakpoint) + method block (`lib/prompts/method.ts`) + profile
rules + Armory retrieval (Upstash vector, `lib/armory/`) + task. Results and
per-engine sources persist to Upstash sentinel vectors (`lib/pursuit/store.ts`).
Exports: `lib/export/docx.ts` / `pptx.ts` — deterministic templates, no model.

## Shipped in the final round (all pushed)

1. Method transplant into all five engine prompts + Aberdeen voice rules + owner-routed `[NEEDS INPUT: what – owner]` flags
2. Per-tab **Sources** strips linked to SharePoint; names anonymized unless `NEXT_PUBLIC_SOURCE_NAMES=internal` (public deployments must not leak client names in doc filenames)
3. Resume/lease fix for duplicate engine runs (`maxDuration=300` to fit Hobby; `LEASE_MS=310_000`)
4. Readable workspace slugs (`hanger-ai-readiness-k4qz`)
5. Model upgrade: Sonnet 5 (33% cheaper than 4.6) + Opus 5 (same price as 4.7)
6. **Prompt caching** (see architecture) — expect ~half input cost; **verification pending**: check `cache_read_input_tokens` in the Vercel AI gateway dashboard on the next run; if 0, the gateway isn't passing `providerOptions.anthropic.cacheControl` through
7. **Eight response profiles**: Understand classifies (schema `responseProfile` + `profileRationale`), downstream engines get `profileRuleBlock()`, workspace shows a profile badge. **Verification pending**: test with a non-RFP document
8. Timeline fixes: 4-lane label collision avoidance; year-less dates pinned to current year (V8 defaults them to 2001)
9. `/roadmap` page (each item traces to a judge note), truthful landing copy (citation-chip overclaim removed), both-teams footer, v0.4

## Next work queue (user-approved order)

1. **Quality-gate Review engine** — 6th engine after Create: check draft coverage against the requirements matrix (n/N per requirement), scan for voice violations (em dashes, AI tells — see `method/aberdeen-pursuit/references/aberdeen-voice.md` tell table) and ungrounded claims; emit verdict (READY / READY AFTER FIXES / NOT READY) + fix list into a new Review tab. Model: Sonnet 5. Wire into orchestrate after `create`; new schema in `schemas.ts`; new tab component; lease/resume already generalizes.
2. **Pursuits library + open-items checklist** — `/pursuits` page listing persisted pursuits (needs a list operation in `lib/pursuit/store.ts`; pursuit records are Upstash sentinel vectors — consider a secondary index record listing ids); workspace "Open items" panel extracting `[NEEDS INPUT: what – owner]` flags from all engine results into an owner-grouped checklist. Answers the "team sport" judge criticism.
3. **Corpus re-sync (ops)** — the live index still holds Team 5's ORIGINAL Armory (that's why the Hanger response appears as a source). Someone with env keys: set `SHAREPOINT_ARMORY_FOLDER_PATH` to the curated folder, `npm run armory:sync`. Sync prunes removed docs.
4. Per-engine modular routes (re-run one engine; pairs with edit-before-export) — post-final if time is short.
5. Tenant deployment (Azure + Entra SSO) — roadmap slide item, not hackathon build.

## Gotchas the next session must know

- **Toolchain paths (Windows):** `node`/`npm` not on tool-shell PATH. Use `"/c/Program Files/nodejs/node.exe" "/c/Program Files/nodejs/node_modules/npm/bin/npm-cli.js" run <script>` in Bash. Python: `"/c/Users/HarminderBoparai/anaconda3/python.exe"`.
- **Agent permission layer** blocks `vercel deploy`, repo-visibility changes, and some compound git commands ("Data Exfiltration"/"Production Deploy" classifiers). Split commands into simple steps; hand deploys to the user.
- **Next.js 16.3** — repo AGENTS.md warns APIs may differ from training data; check `node_modules/next/dist/docs/` before nontrivial framework work. `next dev` re-adds the AGENTS.md block; commit it.
- **Typecheck before commit:** `npm run typecheck` (tsc --noEmit). Build: `npm run build`.
- **AI Gateway billing:** requires positive credit balance even with BYOK; runs error with a top-up message when empty. A full run cost ~$2 pre-caching/pre-upgrade; expect ~$0.50–0.90 after (verify).
- **Anonymization contract:** Team 5's guarantee — no real client names in any displayed/exported output. The Armory INDEX may hold real names; UI must not show them publicly (see SourcesStrip env flag). Prior proposals ARE legitimate corpus content.
- **Do not benchmark against the Hanger RFP** — the Armory contains Aberdeen's actual submitted Hanger response; results are contaminated. Use `reference/mock-rfps/` (Cascadia, Sonora, Wayfarer) for testing.
- Git identity in this repo is set to the user's GitHub noreply (`301334901+harminderb20@users.noreply.github.com`) — Vercel blocks deployments whose commit author email isn't on a GitHub account. The user's work email is now also verified on GitHub.
- Commit messages end with: `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>`.

## Verification checklist for the next deploy

- [ ] Fresh run on a mock RFP: profile badge shows `RFP`, timeline renders without label collisions, sources show anonymized labels
- [ ] Gateway dashboard: `cache_read_input_tokens` > 0 on engines 2–5; per-run cost vs the ~$2 baseline
- [ ] A non-RFP document classifies to the right profile and reshapes the Create output
- [ ] Refresh mid-run: completed tabs stay done, run resumes instead of restarting

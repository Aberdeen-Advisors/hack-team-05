# Aberdeen Pursuit Copilot

RFP-to-pursuit-brief AI copilot for Aberdeen Advisors. Upload a 30–80 page RFP; the tool understands the client, retrieves the strongest evidence from Aberdeen's SharePoint-based **Pursuit Armory** (case studies, credentials, culture charter, services, boilerplate answers), and streams five engines back into a workspace:

| Engine | Question | Output |
| --- | --- | --- |
| **Understand** | What does this client actually need? | Opportunity Brief + compliance matrix |
| **Strategize** | How do we win? | Win Themes + Differentiators (technical + human) |
| **Match** | What proves our claims? | Evidence Map (ranked, cited) |
| **Design** | What should we propose? | Solution Blueprint + 7-day pursuit plan |
| **Create** | How do we communicate it? | Proposal draft + executive deck spec |

Exports on-brand `.docx` proposal and `.pptx` deck. Anonymizes real client names.

Built for the Aberdeen hackathon by team **hack-team-05** (Carrie Stout, Jordan Cook, CJ Johnson, Preetish Rath).

## Stack

- **Next.js 16** App Router · TypeScript · Tailwind 4 · shadcn/ui · Poppins
- **Vercel AI Gateway** with `anthropic/claude-opus-4-7` (orchestrator) + `anthropic/claude-sonnet-4-6` (parallel engines)
- **Upstash Vector** for embeddings (Vercel Marketplace)
- **Microsoft Graph** (client credentials) for the SharePoint Armory
- **pptxgenjs** + **docx** for exports
- Deployed on **Vercel** (Fluid Compute)

## Setup

### 1) Env vars

Copy `.env.example` to `.env.local` and fill in:

```
AI_GATEWAY_API_KEY=…                # Vercel AI Gateway
UPSTASH_VECTOR_REST_URL=…           # provisioned via Vercel Marketplace → Upstash Vector
UPSTASH_VECTOR_REST_TOKEN=…
MS_GRAPH_TENANT_ID=…                # Azure AD tenant id
MS_GRAPH_CLIENT_ID=…                # Registered app client id
MS_GRAPH_CLIENT_SECRET=…            # App secret
SHAREPOINT_SITE_ID=…                # {host},{siteCollectionId},{siteId}
SHAREPOINT_ARMORY_FOLDER_PATH=Pursuit Armory
```

### 2) Azure AD app (one-time)

Register a single-tenant app in Aberdeen's Azure tenant with application permission `Sites.Selected` (preferred) or `Files.Read.All`. Grant admin consent. If using `Sites.Selected`, grant the app `read` on the specific SharePoint site via Graph.

### 3) Install + sync Armory

```
npm install
npm run armory:sync                            # SharePoint mode
# or, if Azure AD isn't wired up yet:
npm run armory:sync -- --from-dir ./tmp/armory-dump
```

### 4) Run

```
npm run dev
```

Open http://localhost:3000, drop a mock RFP, click **Analyze Opportunity**.

## Deploy

```
npm i -g vercel
vercel link
vercel env pull
vercel --prod
```

Add the Upstash Vector integration to the Vercel project (Integrations → Add → Upstash Vector) to auto-provision `UPSTASH_VECTOR_REST_*` in every environment.

## End-to-end demo checklist

1. `npm run armory:sync` → log shows N docs → M chunks upserted.
2. `curl "http://localhost:3000/api/armory/search?q=onboarding"` → results with `docName` + `webUrl`.
3. Upload mock RFP on `/` → routed to `/workspace/[id]`.
4. All 5 tabs stream in within ~60–90s.
5. Every Aberdeen claim in Win Strategy / Evidence Map carries a `[C#]` citation chip.
6. **Export Word** downloads on-brand `.docx`.
7. **Export Deck** downloads on-brand `.pptx`.
8. Real brand names from the mock RFP appear anonymized in all outputs.

## Repo layout

```
app/                          # Next.js App Router pages + API routes
  api/analyze/                # RFP upload + SSE engine stream
  api/armory/{sync,search}/   # Armory ingest + debug retrieval
  api/export/{pptx,docx}/     # Downloads
  workspace/[id]/             # Live pursuit workspace
components/                   # UI (shadcn + custom tabs)
lib/
  armory/                     # SharePoint → text → chunks → embeddings → Upstash
  rfp/parse.ts                # PDF/DOCX → normalized text + section index
  engines/                    # Five engine implementations + orchestrator
  prompts/system.ts           # Aberdeen positioning + no-invention rule
  export/{pptx,docx}.ts       # On-brand exporters
  anonymize.ts                # Belt-and-suspenders client-name scrub
  branding.ts                 # Palette + font + logo tokens
scripts/armory-sync.ts        # `npm run armory:sync`
assets/                       # Aberdeen brand assets (logos, slide master, style guide)
```

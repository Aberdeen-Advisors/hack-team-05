# Data Handling

Pursuit work touches real client material: RFPs under confidentiality, prior proposals,
pricing, PHI-adjacent healthcare content, and named individuals. Handle it accordingly.

---

## The boundary

**Client and confidential material stays inside approved tools and inside the Aberdeen
M365 tenant.**

The accelerator is designed so this is the default rather than a discipline. The corpus
is read from SharePoint at runtime and the output is written back to SharePoint. Client
content has no reason to be anywhere else.

## Never

- Commit client documents, client facts, pricing, or named individuals to a source
  repository, public or private
- Publish client content to a web page, artifact, hosted preview, or any external service
- Paste client content into a tool that has not been approved for it
- Put confidential material in a file name, a commit message, or an issue title
- Include tenant identifiers, drive IDs, or item IDs in anything that leaves the session

## Always

- Confirm a document is cleared for the use before using it outside its original context.
  Redacted is not the same as cleared.
- Keep generated pursuit output in the pursuit's own SharePoint folder
- Apply the file-naming standard `Client_Document_Type_Date` so provenance is obvious
- Flag it explicitly when a source carries a confidentiality marking, and carry that
  marking into any derived document
- Ask before sending anything outward. Producing a document is not the same as sending it.

## Repository rule

This skill's repository contains **the engine only**: instructions, references, and
method. No client documents, no client facts, no tenant identifiers, no corpus.

That is not only a compliance posture, it is the architecture. The engine is portable and
shareable precisely because the corpus is not in it.

If you are about to write a client-derived fact into a repository file, stop. It belongs
in the pursuit folder in SharePoint instead.

## Regulated data

Healthcare pursuits routinely involve PHI-adjacent material and require a BAA before
regulated data is handled at all. Where an RFP requires an MSA, BAA, or NDA, note it in
stage 1 and carry it into the terms section. Do not treat it as boilerplate.

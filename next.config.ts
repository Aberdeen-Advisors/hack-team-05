import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Disabled so the workspace SSE stream isn't double-opened + torn down by
  // Strict Mode's dev-only effect double-invoke, which would leave the client
  // with no live EventSource. Safe: prod builds don't double-invoke effects.
  reactStrictMode: false,

  // Bundle the proposal spine markdown into the export serverless function so
  // lib/export/spine.ts can read it on Vercel. Without this, the dynamic
  // fs.readFile falls back to the hardcoded DEFAULT_SPINE in production and
  // any edits to the .md files wouldn't reach the exports.
  outputFileTracingIncludes: {
    "/api/export/docx": [
      "./method/aberdeen-pursuit/references/proposal-spine.md",
      "./sample-armory/proposals/aberdeen-proposal-spine.md",
    ],
    "/api/export/pptx": [
      "./method/aberdeen-pursuit/references/proposal-spine.md",
      "./sample-armory/proposals/aberdeen-proposal-spine.md",
    ],
  },
};

export default nextConfig;

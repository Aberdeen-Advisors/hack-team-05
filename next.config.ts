import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Disabled so the workspace SSE stream isn't double-opened + torn down by
  // Strict Mode's dev-only effect double-invoke, which would leave the client
  // with no live EventSource. Safe: prod builds don't double-invoke effects.
  reactStrictMode: false,
};

export default nextConfig;

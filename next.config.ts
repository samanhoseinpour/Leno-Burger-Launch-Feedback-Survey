import type { NextConfig } from "next";
import { NOINDEX_HEADER, SEARCH_INDEXING } from "./src/lib/seo";

const nextConfig: NextConfig = {
  async headers() {
    if (SEARCH_INDEXING) return [];

    // Belt and braces alongside the `<meta name="robots">` in the root layout.
    // The header is the only one of the two that reaches responses with no
    // `<head>` — notably the CSV export at /api/admin/export.
    return [
      {
        source: "/:path*",
        headers: [{ key: "X-Robots-Tag", value: NOINDEX_HEADER }],
      },
    ];
  },
};

export default nextConfig;

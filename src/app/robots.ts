import type { MetadataRoute } from "next";

// Crawling is allowed on purpose — including while indexing is switched off.
// A `Disallow: /` would stop crawlers from ever fetching a page, so they would
// never read the `noindex` that actually keeps it out of the index. See the
// long note in `src/lib/seo.ts`.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
  };
}

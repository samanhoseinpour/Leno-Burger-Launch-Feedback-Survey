import type { Metadata } from "next";

/**
 * Search-engine indexing switch — the single source of truth.
 *
 * `false` while Leno lives on a temporary host, so the placeholder menu and the
 * survey never surface in Google. Flip to `true` once the real restaurant domain
 * is live and pointed at production; nothing else needs to change.
 *
 * Two layers read this flag, and both are needed:
 *   1. `src/app/layout.tsx` → `<meta name="robots">` on every HTML page.
 *   2. `next.config.ts`     → an `X-Robots-Tag` response header on every route,
 *      which also covers responses that have no `<head>` for a meta tag to live
 *      in (the CSV export at `/api/admin/export`).
 *
 * `src/app/robots.ts` deliberately does NOT read the flag: it always allows
 * crawling. That is not an oversight. `Disallow: /` stops a crawler from
 * *fetching* a page, which means it never sees the `noindex` below — and Google
 * will still list a disallowed URL it discovers through a link, as a bare
 * title-less result. Allowing the fetch so the crawler reads `noindex` is the
 * only combination that keeps pages out of the index for certain.
 */
export const SEARCH_INDEXING = false;

/** `noindex, nofollow` for every crawler, including Google's image indexer. */
export const NOINDEX_ROBOTS: Metadata["robots"] = {
  index: false,
  follow: false,
  nocache: true,
  googleBot: { index: false, follow: false, noimageindex: true },
};

/** The same directive as a header value, for responses without a `<head>`. */
export const NOINDEX_HEADER = "noindex, nofollow";

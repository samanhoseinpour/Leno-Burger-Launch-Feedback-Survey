# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project state

**Built and shipped.** `SPEC.md` is the product spec and remains the source of truth for
**brand, Persian copy, and the score mapping**. Where the spec and the code disagree on
*behavior*, the code won — the deliberate overrides are called out in `SPEC.md` itself and
repeated under "Non-obvious rules" below. Read `SPEC.md` before changing anything guest-facing.

## What this is

A mobile-first, **RTL, Persian-language** customer-feedback survey for **Leno**, a burger
restaurant, used on opening day. Guests scan a table QR → fill the survey on their phone →
submit. Staff review aggregated results on a password-protected `/admin` page. It replaces a
printed A4 card but is a single-column tap-to-select mobile flow, not a print layout.
A small public site (home hub + menu placeholder) now frames the survey.

## Stack

- Next.js 16 (App Router) + React 19 + TypeScript. Node 20+. Turbopack is the default — **do not add `--turbopack` or a custom webpack config**.
- Tailwind CSS v4 (brand tokens as CSS variables).
- Prisma ORM against **Postgres (Neon) in every environment**. SQLite is never used — Vercel serverless has no persistent disk. The spec's old "SQLite in dev" line no longer applies.
- `next/font/google` for fonts (no CDN `<link>` tags).
- **Server Actions** for the form submit (`useActionState` for pending/errors). A Route Handler is used only for CSV export. No client-side data-fetching library.

## Commands

```bash
npm run dev              # http://localhost:3001  (port is pinned in package.json)
npm run build            # prisma generate && prisma migrate deploy && next build
npm run lint             # eslint
npm run db:seed          # sample responses so /admin has data
npx prisma migrate deploy # apply migrations to the Postgres database
npx prisma studio        # inspect the database
```

`npm run build` talks to the database. To compile without touching it, run `npx next build`.

No test framework is set up; confirm the intended approach before adding one.

## Non-obvious rules that are easy to get wrong

These are the constraints most likely to be violated by a well-meaning change. Treat them as hard requirements.

- **Persian copy is VERBATIM.** Every guest-facing survey string (headers, questions, scale labels, footer, button text) is fixed Persian in `SPEC.md`, and lives in `src/lib/survey.ts`. Do not translate, paraphrase, "improve", or fix perceived typos. The survey is built data-driven from `QUESTIONS` / `SCALE_*`. Interface microcopy that is *not* on the printed card (`UI_COPY`, `SITE_COPY`, `VALIDATION_MESSAGES`) is written in the app's own voice and may be edited.
- **Score mapping is fixed and independent of RTL.** Stored value = `array index + 1`. Index 0 (most-negative label) = 1; index 4 (most-positive) = 5. RTL flips only the *visual* order (index 0 renders rightmost). Do **not** let layout/visual position change the stored score.
- **Ratings q1–q6 are REQUIRED**, and `phone` is validated when non-empty. This deliberately overrides the spec's original "ratings optional, never hard-block" rule. **Do not revert it.** Validation is one Zod schema in `src/lib/validation.ts`, shared by the client and the Server Action so they cannot drift.
- **Persian digits in the UI.** Render question numbers as Persian digits (۱–۷) via `toPersianDigits()`.
- **Phone normalization.** Accept Persian (۰۹…) / Arabic digits, normalize to Latin `09…` via `normalizePhone()` before validating.
- **The site must not be indexed.** `SEARCH_INDEXING = false` in `src/lib/seo.ts` is the single switch; see "Search indexing" below. Do not add a `Disallow: /` to `src/app/robots.ts` — it would defeat the `noindex`.
- **CSV export must be UTF-8 with a BOM** so Persian opens correctly in Excel.
- **Privacy:** store `userAgent` only. Do **not** store IP or any tracking.
- **RTL + a11y are acceptance criteria**, not polish: `lang="fa"` / `dir="rtl"` at the root, rating groups as real radio groups (keyboard-operable, visible focus), `aria-hidden` on the SVG badge, tap targets ≥ 44px, Lighthouse ≥ 90 mobile.

## Architecture

- **`src/app/(site)/`** — the public site, wrapped by `SiteChrome` (skip link + sticky nav + slim footer).
  - **`/`** — home hub: hero + cards to the menu and the survey.
  - **`/menu`** — branded "coming soon" placeholder.
  - **`/survey`** — the survey. A client component tracks the selected value per question; submit posts via a Server Action. On success the form swaps in place for the thank-you, which also blocks resubmits.
  - **`/thanks`** — the same thank-you screen as a standalone route.
- **`src/app/admin/`** — protected dashboard, deliberately **outside** the `(site)` group so it never inherits the public chrome. Gated by a single `ADMIN_PASSWORD` (login form → httpOnly cookie holding a sha256 of the password; no user accounts). Shows total responses, average score per question (0–5 bar), per-question distribution, a table of Q7 write-ins, and a CSV export button. Since there is no site nav here, **both the login screen and the dashboard carry their own back-to-home link.**
- **`src/app/api/admin/export/`** — the CSV Route Handler.
- **Data:** one `Response` model (`q1`–`q6` `Int?` 1..5, `orderNote` for Q7, optional `name`/`phone`, `userAgent`, `createdAt`).
- **`src/lib/`** — `survey.ts` (verbatim copy + questions), `site.ts` (site-chrome copy + nav items), `validation.ts` (Zod), `format.ts`, `seo.ts`, `auth.ts`, `stats.ts`, `prisma.ts`.

## Search indexing

The app is on a **temporary domain**, so nothing may appear in Google. `src/lib/seo.ts` holds
the single switch. `src/app/layout.tsx` emits `<meta name="robots">` on every page and
`next.config.ts` sets an `X-Robots-Tag` header on every route (the header is what covers
non-HTML responses like the CSV export). `src/app/robots.ts` **allows** crawling on purpose —
a blocked crawler never fetches the page and so never reads the `noindex`, and Google will
still list a disallowed URL it discovers through a link. `/admin` pins its own `noindex` so it
stays hidden even after launch.

**To go live on the real domain:** set `SEARCH_INDEXING = true` and redeploy.

## Brand

Brand tokens (CSS variables), the inline three-bar SVG logo, and font roles (**Vazirmatn** body/UI, **Archivo Black** for the "Leno" wordmark only — stays LTR, **JetBrains Mono** for numeric accents) are specified precisely in `SPEC.md` §"Brand tokens" / "Logo mark". Flat and warm — no gradients, no heavy drop-shadow cards.

## Environment variables

- `DATABASE_URL` — the Neon Postgres connection string (locally and in prod).
- `ADMIN_PASSWORD` — gates `/admin`.

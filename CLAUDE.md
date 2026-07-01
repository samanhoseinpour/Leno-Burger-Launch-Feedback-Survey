# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project state

**Spec-first, not yet scaffolded.** The only content today is `SPEC.md` (the product & build spec) and a Next.js-flavored `.gitignore`. There is no `package.json`, source, or Prisma schema yet. **Read `SPEC.md` before doing anything** — it is the source of truth for stack, copy, data model, routes, and acceptance criteria. When implementing, follow it exactly rather than improvising an alternative structure.

## What this is

A mobile-first, **RTL, Persian-language** customer-feedback survey for **Leno**, a burger restaurant, used on opening day. Guests scan a table QR → fill the survey on their phone → submit. Staff review aggregated results on a password-protected `/admin` page. It replaces a printed A4 card but is a single-column tap-to-select mobile flow, not a print layout.

## Intended stack (use exactly this — see SPEC.md §"Tech stack")

- Next.js latest stable (16.x, App Router) + React 19 + TypeScript. Scaffold with `npx create-next-app@latest`. Node 20+. Turbopack is the default in 16 — **do not add `--turbopack` or a custom webpack config**.
- Tailwind CSS (brand tokens live in Tailwind config + CSS variables).
- Prisma ORM. **SQLite for dev, Postgres for prod.** Write the schema so switching the datasource `provider` is the *only* change needed to deploy. Never ship SQLite to Vercel serverless (no persistent disk).
- `next/font/google` for fonts (no CDN `<link>` tags).
- **Server Actions** for the form submit (`useActionState` for pending/errors). A Route Handler is used only for CSV export. No client-side data-fetching library.

## Commands (after scaffolding)

These follow from the chosen stack; they won't exist until `create-next-app` + Prisma are set up.

```bash
npm run dev            # serve the survey at / (Definition of Done: submit writes a row + shows thank-you)
npm run build          # production build
npm run lint           # next lint
npx prisma migrate dev # apply schema / create migration (dev, SQLite)
npx prisma db seed     # seed (wire up per SPEC)
npx prisma studio      # inspect the local DB
```

No test framework is specified in the spec; confirm the intended approach before adding one.

## Non-obvious rules that are easy to get wrong

These are the constraints most likely to be violated by a well-meaning change. Treat them as hard requirements.

- **Persian copy is VERBATIM.** Every user-facing string (headers, questions, scale labels, footer, button text) is fixed Persian in `SPEC.md`. Do not translate, paraphrase, "improve", or fix perceived typos. Build the survey **data-driven** from the `QUESTIONS` / `SCALE_*` config in the spec.
- **Score mapping is fixed and independent of RTL.** Stored value = `array index + 1`. Index 0 (most-negative label) = 1; index 4 (most-positive) = 5. RTL flips only the *visual* order (index 0 renders rightmost). Do **not** let layout/visual position change the stored score.
- **Persian digits in the UI.** Render question numbers as Persian digits (۱–۷) via a `toPersianDigits()` helper.
- **Phone normalization.** Accept Persian (۰۹…) / Arabic digits, normalize to Latin `09…`. Light format check only — never hard-reject.
- **Ratings are optional.** Don't hard-block submit when some ratings are blank (launch-day guests skip). Only reject a *fully empty* submission, with a gentle inline message. Prevent double-submit.
- **CSV export must be UTF-8 with a BOM** so Persian opens correctly in Excel.
- **Privacy:** store `userAgent` only. Do **not** store IP or any tracking.
- **RTL + a11y are acceptance criteria**, not polish: `lang="fa"` / `dir="rtl"` at the root, rating groups as real radio groups (keyboard-operable, visible focus), `aria-hidden` on the SVG badge, tap targets ≥ 44px, Lighthouse ≥ 90 mobile.

## Architecture (target shape from the spec)

- **`/`** — public survey. Client tracks selected value per question; submit posts via a Server Action. On success → thank-you state (route to `/thanks` or swap in place); block duplicate resubmits.
- **`/thanks`** — standalone thank-you screen (for the redirect path).
- **`/admin`** — protected dashboard. Gate with a single `ADMIN_PASSWORD` env var (login form → httpOnly cookie, or Basic Auth via middleware — no user accounts). Shows total responses, average score per question (0–5 bar), per-question distribution, a table of Q7 write-ins with name/phone/timestamp, and a CSV export button.
- **Data:** one `Response` model (`q1`–`q6` `Int?` 1..5, `orderNote` for Q7, optional `name`/`phone`, `userAgent`, `createdAt`). See the Prisma block in `SPEC.md`.
- **Suggested components:** `SurveyForm`, `RatingQuestion`, `TextQuestion`, `ContactFields`, `Brand`, `admin/*`.

## Brand

Brand tokens (CSS variables), the inline three-bar SVG logo, and font roles (**Vazirmatn** body/UI, **Archivo Black** for the "Leno" wordmark only — stays LTR, optional **JetBrains Mono** for numeric accents) are specified precisely in `SPEC.md` §"Brand tokens" / "Logo mark". Copy them exactly. Flat and warm — no gradients, no heavy drop-shadow cards.

## Environment variables

- `DATABASE_URL` — SQLite locally, Postgres in prod.
- `ADMIN_PASSWORD` — gates `/admin`.

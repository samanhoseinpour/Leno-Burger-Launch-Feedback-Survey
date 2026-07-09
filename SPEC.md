# SPEC — Leno Launch Feedback Survey

> Product & build specification for the Leno feedback app.
> All user-facing copy is Persian (Farsi) and must be kept **verbatim**. The app is **RTL**.

## Overview

You are building a small production web app: a **digital customer-feedback survey** for **Leno**, a burger restaurant, used on its opening day. Guests scan a QR code at the table, fill the survey on their phone in Persian, and submit. Staff review results on a protected admin page.

This replaces a printed A4 feedback card — keep the brand identity, but **adapt the layout to a mobile-first single-column flow** (tap-to-select rating options), not a print sheet.

## Tech stack (use exactly this)

- **Next.js (latest stable — 16.x, App Router) + React 19 + TypeScript**. Scaffold with `npx create-next-app@latest`. Requires **Node.js 20+**. Turbopack is the default bundler in 16 (no `--turbopack` flag needed); don't add a custom webpack config.
- **Tailwind CSS** for styling (define brand tokens in the Tailwind config + CSS variables)
- **Prisma** ORM with **Postgres (Neon) in every environment**. ⚠️ SQLite is never used — Vercel serverless has no persistent disk. (This spec originally called for SQLite in dev; running one engine everywhere removes a class of dev/prod drift, so the datasource `provider` is `postgresql` throughout.)
- **next/font/google** for fonts (no CDN `<link>` tags)
- **Server Actions** for the form submit (use `useActionState` for pending/errors); Route Handler only for the CSV export. No client-side data-fetching library.
- Deployable to **Vercel**

## Language, direction, fonts

- Set `lang="fa"` and `dir="rtl"` at the root layout.
- **Vazirmatn** — all Persian body/UI text (weights 300–900).
- **Archivo Black** — the "Leno" wordmark only (this stays LTR).
- **JetBrains Mono** — small meta/numeric accents only (optional).
- Render question numbers as **Persian digits** (۱ ۲ ۳ ۴ ۵ ۶ ۷). Provide a `toPersianDigits()` helper.

## Brand tokens

```css
--red: #b91c1c; /* primary */
--cream: #fff4e6; /* on-red text / light surfaces */
--cream2: #f8e9d2; /* alt header (cream theme) */
--ink: #1a1614; /* body text */
--paper: #fbf7f0; /* page background */
--muted: #6b6258; /* secondary text */
--line: rgba(26, 22, 20, 0.14); /* hairlines */
```

Header band uses `--red` background with `--cream` text by default. Rounded, generous spacing, warm paper background. No gradients, no drop-shadow-heavy cards — flat, confident, appetizing.

## Logo mark (inline SVG — three stacked rounded bars)

Use as the badge inside a circle (red circle + cream mark on the header, cream circle + red mark in the footer):

```html
<svg viewBox="10 32 100 70" aria-hidden="true">
  <g fill="currentColor">
    <rect x="20" y="40" width="80" height="14" rx="7" />
    <rect x="14" y="60" width="92" height="14" rx="3" />
    <rect x="20" y="80" width="80" height="14" rx="7" />
  </g>
</svg>
```

Wordmark: **Leno** in Archivo Black next to the badge.

## Survey content (VERBATIM — build data-driven from this config)

**Header**

- Title (h1): `تجربه‌ی شما در لنو چگونه بود؟`
- Subtitle: `حضور شما مایه‌ی افتخار ماست؛ چند لحظه وقت بگذارید و نظر ارزشمندتان را با ما در میان بگذارید.`
- Instruction line: `لطفاً دایرهٔ گزینه‌ای که با نظر شما همخوانی دارد را پر کنید.` ("fill in the circle" — matches the tap-to-fill interaction)
- No tag chip — the launch-day `افتتاحیه` badge was removed once the opening passed; the header shows just the Leno logo.

**Rating questions** — 5-point scale, one selectable filled circle per option. **Stored value = array index + 1**, so index 0 (the most-negative label, e.g. `خیلی ضعیف`) = 1 and index 4 (the most-positive, e.g. `خیلی خوب`) = 5 — this mapping is fixed and independent of visual position. RTL only flips the _visual_ order (index 0 renders rightmost, index 4 leftmost); do not let the layout change the score.

```ts
const SCALE_QUALITY = ['خیلی ضعیف', 'ضعیف', 'متوسط', 'خوب', 'خیلی خوب']; // 1..5
const SCALE_VALUE = ['اصلاً', 'کم', 'متوسط', 'زیاد', 'کاملاً']; // 1..5
const SCALE_RECO = ['به‌هیچ‌وجه', 'بعید', 'شاید', 'احتمالاً', 'قطعاً']; // 1..5

const QUESTIONS = [
  {
    id: 'q1',
    text: 'طعم برگر را چگونه ارزیابی می‌کنید؟',
    scale: SCALE_QUALITY,
  },
  { id: 'q2', text: 'اندازه‌ی پرس چطور بود؟', scale: SCALE_QUALITY },
  {
    id: 'q3',
    text: 'کیفیت و تازگی مواد اولیه چطور بود؟',
    scale: SCALE_QUALITY,
  },
  {
    id: 'q4',
    text: 'سرعت آماده‌سازی و سرو سفارش چگونه بود؟',
    scale: SCALE_QUALITY,
  },
  { id: 'q5', text: 'کیفیت لنو، ارزش قیمتش را داشت؟', scale: SCALE_VALUE },
  {
    id: 'q6',
    text: 'لنو را به دوستان و آشنایان خود پیشنهاد می‌دهید؟',
    scale: SCALE_RECO,
  },
];
```

**Open question (Q7, free text, textarea)**

- `امروز چه سفارشی دادید و کدام مورد بیشتر مورد پسند شما بود؟`

**Contact block (all optional)** — heading: `برای در ارتباط ماندن با لنو (اختیاری)`

- Field `نام` → `name`
- Field `شماره تماس` → `phone` (Iranian mobile; accept Persian/Arabic digits, normalize to Latin)

**Footer / thank-you copy**

- `از اینکه مهمان لنو بودید سپاسگزاریم.`
- `مشتاقانه در انتظار دیدار دوباره‌ی شما هستیم. — با احترام، مجموعه‌ی لنو`

## Data model (Prisma)

```prisma
model Response {
  id        String   @id @default(cuid())
  createdAt DateTime @default(now())
  q1        Int?     // 1..5
  q2        Int?
  q3        Int?
  q4        Int?
  q5        Int?
  q6        Int?
  orderNote String?  // Q7 free text
  name      String?
  phone     String?
  userAgent String?
}
```

## Pages & routes

The four public pages share the site chrome — a sticky RTL nav and a slim footer —
through the `(site)` route group. `/admin` sits **outside** that group on purpose, so
it never inherits the chrome and stays a self-contained staff surface.

1. **`/` — home hub** (public): the Leno hero plus two cards, one to the menu and one to the survey.
2. **`/menu`** (public): a branded "coming soon" placeholder until the real menu is ready.
3. **`/survey` — the survey** (public, mobile-first)
   - Header band, instruction, the 6 rating questions, Q7 textarea, optional contact fields, submit button (`ثبت نظر`).
   - Client-side: track selected value per question; submit posts to the server via a Server Action.
   - On success the form **swaps in place** for the thank-you state (footer copy + checkmark), which also blocks duplicate resubmits; the button is disabled while pending.
4. **`/thanks`** — the same thank-you screen as a standalone route.
5. **`/admin` — protected dashboard**
   - Gate with a single `ADMIN_PASSWORD` env var (login form → httpOnly cookie). No user accounts.
   - Show: total responses; **average score per question** (with the Persian question text + a 0–5 bar); a **distribution bar** per question (count per option); a **table** of Q7 write-ins with name/phone and timestamp.
   - **Export CSV** button (UTF-8 with BOM so Persian opens correctly in Excel).
   - Because the site nav does not render here, the **login screen and the dashboard each carry their own "بازگشت به خانه" link** back to `/`.

## Behavior & validation

Validation lives in `src/lib/validation.ts` (Zod). The **same schema runs on the client**
(instant inline errors) **and on the server** (the source of truth), so the two cannot drift.

- Ratings **q1–q6 are required** (1–5), each with a gentle inline message when unanswered.
  ⚠️ This is a deliberate override of this spec's original "ratings are optional, never
  hard-block" rule — an incomplete response is worth much less than a complete one, and in
  practice guests do finish all six. **Do not revert it to optional.**
- Q7 (`orderNote`) and `name` stay **optional** free text, with generous length caps.
- `phone` is **optional**, but a non-empty value must normalize to a valid Iranian mobile
  (`09xxxxxxxxx`). Persian ۰۹… / Arabic digits are normalized to Latin first. Empty is fine.
- Prevent double-submit (disable button while pending + swap the form for the thank-you).
- Store `userAgent`; do **not** store IP or any tracking.
- Graceful server error state with a retry.

## Non-functional requirements

- **Mobile-first**, works great one-handed; tap targets ≥ 44px; the selectable rating circles are large and obviously toggle to a **filled** state on select.
- Full **RTL correctness** (spacing, alignment, form fields, admin tables).
- **Accessible**: rating groups are proper radio groups with labels, keyboard operable, visible focus, `aria` on the SVG-only badge.
- Fast: fonts via `next/font` with `display: swap`; no layout shift; Lighthouse ≥ 90 on mobile.
- Clean component structure, e.g. `SurveyForm`, `RatingQuestion`, `TextQuestion`, `ContactFields`, `Brand`, `admin/*`.
- README with: env vars (`DATABASE_URL`, `ADMIN_PASSWORD`), `prisma migrate` + seed steps, and local run.

## Search indexing

The site currently runs on a **temporary domain**, so **no page may appear in Google.**
`src/lib/seo.ts` holds the single switch, `SEARCH_INDEXING = false`. Two layers read it:

- `src/app/layout.tsx` → `<meta name="robots" content="noindex, nofollow, nocache">` (plus a
  `googlebot` variant with `noimageindex`) on every HTML page, inherited by all routes.
- `next.config.ts` → an `X-Robots-Tag: noindex, nofollow` response header on **every** route.
  This is what covers responses with no `<head>`, such as the CSV export.

`src/app/robots.ts` **allows** crawling and deliberately does not read the flag. A `Disallow: /`
would stop crawlers from fetching a page, so they would never read its `noindex` — and Google
can still list a disallowed URL it finds via a link. Allowing the fetch is what makes the
`noindex` effective.

`/admin` pins `robots: { index: false, follow: false }` on its own metadata, so it stays out of
search even after the flag is switched on.

**To launch on the real domain:** set `SEARCH_INDEXING = true` and redeploy. Nothing else changes.

## Definition of done

- `npm run dev` serves the site on **port 3001**; the survey lives at `/survey`, and submitting writes a row and shows the thank-you.
- `/admin` (behind the password) shows live averages, distributions, write-ins, and exports a correct Persian CSV.
- App is fully RTL, uses the exact brand tokens/fonts/logo and **verbatim** Persian copy above, and deploys to Vercel with Postgres.
- No page is indexable while `SEARCH_INDEXING` is `false`.

## Stretch (only after the above works)

- QR-code generator page for the table tents (points to `/survey`).
- Per-question average trend over time on the dashboard.
- Optional Google Sheets mirror of each response.

# SPEC — Leno Launch Feedback Survey

> Product & build specification for the Leno feedback app.
> All user-facing copy is Persian (Farsi) and must be kept **verbatim**. The app is **RTL**.

## Overview

You are building a small production web app: a **digital customer-feedback survey** for **Leno**, a burger restaurant, used on its opening day. Guests scan a QR code at the table, fill the survey on their phone in Persian, and submit. Staff review results on a protected admin page.

This replaces a printed A4 feedback card — keep the brand identity, but **adapt the layout to a mobile-first single-column flow** (tap-to-select rating options), not a print sheet.

## Tech stack (use exactly this)

- **Next.js (latest stable — 16.x, App Router) + React 19 + TypeScript**. Scaffold with `npx create-next-app@latest`. Requires **Node.js 20+**. Turbopack is the default bundler in 16 (no `--turbopack` flag needed); don't add a custom webpack config.
- **Tailwind CSS** for styling (define brand tokens in the Tailwind config + CSS variables)
- **Prisma** ORM. Dev DB: **SQLite**. Production: **Postgres** (Vercel Postgres / Supabase / Neon) — write the schema so switching the datasource `provider` is the only change. ⚠️ Do not ship SQLite to Vercel serverless (no persistent disk).
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

1. **`/` — the survey** (public, mobile-first)
   - Header band, instruction, the 6 rating questions, Q7 textarea, optional contact fields, submit button (`ثبت نظر`).
   - Client-side: track selected value per question; submit posts to the server.
   - On success → **thank-you state** (route to `/thanks` or swap in place) showing the footer copy and a checkmark; do not allow duplicate resubmits of the same filled form.
2. **`/thanks`** — standalone thank-you screen (in case of redirect).
3. **`/admin` — protected dashboard**
   - Gate with a single `ADMIN_PASSWORD` env var (simple login form → httpOnly cookie, or Basic Auth via middleware). No user accounts.
   - Show: total responses; **average score per question** (with the Persian question text + a 0–5 bar); a **distribution bar** per question (count per option); a **table** of Q7 write-ins with name/phone and timestamp.
   - **Export CSV** button (UTF-8 with BOM so Persian opens correctly in Excel).

## Behavior & validation

- Ratings are **optional but encouraged**; do not hard-block submit if some are blank (launch-day guests skip). Q7 and contact are optional. Reject a fully-empty submission with a gentle inline message.
- Normalize phone digits (Persian ۰۹… / Arabic → Latin `09…`); light format check, no hard rejection.
- Prevent double-submit (disable button + guard).
- Store `userAgent`; do **not** store IP or any tracking.
- Graceful server error state with a retry.

## Non-functional requirements

- **Mobile-first**, works great one-handed; tap targets ≥ 44px; the selectable rating circles are large and obviously toggle to a **filled** state on select.
- Full **RTL correctness** (spacing, alignment, form fields, admin tables).
- **Accessible**: rating groups are proper radio groups with labels, keyboard operable, visible focus, `aria` on the SVG-only badge.
- Fast: fonts via `next/font` with `display: swap`; no layout shift; Lighthouse ≥ 90 on mobile.
- Clean component structure, e.g. `SurveyForm`, `RatingQuestion`, `TextQuestion`, `ContactFields`, `Brand`, `admin/*`.
- README with: env vars (`DATABASE_URL`, `ADMIN_PASSWORD`), `prisma migrate` + seed steps, local run, and the one-line change to move from SQLite to Postgres for deploy.

## Definition of done

- `npm run dev` serves the survey at `/`, submitting writes a row and shows the thank-you.
- `/admin` (behind the password) shows live averages, distributions, write-ins, and exports a correct Persian CSV.
- App is fully RTL, uses the exact brand tokens/fonts/logo and **verbatim** Persian copy above, and deploys to Vercel with Postgres.

## Stretch (only after the above works)

- QR-code generator page for the table tents (points to `/`).
- Per-question average trend over time on the dashboard.
- Optional Google Sheets mirror of each response.

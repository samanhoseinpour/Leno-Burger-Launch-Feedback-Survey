# Leno — Launch Feedback Survey

A mobile-first, right-to-left, **Persian** customer-feedback survey for **Leno**, a
burger restaurant, used on opening day. Guests scan a table QR code, rate their
experience on their phone, and submit. Staff review aggregated results on a
password-protected `/admin` page and can export the raw data as CSV.

Built to the specification in [`SPEC.md`](./SPEC.md).

## Stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS v4**
- **Prisma ORM** — Postgres (Neon) in every environment
- **Server Actions** for the form submit; a Route Handler only for the CSV export
- Fonts via `next/font/google` (Vazirmatn for Persian UI, Archivo Black for the
  "Leno" wordmark, JetBrains Mono for numeric accents)

## Requirements

- **Node.js 20+** (developed on 24)

## Getting started

```bash
# 1. Install dependencies
npm install

# 2. Set up environment variables
cp .env.example .env
#   Set DATABASE_URL to your Neon connection string (a Neon dev branch is ideal).
#   Set ADMIN_PASSWORD to any value — it gates /admin.

# 3. Create the tables (and optionally seed sample data)
npx prisma migrate deploy   # applies migrations to your Postgres database
npm run db:seed             # optional: sample responses so /admin has data

# 4. Run it
npm run dev                 # http://localhost:3000
```

Fill in the survey at `/` — a submission writes a row and shows the thank-you
screen. Review results at `/admin` (enter your `ADMIN_PASSWORD`).

## Scripts

| Script | Purpose |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Production build (runs `prisma generate` + `prisma migrate deploy` first) |
| `npm run start` | Serve the production build |
| `npm run lint` | Run ESLint |
| `npm run db:seed` | Seed sample responses |
| `npx prisma studio` | Inspect the local database |

## Admin

`/admin` is gated by a single `ADMIN_PASSWORD` env var — no user accounts. Logging
in sets an `httpOnly` session cookie (a sha256 of the password; the raw password is
never stored client-side). The dashboard shows total responses, the average score
and distribution per question, and the free-text write-ins, plus a **CSV export**
(UTF-8 with a BOM, so Persian opens correctly in Excel).

## Privacy

Only the browser `userAgent` is stored with each response. No IP address and no
tracking are collected.

## Deploying to Vercel (Neon Postgres)

The datasource is already Postgres — no code change needed. SQLite is never used
(serverless has no persistent disk).

1. Push this repo to GitHub and import it in Vercel (**New Project** → select the repo).
2. Add the **Neon** integration from the Vercel Marketplace to the project. It
   provisions a Postgres database and injects `DATABASE_URL` into every
   environment automatically.
3. Add the `ADMIN_PASSWORD` environment variable in Vercel (**Project → Settings →
   Environment Variables**). Use a strong value.
4. Deploy. The `build` script runs `prisma generate && prisma migrate deploy`, so
   the `Response` table is created on the first deploy and kept in sync afterward.

## Notes

- The app is fully RTL (`lang="fa"`, `dir="rtl"`). All guest-facing copy is Persian
  and kept **verbatim** from the spec — it lives in
  [`src/lib/survey.ts`](./src/lib/survey.ts).
- Rating scores are stored as the option's **array index + 1** (1–5), fixed and
  independent of the RTL visual order.
- Question numbers render as Persian digits via `toPersianDigits()`; phone numbers
  are normalized (Persian/Arabic digits → Latin `09…`) via `normalizePhone()`.

## Project structure

```
prisma/
  schema.prisma        # Response model; provider = postgresql (Neon)
  seed.mjs             # sample responses
src/
  app/
    page.tsx           # the survey
    actions.ts         # submitFeedback Server Action
    thanks/            # standalone thank-you screen
    admin/             # password-gated dashboard + login/logout actions
    api/admin/export/  # CSV Route Handler (UTF-8 + BOM)
  components/          # SurveyForm, RatingQuestion, Brand, admin/*, …
  lib/
    survey.ts          # verbatim copy + questions/scales (source of truth)
    format.ts          # toPersianDigits, normalizePhone
    prisma.ts          # PrismaClient singleton
    auth.ts            # admin session helpers
    stats.ts           # dashboard aggregation
```

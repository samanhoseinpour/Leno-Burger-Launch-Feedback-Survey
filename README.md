# Leno — Launch Feedback Survey

A mobile-first, right-to-left, **Persian** customer-feedback survey for **Leno**, a
burger restaurant, used on opening day. Guests scan a table QR code, rate their
experience on their phone, and submit. Staff review aggregated results on a
password-protected `/admin` page and can export the raw data as CSV.

Built to the specification in [`SPEC.md`](./SPEC.md).

## Stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS v4**
- **Prisma ORM** — SQLite in development, Postgres in production
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
#   DATABASE_URL is preset for local SQLite.
#   Set ADMIN_PASSWORD to any value — it gates /admin.

# 3. Create the local database (and optionally seed sample data)
npx prisma migrate dev      # applies the schema to prisma/dev.db
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
| `npm run build` | Production build (runs `prisma generate` first) |
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

## Deploying to Vercel (Postgres)

SQLite has no persistent disk on serverless — use Postgres in production.

1. Provision Postgres (Vercel Postgres, Neon, or Supabase).
2. In [`prisma/schema.prisma`](./prisma/schema.prisma), change the datasource
   `provider` — this is the only code change needed:
   ```prisma
   datasource db {
     provider = "postgresql" // was "sqlite"
     url      = env("DATABASE_URL")
   }
   ```
3. In your Vercel project settings, add the environment variables `DATABASE_URL`
   (the Postgres connection string) and `ADMIN_PASSWORD`.
4. Create the tables in Postgres. The committed migration is SQLite-specific, so
   the simplest path is:
   ```bash
   DATABASE_URL="<your-postgres-url>" npx prisma db push
   ```
   (For a migration history instead, delete `prisma/migrations/` and run
   `npx prisma migrate dev --name init` against the Postgres database.)
5. Deploy. The `build` script runs `prisma generate` automatically.

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
  schema.prisma        # Response model; provider = sqlite (dev)
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

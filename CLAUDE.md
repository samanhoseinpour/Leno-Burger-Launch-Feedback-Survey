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
A small public site (home hub + a database-backed menu) now frames the survey, and `/admin`
is a hub over two sections: the survey dashboard and a menu manager.

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

`npm run build` talks to the database — and so does `npx next build`, because `/menu` is
prerendered from the `MenuCategory` / `MenuItem` tables. There is no longer a way to compile
without a reachable `DATABASE_URL`.

No test framework is set up; confirm the intended approach before adding one.

## Non-obvious rules that are easy to get wrong

These are the constraints most likely to be violated by a well-meaning change. Treat them as hard requirements.

- **Persian copy is VERBATIM.** Every guest-facing survey string (headers, questions, scale labels, footer, button text) is fixed Persian in `SPEC.md`, and lives in `src/lib/survey.ts`. Do not translate, paraphrase, "improve", or fix perceived typos. The survey is built data-driven from `QUESTIONS` / `SCALE_*`. Interface microcopy that is *not* on the printed card (`UI_COPY`, `SITE_COPY`, `VALIDATION_MESSAGES`) is written in the app's own voice and may be edited.
- **Score mapping is fixed and independent of RTL.** Stored value = `array index + 1`. Index 0 (most-negative label) = 1; index 4 (most-positive) = 5. RTL flips only the *visual* order (index 0 renders rightmost). Do **not** let layout/visual position change the stored score.
- **Ratings q1–q6 are REQUIRED**, and `phone` is validated when non-empty. This deliberately overrides the spec's original "ratings optional, never hard-block" rule. **Do not revert it.** Validation is one Zod schema in `src/lib/validation.ts`, shared by the client and the Server Action so they cannot drift.
- **Every menu Server Action must call `isAdmin()` itself.** A Server Action is a public HTTP endpoint; the `isAdmin()` check on the admin *pages* does nothing for it. Likewise, do **not** move the page gate into an `admin/layout.tsx`: Next renders layouts and pages in parallel, so a layout that discards `children` still lets the page's Prisma query run. Gate at the top of each page, above the query, and again inside each action.
- **`/menu` is cached, and only `revalidatePath("/menu")` refreshes it.** A Prisma call is invisible to Next's cache, so without the explicit `export const revalidate` the page would prerender at *build* time and the menu would freeze until the next deploy. Every menu mutation ends with `revalidatePath("/menu")` (the URL path — never `"/(site)/menu"`). Admin pages are `force-dynamic` and a Server Action re-renders its own route, so they need no revalidation.
- **New menu rows append at `max(sortOrder) + 1`, never `count()`.** Deleting a row leaves a gap, after which `count()` ties with an existing row and the newcomer lands wherever the `id` tie-break puts it. Reorders rewrite `sortOrder` for the whole sibling list inside one `$transaction`, reading with `orderBy: [{ sortOrder: "asc" }, { id: "asc" }]` so ties are deterministic. Changing an item's category also re-appends it.
- **`prisma/seed.mjs` is destructive dev-only sample data.** It clears and reseeds `Response`. Never add `menuItem.deleteMany()` / `menuCategory.deleteMany()` to it — `npm run db:seed` would wipe the real menu. The menu ships as a data migration instead.
- **Menu icons: import `lucide`, never `lucide-react`.** Every `lucide-react` component routes through its `<Icon>`, which is `"use client"` — importing one would drag the icon runtime across the client boundary and make guests download JS for a static glyph. The `lucide` and `@lucide/lab` packages export plain `[tag, attrs][]` path data with no React in it, so `MenuGlyph` renders it from a Server Component and `/menu` ships **zero** icon JavaScript. The house-drawn `fries` glyph is the same shape of data (nothing in either library draws fries).
- **An icon slug is a registry key, not a DB enum.** `MenuCategory.icon` / `MenuItem.icon` are nullable `TEXT`. `MENU_ICON_SLUGS` in `src/lib/menu-icons.ts` is the source of truth; always read through `resolveIconSlug()`, which validates and degrades to `utensils`. Retiring a slug must never break `migrate deploy` or 500 a page on an old row. Adding a slug fails to compile until `GLYPHS` in `MenuGlyph.tsx` has a glyph for it.
- **`MENU_ICON_SLUGS` must stay a flat `as const` tuple.** `z.enum()` and the two `Record<MenuIconSlug, …>` maps all need its literal type; building it by `.flatMap()`-ing `MENU_ICON_GROUPS` would collapse it to `string[]` and silently disable both exhaustiveness checks. `MENU_ICON_GROUPS` is presentation only (the picker's headings), and a compile-time `UngroupedSlug` guard in the same file fails the build if a slug belongs to no group.
- **The icon set is 26 slugs, scoped to a burger joint.** Alcohol (`lucide`'s `Beer`/`Wine`/`Martini`, `@lucide/lab`'s `cocktail`/`goblet`/`bottleChampagne`), pork, seafood, the coffee-shop drinks and the whole bakery/candy aisle are excluded **on purpose** — a picker of 58 tiles is a picker nobody reads. Do not "complete" any of those sets. The exclusions are listed in `menu-icons.ts`.
- **`MenuItem.icon = null` means "inherit the category's icon".** That is the default and the common case — do not backfill items. Only a dish that should differ from its category gets its own slug. `MenuCategory.icon = null` falls back to the generic glyph instead.
- **`discountPercent` is a percentage over `priceToman`, and the discounted number is never stored.** `priceToman` is always the ORIGINAL price — the one printed with a line through it. Everything that needs the price a guest actually pays derives it through `discountedToman()` in `src/lib/menu-price.ts` (exact arithmetic, rounded only to the whole Toman). A second currency column would drift the moment someone edits the percent and only one of the two writes lands. A discount on a row with no price is a validation error, not a silent no-op, and a submitted `0` normalizes to `null`. One display exception: owners back-compute originals from a round pay price (580,000 at 25% off stores 773,333), so `/menu`'s strikethrough renders through `roundedOriginalToman()` (nearest 1,000). That is display-only — the admin manager and `PricePreview` keep showing the stored figure staff must read back, and the pay price is never rounded.
- **A menu row is an «آیتم», never a «غذا».** A drink, a dessert and a side are rows too, so the admin area calls them all آیتم. Guest-facing copy still says غذا where it actually means food. Every mutation toast and both delete prompts name the row instead: «چیز برگر» حذف شد.
- **A flash code is a registry key too.** `MENU_FLASH` in `src/lib/menu-copy.ts` names the toast each mutation shows; it arrives in a URL anyone can type, so every read goes through `resolveFlash()` and an unknown code degrades to "no toast". Four rules travel with it:
  - **`redirect()` must sit OUTSIDE the `try`/`catch`.** It signals by throwing `NEXT_REDIRECT`, and a `catch` swallows it. The fire-and-forget actions compute a `FlashCode` inside the block and redirect after it.
  - **The `&n=` nonce is load-bearing.** Delete two rows in a row and `?flash=` is byte-identical both times, so React never remounts `<Toast>`, never restarts its dismiss timer, and the second toast silently never appears. The page keys `<Toast>` on the nonce.
  - **The `&name=` is untrusted, and `resolveFlashName()` is the only way to read it.** It collapses whitespace *before* stripping C0 controls — tab and newline **are** C0 controls, so the other order deletes them and glues the surrounding words into one — then caps the length. React escapes the value on render, so this is a layout guard, not an XSS guard. A row that was already gone redirects with no name and falls back to the generic sentence.
  - **Strip the param with `history.replaceState`, never `router.replace()`.** The latter is a server round-trip that re-runs the manager's Prisma query and flickers the page. The page reads `searchParams` as a *prop*, so the native call re-writes the URL without re-rendering anything.
  - Move ↑/↓ deliberately flash nothing: the row visibly jumps, and a toast per arrow click is noise.
  - `deleteMenuItem` / `deleteMenuCategory` read the name off the row Prisma **returns from `delete()`** — a second later there is nothing left to select it from.
- **`toPersianWords()` returns words only** — no «تومان». `format.ts` stays copy-free; the unit lives in `MENU_COPY.priceUnit` and callers concatenate. Note 1000 reads «هزار» (not «یک هزار») while 1,000,000 keeps its «یک میلیون».
- **`NavCard` is one anchor, root to tip.** Nothing interactive may go inside it — an `<a>` may not contain an `<a>` or a `<button>`. The "see the live public page" links live in `AdminShell`'s tab row instead, which is why the card needs no stretched-link trick.
- **The price input is the form's only controlled field.** `PriceFields` groups digits as you type (`80,000`) and must preserve the caret by DIGIT index, in a layout effect — React writes `el.value` after `onChange` returns and would otherwise throw the caret to the end. It submits `"80,000"`; no schema change is needed, because `priceField` already strips every non-digit.
- **`DeleteConfirm` closes on `pointerdown` outside its own wrapper, and that one listener is also the "only one panel open at a time" rule.** Opening another row's panel means pressing that row's حذف button, which is outside this row's wrapper — so this panel closes on the way down, with no cross-row coordination, no context and no shared store. Three things travel with it: the listener must be `pointerdown` and not `click` (a `click`-only listener misses the button that is about to open the next panel, and `element.click()` in a test dispatches no `pointerdown` at all, which will lie to you); the wrapper ref must contain **both** the trigger and the panel, so that pressing حذف while open falls through to the trigger's own toggle instead of being eaten as an outside click; and the effect only attaches while `open`, so the very `pointerdown` that opened the panel is already dispatched before React attaches the listener and can never close what it just opened. `<details>` cannot do any of this — it toggles, and two of them sit open at once. That is why this one row control is not a server component.
- **An open panel covers the *next* row's حذف button.** The panel is `top-full … w-56` and ~102px tall, so it overlays the row directly beneath it. A click there lands on the panel's prompt text — harmless (the confirm button sits lower), but the next row's button does nothing until the panel is dismissed. Do not "fix" this by shrinking the panel into the row; the honest fix is the Popover API + CSS anchor positioning, which is only now Baseline (Safari 26 / Firefox 147).
- **The item `<ul>` in `MenuManager` must never clip.** Each row's delete confirmation is an absolutely positioned panel hanging below its button, so `overflow-hidden` *or* `overflow-clip` on that list makes the حذف button look dead: it opens a panel you cannot see. The rows paint no background of their own, so the rounded corners hold without clipping.
- **The `/menu` card is `sm:overflow-clip`, never `overflow-hidden`.** `hidden` makes the card a scroll container, which silently disables `position: sticky` on the category rail from the `sm` breakpoint up (the rail keeps working on mobile, so this breaks in exactly one half of the viewports). `clip` still clips the red hero to the rounded corners.
- **Rail chips stay real `<a href="#cat-…">` anchors.** Scroll-spy is a JS-only enhancement; the menu must navigate with JavaScript disabled. The rail's scroll offset is measured from its own `getBoundingClientRect().bottom`, not by parsing CSS vars, so it can never drift from the rendered heights. The anchor is the 44px tap target and the pill you actually see is an inner `<span>` at 36px — do not shrink the anchor to make the chip look lighter.
- **`scroll-mt` on a menu section adds only `--rail-h` (+ `--rail-gap`), not `--nav-h`.** `html` already carries `scroll-padding-top: var(--nav-h)` and the two *stack* — repeating the nav height drops every anchored heading a further 4rem down the page. `--rail-h` must track the rail's real height, exactly as `--nav-h` tracks the nav's.
- **The rail's spy measures against a *reading line*, not the rail's bottom edge.** `READING_LINE_RATIO` (0.4) in `MenuCategoryRail` puts the line 40% of the way down the band between the rail's bottom and the viewport bottom; a section is current once its heading crosses it. A line at the rail's edge (the old `ACTIVE_SLOP`) meant a section the document is too **short** to scroll to the top could never become current: on a 1440×900 viewport the first chip stayed lit for 95% of the page and the last chip only ever lit via the 2px `bottomed` rule. Two bounds hold the ratio: it must stay well **above** the `--rail-gap` a chip click parks its section at (or every click lights the *previous* chip), and **below 0.5** (or tapping a short section hands the highlight to the next one the instant the guest scrolls).
- **A chip tap pins the highlight until the guest scrolls on purpose.** One smooth scroll fires dozens of `scroll` events; answering each made the rail stutter through every category it passed, and at the foot of the page the `bottomed` rule stole the tapped chip outright. Only `wheel` / `touchmove` / `keydown` release the pin — never `scroll`, which the tap's own animation fires.
- **Edits to `@theme` / `:root` CSS variables can survive a dev restart.** If a var reads back at its old value in the browser, the stale copy is in `.next` (`grep -rl "<old value>" .next` will find it). `rm -rf .next` and restart — deleting `.next/static/css` alone is not enough.
- **Persian digits in the UI.** Render question numbers as Persian digits (۱–۷) via `toPersianDigits()`. Prices are the exception: `formatToman()` uses `Intl.NumberFormat("fa-IR")`, which already emits Persian digits and the Persian thousands separator — do not pipe it through `toPersianDigits()`. Numerals render in `tabular-nums`, not `font-mono` (JetBrains Mono has no Persian glyphs; it is for Latin strings like phone numbers).
- **Phone normalization.** Accept Persian (۰۹…) / Arabic digits, normalize to Latin `09…` via `normalizePhone()` before validating. Price inputs accept the same digits via `toLatinDigits()`.
- **The site must not be indexed.** `SEARCH_INDEXING = false` in `src/lib/seo.ts` is the single switch; see "Search indexing" below. Do not add a `Disallow: /` to `src/app/robots.ts` — it would defeat the `noindex`.
- **CSV export must be UTF-8 with a BOM** so Persian opens correctly in Excel.
- **Privacy:** store `userAgent` only. Do **not** store IP or any tracking.
- **RTL + a11y are acceptance criteria**, not polish: `lang="fa"` / `dir="rtl"` at the root, rating groups as real radio groups (keyboard-operable, visible focus), `aria-hidden` on the SVG badge, tap targets ≥ 44px, Lighthouse ≥ 90 mobile.

## Architecture

- **`src/app/(site)/`** — the public site, wrapped by `SiteChrome` (skip link + sticky nav + slim footer).
  - **`/`** — home hub: hero + cards to the menu and the survey.
  - **`/menu`** — the live menu, read from the database and grouped by category (ISR; see above). Each row leads with an icon tile; a sticky, scroll-spying category rail sits under the hero and pins beneath `SiteNav`. Descriptions render in parentheses. A discounted row carries a **solid** brand pill and strikes its original price; the sold-out pill stays soft so a row that is both stays legible.
  - **`/survey`** — the survey. A client component tracks the selected value per question; submit posts via a Server Action. On success the form swaps in place for the thank-you, which also blocks resubmits.
  - **`/thanks`** — the same thank-you screen as a standalone route.
- **`src/app/admin/`** — protected staff area, deliberately **outside** the `(site)` group so it never inherits the public chrome. Gated by a single `ADMIN_PASSWORD` (login form → httpOnly cookie holding a sha256 of the password; no user accounts). There is **no `layout.tsx`** — see the gate rule above.
  - **`/admin`** — hub: two `NavCard`s into the sections, nothing else.
  - **`/admin/survey`** — total responses, average score per question (0–5 bar), per-question distribution, a table of Q7 write-ins, CSV export.
  - **`/admin/menu`** — the menu manager. `MenuManager` is a *server* component: row controls (move ↑/↓, sold-out toggle, delete) are bare `<form action={…}>` buttons. Delete confirmation (`DeleteConfirm`) is the one exception — it holds client state, because `<details>` cannot light-dismiss (see the rule above). Create/edit live on their own routes (`items/new`, `items/[id]`, `categories/new`, `categories/[id]`) so each save `redirect`s to a freshly rendered page; only those two forms are client components. This is the one route that reads `searchParams`, for the `?flash=` toast.
  - `AdminShell` owns the masthead + tabs and takes `active` from the server page, so no `usePathname`. The tab row also carries the link out to the section's own live public page (`/admin/survey` → `/survey`, `/admin/menu` → `/menu`) in a new tab. Since there is no site nav here, **both the login screen and the shell carry their own back-to-home link.**
- **`src/app/api/admin/export/`** — the CSV Route Handler.
- **Data:** one `Response` model (`q1`–`q6` `Int?` 1..5, `orderNote` for Q7, optional `name`/`phone`, `userAgent`, `createdAt`), plus `MenuCategory` 1—n `MenuItem` (`name`, `description?`, `priceToman?`, `discountPercent?`, `icon?`, `available`, `sortOrder`). `MenuCategory` also carries `icon?`.
- **`src/components/menu/`** — `MenuGlyph.tsx` (slug → `<svg>`, server-safe, owns the house `fries` glyph) and `MenuCategoryRail.tsx` (the only client component on `/menu`; it takes each chip's icon as an already-rendered `ReactNode` from the server, which is what keeps `lucide` out of the guest bundle).
- **`src/components/admin/`** — `IconPicker.tsx` is the icon radio group shared by both menu forms: a real `<fieldset>` of radios (one nested fieldset per `MENU_ICON_GROUPS` heading), so it needs no client state and slots into the existing uncontrolled `<form action={formAction}>`; `usedSlugs` dots the icons another row already claimed without disabling them. Because it is `"use client"` and imports `MenuGlyph`, all 26 glyphs ship in the *admin* bundle — fine, it is staff-only, and `/menu` is untouched. `PriceFields.tsx`, `Toast.tsx` and `DeleteConfirm.tsx` are the only other client components in the admin area.
- **`src/lib/`** — `survey.ts` (verbatim copy + questions), `site.ts` (site-chrome copy + nav items), `menu-copy.ts` (admin-area copy + the `MENU_FLASH` toast registry + `resolveFlash`/`resolveFlashName`), `menu-icons.ts` (icon slugs + labels + groups + `resolveIconSlug`; deliberately React-free so `menu-validation.ts` can import it), `menu-price.ts` (`discountedToman`, React-free for the same reason), `menu-usage.ts` (server-only `usedIconSlugs()`; kept out of `actions.ts`, where every export would become a public endpoint), `validation.ts` (Zod, feedback), `menu-validation.ts` (Zod, menu), `format.ts`, `seo.ts`, `auth.ts`, `stats.ts`, `prisma.ts`.

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

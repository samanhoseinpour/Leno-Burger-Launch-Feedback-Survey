import type { MenuItem } from "@prisma/client";
import type { Metadata } from "next";
import Link from "next/link";
import { Brand, LenoMark } from "@/components/Brand";
import { CenteredPanel } from "@/components/CenteredPanel";
import { MenuCategoryRail } from "@/components/menu/MenuCategoryRail";
import { MenuGlyph } from "@/components/menu/MenuGlyph";
import { formatPercent, formatToman } from "@/lib/format";
import { resolveIconSlug } from "@/lib/menu-icons";
import { menuImageSrc } from "@/lib/menu-images";
import { discountedToman, roundedOriginalToman } from "@/lib/menu-price";
import { prisma } from "@/lib/prisma";
import { MENU_COPY } from "@/lib/site";

export const metadata: Metadata = {
  title: "لنو | منو",
};

// Guests hit this on every table QR scan, while staff edit it a few times a day,
// so it is cached rather than queried per request. The freshness comes from
// `revalidatePath("/menu")` in the admin actions — this hour is only a backstop
// for a row edited straight in the database.
//
// It cannot be left to default: a Prisma call is invisible to Next's cache, so
// without an explicit `revalidate` the page prerenders at BUILD time and the menu
// freezes until the next deploy.
export const revalidate = 3600;

export default async function MenuPage() {
  const categories = await prisma.menuCategory.findMany({
    orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
    include: { items: { orderBy: [{ sortOrder: "asc" }, { id: "asc" }] } },
  });

  // An empty category is a staging area in the admin panel, not something a
  // guest should see. Sold-out items still show — dimmed — so the guest knows
  // the dish exists.
  const sections = categories.filter((category) => category.items.length > 0);

  if (sections.length === 0) return <ComingSoon />;

  return (
    <main
      id="main"
      tabIndex={-1}
      data-canvas="cream2"
      className="flex-1 sm:bg-cream2 sm:px-6 sm:py-10 lg:py-14"
    >
      {/* `overflow-clip`, never `overflow-hidden`: `hidden` would make this card
          a scroll container and silently break the sticky rail below. `clip`
          still clips the hero to the rounded corners. */}
      <div className="mx-auto w-full max-w-150 bg-paper sm:overflow-clip sm:rounded-4xl sm:border sm:border-line sm:shadow-[0_24px_60px_-32px_rgb(90_24_12/0.4)] md:max-w-3xl">
        <header className="bg-brand px-5 pb-10 pt-7 text-cream sm:px-9 sm:pb-12 sm:pt-9 lg:px-14 lg:pb-16 lg:pt-14">
          <Brand surface="red" />

          <div className="mt-8 lg:mt-12 lg:max-w-2xl">
            <h1 className="text-4xl font-black leading-tight sm:text-5xl lg:text-[clamp(3rem,5vw,4.5rem)]">
              {MENU_COPY.heroTitle}
            </h1>
            <p className="mt-4 text-sm leading-7 text-cream/85 sm:text-base lg:text-lg lg:leading-8">
              {MENU_COPY.heroSubtitle}
            </p>
          </div>
        </header>

        {/* One category needs no navigation. The glyphs are rendered here, on the
            server, and handed to the client rail as ReactNode. */}
        {sections.length > 1 && (
          <MenuCategoryRail
            label={MENU_COPY.railLabel}
            categories={sections.map((category) => ({
              id: category.id,
              name: category.name,
              icon: (
                <MenuGlyph
                  slug={resolveIconSlug(null, category.icon)}
                  className="size-4 shrink-0"
                />
              ),
            }))}
          />
        )}

        <div className="flex flex-col gap-10 p-5 sm:p-9 lg:gap-12 lg:p-14">
          {/* On `scroll-mt`: `html` already carries `scroll-padding-top:
              var(--nav-h)`, and the two stack. So a section only adds the rail
              that also hides it, plus `--rail-gap` of breathing room —
              repeating --nav-h here would drop every anchored heading a further
              4rem. The rail's `ACTIVE_SLOP` must stay larger than --rail-gap. */}
          {sections.map((category) => (
            <section
              key={category.id}
              id={`cat-${category.id}`}
              aria-labelledby={`cat-heading-${category.id}`}
              className="scroll-mt-[calc(var(--rail-h)+var(--rail-gap))]"
            >
              <h2
                id={`cat-heading-${category.id}`}
                className="text-xl font-black text-ink sm:text-2xl"
              >
                {category.name}
              </h2>

              <ul className="mt-4 divide-y divide-line overflow-hidden rounded-2xl border border-line">
                {category.items.map((item) => (
                  <MenuRow
                    key={item.id}
                    item={item}
                    categoryIcon={category.icon}
                  />
                ))}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}

function MenuRow({
  item,
  categoryIcon,
}: {
  item: MenuItem;
  categoryIcon: string | null;
}) {
  const finalPrice = discountedToman(item.priceToman, item.discountPercent);
  const imageSrc = menuImageSrc(item.name);

  return (
    <li
      className={`flex items-start gap-4 p-4 sm:p-5 ${
        item.available ? "" : "opacity-60"
      }`}
    >
      {/* Decorative either way: the dish name sits right beside it, so neither
          the photo nor the glyph adds information a screen reader needs. Both
          render at the same `size-16`, because a category can mix rows with
          and without a photo and the text column must stay aligned. */}
      {imageSrc ? (
        // eslint-disable-next-line @next/next/no-img-element -- a pre-sized 320px static JPEG; next/image would put a client runtime and the image optimizer between a guest and a 17 KB file
        <img
          src={imageSrc}
          alt=""
          width={320}
          height={320}
          loading="lazy"
          decoding="async"
          className="size-16 shrink-0 rounded-2xl border border-line bg-white object-cover"
        />
      ) : (
        <span
          aria-hidden="true"
          className="grid size-16 shrink-0 place-items-center rounded-2xl bg-cream2 text-brand"
        >
          <MenuGlyph
            slug={resolveIconSlug(item.icon, categoryIcon)}
            className="size-8"
          />
        </span>
      )}

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="font-bold text-ink">{item.name}</h3>
          {/* An item can be discounted AND sold out, so the two pills must not
              look alike: the offer is solid, the bad news is soft. */}
          {finalPrice != null && item.discountPercent != null && (
            <span className="inline-flex items-center rounded-full bg-brand px-2.5 py-0.5 text-[0.7rem] font-bold text-cream">
              {formatPercent(item.discountPercent)} {MENU_COPY.discount}
            </span>
          )}
          {!item.available && (
            <span className="inline-flex items-center rounded-full bg-brand/10 px-2.5 py-0.5 text-[0.7rem] font-medium text-brand">
              {MENU_COPY.soldOut}
            </span>
          )}
        </div>

        {/* Parentheses in logical order: bidi mirrors them for the RTL run. */}
        {item.description && (
          <p className="mt-1 text-sm leading-6 text-muted">
            ({item.description})
          </p>
        )}
      </div>

      {/* No price yet → show nothing, rather than a placeholder dash. */}
      {item.priceToman != null && (
        <div className="shrink-0 pt-3 text-end">
          <p className="whitespace-nowrap text-sm font-bold tabular-nums text-ink">
            {formatToman(finalPrice ?? item.priceToman)}{" "}
            <span className="font-normal text-muted">
              {MENU_COPY.priceUnit}
            </span>
          </p>
          {finalPrice != null && (
            <p className="whitespace-nowrap text-xs tabular-nums text-muted">
              <span className="sr-only">{MENU_COPY.priceBefore}: </span>
              <s>{formatToman(roundedOriginalToman(item.priceToman))}</s>
            </p>
          )}
        </div>
      )}
    </li>
  );
}

// Only reachable on a database with no menu rows — the real items ship as a
// migration. Kept so a fresh Neon branch degrades to something branded instead
// of an empty page.
function ComingSoon() {
  const copy = MENU_COPY.comingSoon;

  return (
    <CenteredPanel>
      <div className="mx-auto flex max-w-lg flex-col items-center gap-7 px-5 py-20 text-center md:py-24">
        <span
          aria-hidden="true"
          className="grid size-20 place-items-center rounded-full bg-brand text-cream md:size-24"
        >
          <LenoMark className="w-10 md:w-12" />
        </span>

        <div className="space-y-3">
          <h1 className="text-2xl font-black leading-tight text-ink md:text-4xl">
            {copy.title}
          </h1>
          <p className="text-sm leading-7 text-muted md:text-base">
            {copy.body}
          </p>
        </div>

        <div className="flex flex-col items-center gap-4">
          <p className="text-sm leading-7 text-ink/80 md:text-base">
            {copy.surveyNudge}
          </p>
          <Link
            href="/survey"
            className="inline-flex h-14 items-center justify-center rounded-2xl bg-brand px-8 text-base font-bold text-cream transition active:scale-[0.99]"
          >
            {copy.surveyCta}
          </Link>
        </div>
      </div>
    </CenteredPanel>
  );
}

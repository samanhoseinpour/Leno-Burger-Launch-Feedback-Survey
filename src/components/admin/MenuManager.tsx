import type { MenuCategory, MenuItem } from "@prisma/client";
import Link from "next/link";
import {
  deleteMenuCategory,
  deleteMenuItem,
  moveMenuCategory,
  moveMenuItem,
  toggleMenuItemAvailability,
} from "@/app/admin/menu/actions";
import { DeleteConfirm } from "@/components/admin/DeleteConfirm";
import { MenuGlyph } from "@/components/menu/MenuGlyph";
import { formatPercent, formatToman, toPersianDigits } from "@/lib/format";
import { MENU_ADMIN_COPY } from "@/lib/menu-copy";
import { resolveIconSlug } from "@/lib/menu-icons";
import { discountedToman } from "@/lib/menu-price";
import { MENU_COPY } from "@/lib/site";

const C = MENU_ADMIN_COPY;

export type CategoryWithItems = MenuCategory & { items: MenuItem[] };

// Everything here is a server component: the row controls are bare <form>s bound
// to Server Actions (the same pattern as the logout button), and a Server Action
// re-renders the current route on its own — so no client state, and no
// revalidatePath("/admin/menu") anywhere.
export function MenuManager({
  categories,
}: {
  categories: CategoryWithItems[];
}) {
  if (categories.length === 0) {
    return (
      <>
        <p className="mt-6 rounded-2xl border border-line bg-cream/30 p-5 text-sm leading-7 text-muted">
          {C.emptyCategories}
        </p>
        <AddCategoryLink className="mt-4" />
      </>
    );
  }

  return (
    <>
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <Link
          href="/admin/menu/items/new"
          className="inline-flex min-h-11 items-center rounded-xl bg-brand px-5 text-sm font-bold text-cream transition active:scale-[0.99]"
        >
          {C.addItem}
        </Link>
        <AddCategoryLink />
      </div>

      <div className="mt-6 space-y-5">
        {categories.map((category, index) => (
          <section
            key={category.id}
            className="rounded-2xl border border-line bg-cream/30 p-5"
          >
            <header className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <span
                  aria-hidden="true"
                  className="grid size-9 shrink-0 place-items-center rounded-xl bg-paper text-brand"
                >
                  <MenuGlyph
                    slug={resolveIconSlug(null, category.icon)}
                    className="size-5"
                  />
                </span>
                <div className="min-w-0">
                  <h2 className="text-base font-bold text-ink">
                    {category.name}
                  </h2>
                  <p className="mt-1 text-xs tabular-nums text-muted">
                    {toPersianDigits(category.items.length)} {C.itemCount}
                  </p>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-1">
                <MoveButtons
                  id={category.id}
                  action={moveMenuCategory}
                  isFirst={index === 0}
                  isLast={index === categories.length - 1}
                />
                <Link
                  href={`/admin/menu/categories/${category.id}`}
                  className="inline-flex min-h-11 items-center rounded-lg px-2 text-xs font-semibold text-muted transition hover:text-brand"
                >
                  {C.edit}
                </Link>
                {category.items.length === 0 ? (
                  <DeleteConfirm
                    id={category.id}
                    action={deleteMenuCategory}
                    prompt={C.confirmDeleteCategory(category.name)}
                  />
                ) : null}
              </div>
            </header>

            {category.items.length === 0 ? (
              <p className="mt-4 text-sm text-muted">{C.emptyItems}</p>
            ) : (
              // NO `overflow-hidden`/`clip` here. Each row's delete confirmation
              // is an absolutely positioned panel that hangs below its button,
              // and either value would clip it away — the button would appear to
              // do nothing. The rows carry no background of their own, so the
              // rounded corners hold without clipping.
              <ul className="mt-4 divide-y divide-line rounded-xl border border-line bg-paper">
                {category.items.map((item, itemIndex) => (
                  <ItemRow
                    key={item.id}
                    item={item}
                    categoryIcon={category.icon}
                    isFirst={itemIndex === 0}
                    isLast={itemIndex === category.items.length - 1}
                  />
                ))}
              </ul>
            )}

            <Link
              href={`/admin/menu/items/new?category=${category.id}`}
              className="mt-4 inline-flex min-h-11 items-center rounded-lg text-xs font-semibold text-brand transition hover:underline"
            >
              + {C.addItem}
            </Link>
          </section>
        ))}
      </div>
    </>
  );
}

function ItemRow({
  item,
  categoryIcon,
  isFirst,
  isLast,
}: {
  item: MenuItem;
  categoryIcon: string | null;
  isFirst: boolean;
  isLast: boolean;
}) {
  // Five controls plus a dish name do not fit across a 390px phone — the name
  // shreds into three lines. So the controls drop onto their own row, and only
  // rejoin the name inline once there is room for them (sm+).
  return (
    <li className={`p-3 ${item.available ? "" : "opacity-60"}`}>
      <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
        <div className="flex min-w-0 flex-1 items-start gap-3">
          {/* The resolved glyph, so an inherited icon looks here exactly as it
              will on /menu — staff should never have to guess. */}
          <span
            aria-hidden="true"
            className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg bg-cream2 text-brand"
          >
            <MenuGlyph
              slug={resolveIconSlug(item.icon, categoryIcon)}
              className="size-4.5"
            />
          </span>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-bold text-ink">{item.name}</span>
              {!item.available && (
                <span className="inline-flex items-center rounded-full bg-brand/10 px-2.5 py-0.5 text-[0.7rem] font-medium text-brand">
                  {MENU_COPY.soldOut}
                </span>
              )}
            </div>

            {item.description && (
              <p className="mt-1 line-clamp-2 text-xs leading-6 text-muted">
                {item.description}
              </p>
            )}

            <ItemPrice item={item} />
          </div>
        </div>

        <div className="flex shrink-0 items-center justify-end gap-1">
          <MoveButtons
            id={item.id}
            action={moveMenuItem}
            isFirst={isFirst}
            isLast={isLast}
          />

          <form action={toggleMenuItemAvailability}>
            <input type="hidden" name="id" value={item.id} />
            <button
              type="submit"
              className="inline-flex min-h-11 items-center whitespace-nowrap rounded-lg px-2 text-xs font-semibold text-muted transition hover:text-brand cursor-pointer"
            >
              {item.available ? C.markUnavailable : C.markAvailable}
            </button>
          </form>

          <Link
            href={`/admin/menu/items/${item.id}`}
            className="inline-flex min-h-11 items-center rounded-lg px-2 text-xs font-semibold text-muted transition hover:text-brand"
          >
            {C.edit}
          </Link>

          <DeleteConfirm
            id={item.id}
            action={deleteMenuItem}
            prompt={C.confirmDeleteItem(item.name)}
          />
        </div>
      </div>
    </li>
  );
}

// Staff should read exactly what a guest reads, discount and all — the whole
// point of showing the price here is to catch a wrong one before opening.
function ItemPrice({ item }: { item: MenuItem }) {
  const className = "mt-1 text-xs tabular-nums text-muted";

  if (item.priceToman == null) return <p className={className}>{C.noPrice}</p>;

  const finalPrice = discountedToman(item.priceToman, item.discountPercent);
  if (finalPrice == null || item.discountPercent == null) {
    return (
      <p className={className}>
        {formatToman(item.priceToman)} {MENU_COPY.priceUnit}
      </p>
    );
  }

  return (
    <p className={className}>
      <s>{formatToman(item.priceToman)}</s>{" "}
      <span className="font-bold text-ink">{formatToman(finalPrice)}</span>{" "}
      {MENU_COPY.priceUnit}{" "}
      <span className="font-medium text-brand">
        ({formatPercent(item.discountPercent)})
      </span>
    </p>
  );
}

// Chevrons, not text: they read the same in RTL, and "up"/"down" is vertical so
// the direction never flips. The disabled edge buttons stay in the DOM so the
// row's controls don't shift horizontally as items move.
function MoveButtons({
  id,
  action,
  isFirst,
  isLast,
}: {
  id: string;
  action: (formData: FormData) => Promise<void>;
  isFirst: boolean;
  isLast: boolean;
}) {
  return (
    <>
      <MoveButton
        id={id}
        action={action}
        direction="up"
        disabled={isFirst}
        label={C.moveUp}
        path="M18 15l-6-6-6 6"
      />
      <MoveButton
        id={id}
        action={action}
        direction="down"
        disabled={isLast}
        label={C.moveDown}
        path="M6 9l6 6 6-6"
      />
    </>
  );
}

function MoveButton({
  id,
  action,
  direction,
  disabled,
  label,
  path,
}: {
  id: string;
  action: (formData: FormData) => Promise<void>;
  direction: "up" | "down";
  disabled: boolean;
  label: string;
  path: string;
}) {
  return (
    <form action={action}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="direction" value={direction} />
      <button
        type="submit"
        disabled={disabled}
        aria-label={label}
        className="grid size-11 place-items-center rounded-lg text-muted transition hover:text-brand disabled:pointer-events-none disabled:opacity-30 cursor-pointer"
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className="size-4"
          fill="none"
          stroke="currentColor"
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d={path} />
        </svg>
      </button>
    </form>
  );
}

function AddCategoryLink({ className = "" }: { className?: string }) {
  return (
    <Link
      href="/admin/menu/categories/new"
      className={`inline-flex min-h-11 items-center rounded-xl border border-line px-5 text-sm font-semibold text-ink transition hover:border-brand hover:text-brand ${className}`}
    >
      {C.addCategory}
    </Link>
  );
}

// The menu icon registry: the closed set of glyphs staff can pick from in
// /admin/menu, and the rules for resolving which one a row renders.
//
// This module is deliberately PLAIN DATA — no React, no `lucide` import. It is
// pulled into `menu-validation.ts`, which the Server Actions and both admin
// forms share; keeping the SVG path data out of that graph is the whole point of
// the split. The glyphs themselves live in `components/menu/MenuGlyph.tsx`.
//
// A slug is a REGISTRY KEY, not a database enum. `MenuItem.icon` /
// `MenuCategory.icon` are plain nullable TEXT columns, so retiring a slug can
// never break `migrate deploy` or strand a row — `resolveIconSlug` degrades to
// the fallback instead. That is why every read goes through the guard below.
//
// The set is SMALL ON PURPOSE. It is scoped to what a burger joint actually puts
// on a menu row, because a picker of 58 tiles is a picker nobody reads. Deleted
// deliberately — do not "complete" any of these back in:
//   • alcohol — `lucide` ships Beer/Wine/Martini and Lucide Lab adds
//     cocktail/goblet/bottleChampagne. Leno serves none of it.
//   • pork — ham, bacon.
//   • seafood — fish, shrimp, crab, sushi.
//   • the coffee shop — coffee, espresso, takeaway, tea, milk.
//   • the bakery and the candy aisle — cake, cookie, donut, croissant, pancake,
//     waffle, pie, popsicle, candy, lollipop, popcorn.
//   • loose produce nobody sells as a dish — pepper, onion, garlic, olive,
//     avocado, carrot.
// Adding one back means restoring its glyph in `MenuGlyph.tsx` too; the
// `Record<MenuIconSlug, …>` there will not compile until you do.

export const MENU_ICON_SLUGS = [
  // Mains
  "burger",
  "hotdog",
  "sandwich",
  "pizza",
  "pasta",
  "chicken",
  "steak",
  // Sides & toppings
  "fries",
  "cheese",
  "sausage",
  "egg",
  "salad",
  "veggie",
  "spicy",
  "sauce",
  // Drinks
  "soda",
  "water",
  "juice",
  "milkshake",
  "yogurtdrink",
  // Sweets
  "icecream",
  "dessert",
  // Generic — `utensils` is also the fallback
  "utensils",
  "chefhat",
  "discount",
  "special",
] as const;

export type MenuIconSlug = (typeof MENU_ICON_SLUGS)[number];

/** Rendered when a row has no icon and its category has none either. */
export const FALLBACK_ICON_SLUG: MenuIconSlug = "utensils";

/** Persian names for the admin picker. Interface copy — safe to reword. */
export const MENU_ICON_LABELS: Record<MenuIconSlug, string> = {
  burger: "برگر",
  hotdog: "هات‌داگ",
  sandwich: "ساندویچ",
  pizza: "پیتزا",
  pasta: "پاستا",
  chicken: "مرغ",
  steak: "گوشت",
  fries: "سیب‌زمینی",
  cheese: "پنیر",
  sausage: "سوسیس",
  egg: "تخم‌مرغ",
  salad: "سالاد",
  veggie: "گیاهی",
  spicy: "تند",
  sauce: "سس",
  soda: "نوشابه",
  water: "آب",
  juice: "آبمیوه",
  milkshake: "میلک‌شیک",
  yogurtdrink: "دوغ",
  icecream: "بستنی",
  dessert: "دسر",
  utensils: "عمومی",
  chefhat: "پیشنهاد سرآشپز",
  discount: "تخفیف",
  special: "ویژه",
};

/**
 * PRESENTATION ONLY — the picker renders these headings so the tiles stay
 * scannable. `MENU_ICON_SLUGS` above stays the flat `as const` tuple and remains
 * the source of truth: `z.enum()` and the two `Record<MenuIconSlug, …>` maps all
 * need its literal type, which a `.flatMap()` over these groups would collapse
 * to `string[]`.
 */
export const MENU_ICON_GROUPS = [
  {
    key: "mains",
    label: "غذای اصلی",
    slugs: [
      "burger",
      "hotdog",
      "sandwich",
      "pizza",
      "pasta",
      "chicken",
      "steak",
    ],
  },
  {
    key: "sides",
    label: "کنارغذا و افزودنی",
    slugs: [
      "fries",
      "cheese",
      "sausage",
      "egg",
      "salad",
      "veggie",
      "spicy",
      "sauce",
    ],
  },
  {
    key: "drinks",
    label: "نوشیدنی",
    slugs: ["soda", "water", "juice", "milkshake", "yogurtdrink"],
  },
  {
    key: "sweets",
    label: "دسر",
    slugs: ["icecream", "dessert"],
  },
  {
    key: "other",
    label: "عمومی",
    slugs: ["utensils", "chefhat", "discount", "special"],
  },
] as const satisfies readonly {
  key: string;
  label: string;
  slugs: readonly MenuIconSlug[];
}[];

// Compile-time guard: a slug that no group lists would silently vanish from the
// picker. This fails to typecheck until every one of them has a home.
type UngroupedSlug = Exclude<
  MenuIconSlug,
  (typeof MENU_ICON_GROUPS)[number]["slugs"][number]
>;
const _everySlugIsGrouped: UngroupedSlug extends never ? true : never = true;
void _everySlugIsGrouped;

const SLUGS: ReadonlySet<string> = new Set(MENU_ICON_SLUGS);

/** TypeScript says a column holds a slug; the database disagrees. Ask it. */
export function isMenuIconSlug(value: unknown): value is MenuIconSlug {
  return typeof value === "string" && SLUGS.has(value);
}

/**
 * An item's own icon wins. A null item icon means "inherit the category's" —
 * that is the default, so staff only pick an icon when a dish should differ
 * from its category. A slug neither of them recognises falls through to the
 * fallback rather than throwing.
 */
export function resolveIconSlug(
  itemIcon: string | null,
  categoryIcon: string | null,
): MenuIconSlug {
  if (isMenuIconSlug(itemIcon)) return itemIcon;
  if (isMenuIconSlug(categoryIcon)) return categoryIcon;
  return FALLBACK_ICON_SLUG;
}

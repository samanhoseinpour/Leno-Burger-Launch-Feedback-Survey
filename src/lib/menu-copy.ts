// Copy for the admin area: the hub, the shared shell, and the menu manager.
// Interface voice (like `site.ts` / `UI_COPY`), never the VERBATIM survey card
// copy in `survey.ts`. Kept out of `site.ts`, which is scoped to the public
// chrome — same split-by-surface reasoning.
//
// Field-level validation strings live in `menu-validation.ts`, mirroring the way
// `validation.ts` owns `VALIDATION_MESSAGES`. The conflict errors below are
// business rules the Server Actions raise, so they belong here.

export const ADMIN_COPY = {
  logout: "خروج",
  hub: {
    title: "پنل مدیریت",
    subtitle: "یکی از بخش‌ها را انتخاب کنید.",
    survey: {
      title: "نظرسنجی",
      desc: "دیدن نتیجه‌ی نظرها و گرفتن خروجی CSV",
    },
    menu: {
      title: "منو",
      desc: "افزودن، ویرایش و مرتب‌سازی آیتم‌ها و دسته‌ها",
    },
  },
  tabs: {
    label: "بخش‌های پنل",
    survey: "نظرسنجی",
    menu: "منو",
  },
  // Each admin section links out to the page a guest actually sees. They open in
  // a new tab, so staff never lose the panel behind them — hence the sr-only hint.
  view: {
    survey: "دیدن فرم نظرسنجی",
    menu: "دیدن منوی عمومی",
    newTab: "در پنجره‌ی تازه",
  },
  subtitles: {
    survey: "داشبورد نظرسنجی",
    menu: "مدیریت منو",
  },
} as const;

// A menu row is an «آیتم», never a «غذا»: a drink, a dessert and a side are all
// rows too, and calling the delete button's prompt «این غذا» in front of a bottle
// of دوغ reads like a bug. Guest-facing copy still says غذا where it means food.
export const MENU_ADMIN_COPY = {
  addItem: "افزودن آیتم",
  addCategory: "افزودن دسته",
  newItemTitle: "آیتم تازه",
  editItemTitle: "ویرایش آیتم",
  newCategoryTitle: "دسته‌ی تازه",
  editCategoryTitle: "ویرایش دسته",

  fields: {
    category: "دسته",
    name: "نام",
    description: "توضیحات",
    descriptionHint: "اختیاری",
    price: "قیمت (تومان)",
    priceHint: "اختیاری — خالی بگذارید تا قیمت نمایش داده نشود",
    discount: "تخفیف (درصد)",
    discountHint: "اختیاری — بین ۱ تا ۹۹",
    priceAfterDiscount: "قیمت پس از تخفیف",
    available: "موجود است",
    categoryName: "نام دسته",
    icon: "آیکن",
    iconHint: "کنار نام آیتم نمایش داده می‌شود",
    iconInherit: "پیش‌فرض دسته",
    iconUsed: "استفاده‌شده",
    categoryIcon: "آیکن دسته",
    categoryIconHint: "روی نوار دسته‌ها و آیتم‌های بدون آیکن نمایش داده می‌شود",
  },

  save: "ذخیره",
  cancel: "انصراف",
  edit: "ویرایش",
  delete: "حذف",
  moveUp: "انتقال به بالا",
  moveDown: "انتقال به پایین",
  markUnavailable: "ناموجود کردن",
  markAvailable: "موجود کردن",
  soldOut: "ناموجود",
  noPrice: "بدون قیمت",

  // Named, not «این آیتم»: the confirmation panel hangs off one row among many,
  // and reading the name back is how staff catch a misclick before it lands.
  confirmDeleteItem: (name: string) => `«${name}» حذف شود؟`,
  confirmDeleteCategory: (name: string) => `دسته‌ی «${name}» حذف شود؟`,
  confirmYes: "بله، حذف کن",

  emptyCategories:
    "هنوز دسته‌ای نساخته‌اید. برای شروع، یک دسته اضافه کنید و بعد آیتم‌ها را در آن بگذارید.",
  emptyItems: "این دسته هنوز آیتمی ندارد.",
  itemCount: "آیتم",

  errors: {
    server: "ذخیره نشد. لطفاً دوباره تلاش کنید.",
    auth: "نشست شما منقضی شده است. دوباره وارد شوید.",
    duplicateCategory: "دسته‌ای با این نام از قبل وجود دارد.",
    categoryNotEmpty:
      "این دسته هنوز آیتم دارد؛ ابتدا آیتم‌هایش را حذف یا به دسته‌ی دیگری منتقل کنید.",
    categoryMissing: "این دسته دیگر وجود ندارد.",
    itemMissing: "این آیتم دیگر وجود ندارد.",
  },
} as const;

// The toast the menu manager shows after a mutation. A flash code is a REGISTRY
// KEY, not a database enum — exactly like `MENU_ICON_SLUGS`: it arrives in a URL
// anyone can type, so every read goes through the guard below and an unknown
// code degrades to "no toast" instead of throwing.
//
// Each message NAMES the row it acted on, because «آیتم حذف شد» is the one
// sentence a guest of this panel cannot verify — five rows look alike, and the
// deleted one is by definition no longer on screen to compare against. The name
// therefore round-trips through the query string, which means it is untrusted
// input on the way back: `resolveFlashName` below is what makes it safe, and the
// no-name fallbacks are what render when a row was already gone.
type FlashMessage = (name?: string) => string;

export const MENU_FLASH = {
  "item-created": (name) => (name ? `«${name}» اضافه شد.` : "آیتم اضافه شد."),
  "item-updated": (name) =>
    name ? `تغییرات «${name}» ذخیره شد.` : "تغییرات ذخیره شد.",
  "item-deleted": (name) => (name ? `«${name}» حذف شد.` : "آیتم حذف شد."),
  "item-hidden": (name) => (name ? `«${name}» ناموجود شد.` : "آیتم ناموجود شد."),
  "item-shown": (name) => (name ? `«${name}» موجود شد.` : "آیتم موجود شد."),
  "category-created": (name) =>
    name ? `دسته‌ی «${name}» اضافه شد.` : "دسته اضافه شد.",
  "category-updated": (name) =>
    name ? `تغییرات دسته‌ی «${name}» ذخیره شد.` : "تغییرات دسته ذخیره شد.",
  "category-deleted": (name) =>
    name ? `دسته‌ی «${name}» حذف شد.` : "دسته حذف شد.",
  error: () => "انجام نشد. لطفاً دوباره تلاش کنید.",
} satisfies Record<string, FlashMessage>;

export type FlashCode = keyof typeof MENU_FLASH;

export const FLASH_DISMISS = "بستن";

const FLASH_CODES: ReadonlySet<string> = new Set(Object.keys(MENU_FLASH));

/** The URL says it is a flash code; it is a URL. Ask. */
export function resolveFlash(value: unknown): FlashCode | null {
  return typeof value === "string" && FLASH_CODES.has(value)
    ? (value as FlashCode)
    : null;
}

// A toast is one line. `name` is capped at 80 by `menu-validation.ts`, but what
// comes back off the URL is whatever was typed into it.
const MAX_FLASH_NAME = 48;

/**
 * The URL says it is the name of the row we just deleted; it is a URL.
 *
 * React escapes the string on render, so this is not an XSS guard — it is a
 * LAYOUT guard: collapse the whitespace a pasted name drags in, drop the C0
 * control characters that would corrupt the line, and cut a pathological length
 * down to something that fits in the toast. `\s` and the explicit range leave
 * ZWNJ (U+200C) alone, which every second Persian word needs.
 *
 * Collapse BEFORE stripping. Tab and newline are themselves C0 controls, so
 * dropping the range first would delete them outright and glue the words on
 * either side into one — «چیز<tab>برگر» would render as «چیزبرگر».
 */
export function resolveFlashName(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;

  const clean = value
    .replace(/\s+/g, " ")
    .replace(/[\u0000-\u001F\u007F]/g, "")
    .trim();

  if (clean === "") return undefined;
  return clean.length > MAX_FLASH_NAME
    ? `${clean.slice(0, MAX_FLASH_NAME)}…`
    : clean;
}

/** The message for a code, named after the row it acted on when we know it. */
export function flashMessage(code: FlashCode, name?: string): string {
  const message: FlashMessage = MENU_FLASH[code];
  return message(name);
}

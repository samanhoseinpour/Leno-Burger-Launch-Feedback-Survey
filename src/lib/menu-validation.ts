// Validation for the /admin/menu forms. Mirrors `validation.ts`: one Zod schema
// per entity, shared by the client form (instant inline errors) and the Server
// Action (source of truth), so the two can never drift.
//
// Menu content is entered by staff, not guests, so the rules are loose on purpose:
// only `name` is required. Price and description stay empty until someone fills
// them in. Every message here is interface microcopy.

import { z } from "zod";
import { toLatinDigits } from "./format";
import { MENU_ICON_SLUGS } from "./menu-icons";
import { MAX_DISCOUNT_PERCENT, MIN_DISCOUNT_PERCENT } from "./menu-price";

export const MENU_VALIDATION_MESSAGES = {
  categoryRequired: "یک دسته را انتخاب کنید.",
  nameRequired: "نام را وارد کنید.",
  nameTooLong: "نام واردشده بیش از حد طولانی است.",
  descriptionTooLong: "توضیحات واردشده بیش از حد طولانی است.",
  priceInvalid: "قیمت واردشده معتبر نیست.",
  priceTooLarge: "قیمت واردشده بیش از حد بزرگ است.",
  discountInvalid: "درصد تخفیف معتبر نیست.",
  discountRange: "درصد تخفیف باید بین ۱ تا ۹۹ باشد.",
  discountNeedsPrice: "برای تخفیف، اول قیمت را وارد کنید.",
  categoryNameRequired: "نام دسته را وارد کنید.",
  categoryNameTooLong: "نام دسته بیش از حد طولانی است.",
  iconInvalid: "آیکن انتخاب‌شده معتبر نیست.",
  iconRequired: "یک آیکن برای دسته انتخاب کنید.",
} as const;

const M = MENU_VALIDATION_MESSAGES;

// A tamper guard, not a real price ceiling.
const MAX_PRICE_TOMAN = 100_000_000;

const requiredText = (max: number, required: string, tooLong: string) =>
  z.preprocess(
    (value) => (typeof value === "string" ? value.trim() : ""),
    z.string().min(1, { error: required }).max(max, { error: tooLong }),
  );

const optionalText = (max: number, tooLong: string) =>
  z
    .preprocess(
      (value) => (typeof value === "string" ? value.trim() : ""),
      z.string().max(max, { error: tooLong }),
    )
    .transform((value) => (value === "" ? null : value));

// Accepts «۱۸۰٬۰۰۰», "180,000" or "180000" alike — same Persian/Arabic-digit
// courtesy the phone field extends to guests. Blank → `null` (no price yet).
// Because every non-digit is stripped, a negative number is unreachable; the
// `min` only ever fires on a tampered request.
const priceField = z.preprocess(
  (value) => {
    if (typeof value !== "string") return null;
    const digits = toLatinDigits(value).replace(/[^0-9]/g, "");
    return digits === "" ? null : Number.parseInt(digits, 10);
  },
  z
    .number({ error: M.priceInvalid })
    .int({ error: M.priceInvalid })
    .min(0, { error: M.priceInvalid })
    .max(MAX_PRICE_TOMAN, { error: M.priceTooLarge })
    .nullable(),
);

// Same digit courtesy as `priceField`. A submitted `0` normalises to `null`, so
// clearing the field to zero removes the discount instead of storing a no-op
// that would still render a «۰٪ تخفیف» pill on the menu.
const discountField = z.preprocess(
  (value) => {
    if (typeof value !== "string") return null;
    const digits = toLatinDigits(value).replace(/[^0-9]/g, "");
    if (digits === "") return null;
    const percent = Number.parseInt(digits, 10);
    return percent === 0 ? null : percent;
  },
  z
    .number({ error: M.discountInvalid })
    .int({ error: M.discountInvalid })
    .min(MIN_DISCOUNT_PERCENT, { error: M.discountRange })
    .max(MAX_DISCOUNT_PERCENT, { error: M.discountRange })
    .nullable(),
);

// An unchecked checkbox submits nothing at all, so absence means `false`.
const availableField = z.preprocess((value) => value === "on", z.boolean());

// The picker's first tile is «پیش‌فرض دسته» and submits "", meaning "inherit the
// category's icon". Anything else must be a live registry slug — the `z.enum`
// is what stops a hand-crafted POST from writing a slug we cannot draw.
const itemIconField = z.preprocess(
  (value) =>
    typeof value === "string" && value.trim() !== "" ? value.trim() : null,
  z.enum(MENU_ICON_SLUGS, { error: M.iconInvalid }).nullable(),
);

// A category has nothing to inherit from, so its icon is required. An empty
// string falls through to the enum and fails with `iconRequired`.
const categoryIconField = z.preprocess(
  (value) => (typeof value === "string" ? value.trim() : ""),
  z.enum(MENU_ICON_SLUGS, { error: M.iconRequired }),
);

// Kept as a named object so `MenuItemField` can be derived from it below — the
// `superRefine` wrapper is not a `ZodObject`, so `keyof` cannot see through it.
const MenuItemObject = z.object({
  categoryId: requiredText(64, M.categoryRequired, M.categoryRequired),
  name: requiredText(80, M.nameRequired, M.nameTooLong),
  description: optionalText(300, M.descriptionTooLong),
  priceToman: priceField,
  discountPercent: discountField,
  icon: itemIconField,
  available: availableField,
});

// A percentage off nothing is nothing. Caught here rather than in the form so a
// hand-rolled POST cannot write a discount onto a priceless row, which would
// render a «تخفیف» pill next to no number at all.
export const MenuItemSchema = MenuItemObject.superRefine((value, ctx) => {
  if (value.discountPercent != null && value.priceToman == null) {
    ctx.addIssue({
      code: "custom",
      message: M.discountNeedsPrice,
      path: ["discountPercent"], // `fieldErrorsOf` keys off path[0]
    });
  }
});

export const MenuCategorySchema = z.object({
  name: requiredText(60, M.categoryNameRequired, M.categoryNameTooLong),
  icon: categoryIconField,
});

export type MenuItemInput = z.input<typeof MenuItemSchema>;
export type MenuItemData = z.output<typeof MenuItemSchema>;
export type MenuItemField = keyof z.output<typeof MenuItemObject>;

export type MenuCategoryInput = z.input<typeof MenuCategorySchema>;
export type MenuCategoryData = z.output<typeof MenuCategorySchema>;
export type MenuCategoryField = keyof MenuCategoryData;

const getString = (formData: FormData, key: string) => {
  const value = formData.get(key);
  return typeof value === "string" ? value : undefined;
};

/** Pull the raw menu-item fields out of a submitted FormData (client + server). */
export function menuItemFromFormData(formData: FormData) {
  return {
    categoryId: getString(formData, "categoryId"),
    name: getString(formData, "name"),
    description: getString(formData, "description"),
    priceToman: getString(formData, "priceToman"),
    discountPercent: getString(formData, "discountPercent"),
    icon: getString(formData, "icon"),
    available: getString(formData, "available"),
  };
}

/** Pull the raw category fields out of a submitted FormData (client + server). */
export function menuCategoryFromFormData(formData: FormData) {
  return {
    name: getString(formData, "name"),
    icon: getString(formData, "icon"),
  };
}

// The one place the discount arithmetic lives. Deliberately React-free, like
// `menu-icons.ts`: the public menu (server), the admin manager (server), the
// admin form's live preview (client) and `menu-validation.ts` all import it, and
// none of them may disagree about what a guest actually pays.
//
// `MenuItem.priceToman` is always the ORIGINAL price — the number printed with a
// line through it. The discounted figure is derived on every read and never
// stored: a second currency column would drift the moment someone edits the
// percent and only one of the two writes lands.

export const MIN_DISCOUNT_PERCENT = 1;
export const MAX_DISCOUNT_PERCENT = 99;

/**
 * What a guest pays, or `null` when there is no live discount to apply — no
 * price, no percent, or a percent that a hand-rolled POST slipped past Zod.
 * Rounded to the whole Toman; Iran has no smaller unit in practice.
 */
export function discountedToman(
  price: number | null,
  percent: number | null,
): number | null {
  if (price == null || percent == null) return null;
  if (percent < MIN_DISCOUNT_PERCENT || percent > MAX_DISCOUNT_PERCENT) {
    return null;
  }
  return Math.round((price * (100 - percent)) / 100);
}

/**
 * The struck-through original as the GUEST menu displays it. Owners back-compute
 * originals from a round pay price (580,000 at 25% off stores 773,333), so the
 * stored figure can carry thirds; the strikethrough is marketing, not a receipt,
 * and shows the nearest 1,000 Toman. Display-only: the admin keeps showing the
 * stored figure, and what a guest pays is never rounded — that stays
 * `discountedToman()` over the exact `priceToman`.
 */
export function roundedOriginalToman(price: number): number {
  return Math.round(price / 1000) * 1000;
}

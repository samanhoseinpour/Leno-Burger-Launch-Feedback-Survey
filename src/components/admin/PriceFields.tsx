"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  formatPercent,
  formatToman,
  toLatinDigits,
  toPersianWords,
} from "@/lib/format";
import { MENU_ADMIN_COPY } from "@/lib/menu-copy";
import { MENU_VALIDATION_MESSAGES } from "@/lib/menu-validation";
import { discountedToman, MAX_DISCOUNT_PERCENT } from "@/lib/menu-price";
import { MENU_COPY } from "@/lib/site";

const C = MENU_ADMIN_COPY;

// "99" → 2. Zod re-checks the range; this only stops the field looking absurd.
const DISCOUNT_MAX_LENGTH = String(MAX_DISCOUNT_PERCENT).length;

// An order of magnitude above MAX_PRICE_TOMAN, which Zod enforces for real.
const MAX_PRICE_DIGITS = 9;

const inputClass =
  "mt-1.5 h-11 w-full rounded-xl border border-line bg-paper px-3 text-start text-base text-ink outline-none transition focus:border-brand";
const labelClass = "block text-sm text-muted";

// The only pair of fields in the form that is CONTROLLED. Everything else in
// `MenuItemForm` is uncontrolled, and this still slots into that uncontrolled
// <form action={formAction}> — the state exists to reformat as you type and to
// preview the discount, not to submit. Submission is still by `name=`.
//
// The price input submits "80,000". No schema change is needed for the comma:
// `priceField` already strips every non-digit before parsing.

/** `useLayoutEffect` warns when React renders this on the server. */
const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

const countDigits = (value: string) => (value.match(/[0-9]/g) ?? []).length;

/** Group Latin digits for the input: "80000" → "80,000". */
function groupDigits(digits: string): string {
  return digits === "" ? "" : Number(digits).toLocaleString("en-US");
}

/** Strip everything that isn't a digit, accepting Persian/Arabic numerals. */
function onlyDigits(value: string, max: number): string {
  return toLatinDigits(value).replace(/[^0-9]/g, "").slice(0, max);
}

/** The caret offset that sits just after the `count`-th digit of `value`. */
function caretAfterNthDigit(value: string, count: number): number {
  if (count <= 0) return 0;
  let seen = 0;
  for (let i = 0; i < value.length; i++) {
    if (value[i] >= "0" && value[i] <= "9" && ++seen === count) return i + 1;
  }
  return value.length;
}

export function PriceFields({
  defaultPrice,
  defaultDiscount,
  priceError,
  discountError,
}: {
  defaultPrice: number | null;
  defaultDiscount: number | null;
  priceError?: string;
  discountError?: string;
}) {
  const [price, setPrice] = useState(() =>
    groupDigits(defaultPrice == null ? "" : String(defaultPrice)),
  );
  const [discount, setDiscount] = useState(() =>
    defaultDiscount == null ? "" : String(defaultDiscount),
  );

  const priceInput = useRef<HTMLInputElement>(null);
  const nextCaret = useRef<number | null>(null);

  // Restoring the caret inside `onChange` does not stick: React writes `el.value`
  // AFTER the handler returns and resets the selection to the end. Doing it in a
  // layout effect lands after that write and before paint, so the caret never
  // visibly jumps — which it would with a plain `useEffect`.
  useIsomorphicLayoutEffect(() => {
    const el = priceInput.current;
    if (el && nextCaret.current != null) {
      el.setSelectionRange(nextCaret.current, nextCaret.current);
      nextCaret.current = null;
    }
  });

  function onPriceChange(event: React.ChangeEvent<HTMLInputElement>) {
    const { value, selectionStart } = event.currentTarget;
    const caret = selectionStart ?? value.length;

    // Count digits, not characters: reformatting moves the commas around, but
    // the caret belongs after the same digit it was after before.
    const digitsBeforeCaret = countDigits(toLatinDigits(value.slice(0, caret)));
    const grouped = groupDigits(onlyDigits(value, MAX_PRICE_DIGITS));

    nextCaret.current = caretAfterNthDigit(grouped, digitsBeforeCaret);
    setPrice(grouped);
  }

  // Deleting a comma alone would be a no-op — regrouping puts it straight back,
  // and the keystroke is wasted. Eat the adjacent DIGIT instead, which is what
  // the separator is standing in the way of.
  function onPriceKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    const isBackspace = event.key === "Backspace";
    if (!isBackspace && event.key !== "Delete") return;

    const { value, selectionStart, selectionEnd } = event.currentTarget;
    if (selectionStart == null || selectionStart !== selectionEnd) return;

    const doomed = isBackspace ? value[selectionStart - 1] : value[selectionStart];
    if (doomed !== ",") return;

    const digits = onlyDigits(value, MAX_PRICE_DIGITS);
    const digitsBeforeCaret = countDigits(value.slice(0, selectionStart));
    const removeAt = isBackspace ? digitsBeforeCaret - 1 : digitsBeforeCaret;
    if (removeAt < 0 || removeAt >= digits.length) return;

    event.preventDefault();
    const grouped = groupDigits(
      digits.slice(0, removeAt) + digits.slice(removeAt + 1),
    );
    nextCaret.current = caretAfterNthDigit(grouped, removeAt);
    setPrice(grouped);
  }

  const priceNumber = price === "" ? null : Number(price.replace(/,/g, ""));
  const discountNumber = discount === "" ? null : Number(discount);

  return (
    <div className="space-y-5">
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <label htmlFor="priceToman" className={labelClass}>
            {C.fields.price}
          </label>
          {/* No `dir="ltr"`: bidi already keeps "80,000" one LTR run (the comma
              is a Common Separator inside a number), and forcing the direction
              would left-align the field against every other input in the form. */}
          <input
            id="priceToman"
            name="priceToman"
            ref={priceInput}
            type="text"
            inputMode="numeric"
            autoComplete="off"
            value={price}
            onChange={onPriceChange}
            onKeyDown={onPriceKeyDown}
            className={`${inputClass} tabular-nums`}
          />
        </div>

        <div className="w-28 shrink-0">
          <label htmlFor="discountPercent" className={labelClass}>
            {C.fields.discount}
          </label>
          <div className="relative">
            <input
              id="discountPercent"
              name="discountPercent"
              type="text"
              inputMode="numeric"
              autoComplete="off"
              maxLength={DISCOUNT_MAX_LENGTH}
              value={discount}
              onChange={(event) =>
                setDiscount(
                  onlyDigits(event.currentTarget.value, DISCOUNT_MAX_LENGTH),
                )
              }
              className={`${inputClass} pe-8 tabular-nums`}
            />
            {/* `top-1.5 bottom-0` spans the input's box, not the label's margin. */}
            <span
              aria-hidden="true"
              className="pointer-events-none absolute bottom-0 end-3 top-1.5 grid place-items-center text-sm text-muted"
            >
              ٪
            </span>
          </div>
        </div>
      </div>

      <PricePreview price={priceNumber} discount={discountNumber} />

      {priceError && <FieldError message={priceError} />}
      {discountError && <FieldError message={discountError} />}
    </div>
  );
}

// Replaces the old static `priceHint`. It is the whole point of the controlled
// inputs: staff read back the amount in words before they save, so a stray zero
// is caught here rather than by a guest at the till.
function PricePreview({
  price,
  discount,
}: {
  price: number | null;
  discount: number | null;
}) {
  const hintClass = "mt-1.5 text-xs leading-6 text-muted";

  if (price == null) {
    return (
      <p className={hintClass}>
        {discount == null
          ? C.fields.priceHint
          : MENU_VALIDATION_MESSAGES.discountNeedsPrice}
      </p>
    );
  }

  const finalPrice = discountedToman(price, discount);

  // `discount` is out of range (only reachable mid-typing, e.g. a lone "0").
  if (discount == null || finalPrice == null) {
    return (
      <p className={hintClass}>
        <span className="tabular-nums">{formatToman(price)}</span>{" "}
        {MENU_COPY.priceUnit} — {toPersianWords(price)} {MENU_COPY.priceUnit}
      </p>
    );
  }

  return (
    <div className="mt-1.5 text-xs leading-6">
      <p className="flex flex-wrap items-center gap-2">
        <s className="tabular-nums text-muted">{formatToman(price)}</s>
        <span className="font-bold tabular-nums text-ink">
          {formatToman(finalPrice)} {MENU_COPY.priceUnit}
        </span>
        <span className="inline-flex items-center rounded-full bg-brand px-2 py-0.5 text-[0.7rem] font-bold text-cream">
          {formatPercent(discount)} {MENU_COPY.discount}
        </span>
      </p>
      <p className="text-muted">
        {toPersianWords(finalPrice)} {MENU_COPY.priceUnit}
      </p>
    </div>
  );
}

function FieldError({ message }: { message: string }) {
  return (
    <p role="alert" className="text-sm font-medium text-brand">
      {message}
    </p>
  );
}

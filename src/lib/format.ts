// Small pure helpers. Kept framework-free so the spec-critical logic is easy to
// reason about (and unit-test later if desired).

const PERSIAN_DIGITS = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];

/** Render Latin digits in a string/number as Persian digits (۰–۹). */
export function toPersianDigits(input: string | number): string {
  return String(input).replace(/[0-9]/g, (d) => PERSIAN_DIGITS[Number(d)]);
}

const PERSIAN_TO_LATIN = "۰۱۲۳۴۵۶۷۸۹";
const ARABIC_TO_LATIN = "٠١٢٣٤٥٦٧٨٩";

/**
 * Transliterate Persian (۰–۹) and Arabic-Indic (٠–٩) digits to Latin 0–9.
 * Every other character passes through untouched — callers decide what to strip.
 */
export function toLatinDigits(input: string): string {
  let out = "";
  for (const ch of input) {
    const p = PERSIAN_TO_LATIN.indexOf(ch);
    if (p > -1) {
      out += String(p);
      continue;
    }
    const a = ARABIC_TO_LATIN.indexOf(ch);
    if (a > -1) {
      out += String(a);
      continue;
    }
    out += ch;
  }
  return out;
}

/**
 * Normalize a phone number to Latin digits (e.g. "۰۹۱۲…" → "0912…").
 * Accepts Persian and Arabic-Indic digits and strips separators/spaces.
 * Light-touch only: this never rejects input — it just cleans it up.
 */
export function normalizePhone(input: string): string {
  if (!input) return "";
  // Anything that isn't a digit (spaces, dashes, parentheses, …) is dropped.
  return toLatinDigits(input.trim()).replace(/[^0-9]/g, "");
}

// `fa-IR` already renders Persian digits and the Persian thousands separator
// (U+066C), so this must NOT be piped through `toPersianDigits`.
const tomanFormatter = new Intl.NumberFormat("fa-IR");

/** Group a whole-Toman amount for display (e.g. 180000 → "۱۸۰٬۰۰۰"). */
export function formatToman(value: number): string {
  return tomanFormatter.format(value);
}

// Also already Persian-digited by `fa-IR` — same rule as `formatToman`.
const percentFormatter = new Intl.NumberFormat("fa-IR", { style: "percent" });

/** Render a whole percentage for display (e.g. 5 → "۵٪"). */
export function formatPercent(value: number): string {
  return percentFormatter.format(value / 100);
}

const ONES = ["", "یک", "دو", "سه", "چهار", "پنج", "شش", "هفت", "هشت", "نه"];
const TEENS = [
  "ده",
  "یازده",
  "دوازده",
  "سیزده",
  "چهارده",
  "پانزده",
  "شانزده",
  "هفده",
  "هجده",
  "نوزده",
];
const TENS = ["", "", "بیست", "سی", "چهل", "پنجاه", "شصت", "هفتاد", "هشتاد", "نود"];
const HUNDREDS = [
  "",
  "صد",
  "دویست",
  "سیصد",
  "چهارصد",
  "پانصد",
  "ششصد",
  "هفتصد",
  "هشتصد",
  "نهصد",
];
const SCALES = ["", "هزار", "میلیون", "میلیارد"];

/** Spell out 1–999. The 10–19 range has its own words, so it can't be composed. */
function under1000(value: number): string {
  const parts: string[] = [];
  const hundreds = Math.floor(value / 100);
  const rest = value % 100;

  if (hundreds) parts.push(HUNDREDS[hundreds]);

  if (rest >= 10 && rest < 20) {
    parts.push(TEENS[rest - 10]);
  } else {
    const tens = Math.floor(rest / 10);
    const ones = rest % 10;
    if (tens) parts.push(TENS[tens]);
    if (ones) parts.push(ONES[ones]);
  }

  return parts.join(" و ");
}

/**
 * Spell a whole number in Persian words — digits-free, so the caller decides the
 * unit («تومان» lives in `MENU_COPY`, not here). Covers 0 … MAX_PRICE_TOMAN.
 *
 * One asymmetry to know about: 1000 reads «هزار», not «یک هزار», but 1,000,000
 * does keep its «یک میلیون». That is how the language works, not an oversight.
 */
export function toPersianWords(value: number): string {
  if (!Number.isFinite(value) || value < 0) return "";
  if (value === 0) return "صفر";

  // Split into groups of three, least-significant first: 1_250_000 → [0, 250, 1].
  const groups: [group: number, scale: number][] = [];
  let rest = Math.floor(value);
  for (let scale = 0; rest > 0; scale++) {
    groups.push([rest % 1000, scale]);
    rest = Math.floor(rest / 1000);
  }

  const parts: string[] = [];
  for (const [group, scale] of groups.reverse()) {
    if (group === 0) continue;
    if (scale === 0) parts.push(under1000(group));
    else if (group === 1 && scale === 1) parts.push(SCALES[scale]); // «هزار», not «یک هزار»
    else parts.push(`${under1000(group)} ${SCALES[scale]}`);
  }

  return parts.join(" و ");
}

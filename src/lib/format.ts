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
 * Normalize a phone number to Latin digits (e.g. "۰۹۱۲…" → "0912…").
 * Accepts Persian and Arabic-Indic digits and strips separators/spaces.
 * Light-touch only: this never rejects input — it just cleans it up.
 */
export function normalizePhone(input: string): string {
  if (!input) return "";
  let out = "";
  for (const ch of input.trim()) {
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
    if (ch >= "0" && ch <= "9") {
      out += ch;
    }
    // Anything else (spaces, dashes, parentheses, …) is dropped.
  }
  return out;
}

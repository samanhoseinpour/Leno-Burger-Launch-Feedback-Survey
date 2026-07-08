// Single source of truth for the survey. Every user-facing string below is
// VERBATIM from SPEC.md §"Survey content" — do not translate, paraphrase, or
// "fix" it. The form is rendered data-driven from this config.
//
// Rating scales are ordered most-negative → most-positive. The STORED value is
// the array index + 1 (index 0 = 1, index 4 = 5). This mapping is fixed. The
// UI renders the options REVERSED — most-positive first, i.e. rightmost in RTL
// where reading starts (deliberate UX choice, 2026-07-03; supersedes SPEC's
// "index 0 rightmost"). Reordering is display-only and must never touch the
// stored score: «خیلی خوب» is 5 wherever it appears on screen.

export const SCALE_QUALITY = [
  "خیلی ضعیف",
  "ضعیف",
  "متوسط",
  "خوب",
  "خیلی خوب",
] as const; // 1..5

export const SCALE_VALUE = [
  "اصلاً",
  "کم",
  "متوسط",
  "زیاد",
  "کاملاً",
] as const; // 1..5

export const SCALE_RECO = [
  "به‌هیچ‌وجه",
  "بعید",
  "شاید",
  "احتمالاً",
  "قطعاً",
] as const; // 1..5

export type QuestionId = "q1" | "q2" | "q3" | "q4" | "q5" | "q6";

export type Question = {
  id: QuestionId;
  text: string;
  // Short label for the admin dashboard table header — an abstraction of the
  // full question, NOT card copy (e.g. "طعم برگر را چگونه…؟" → "طعم برگر").
  short: string;
  scale: readonly string[];
};

export const QUESTIONS: readonly Question[] = [
  {
    id: "q1",
    text: "طعم برگر را چگونه ارزیابی می‌کنید؟",
    short: "طعم برگر",
    scale: SCALE_QUALITY,
  },
  {
    id: "q2",
    text: "اندازه‌ی پرس چطور بود؟",
    short: "حجم غذا",
    scale: SCALE_QUALITY,
  },
  {
    id: "q3",
    text: "کیفیت و تازگی مواد اولیه چطور بود؟",
    short: "کیفیت مواد",
    scale: SCALE_QUALITY,
  },
  {
    id: "q4",
    text: "سرعت آماده‌سازی و سرو سفارش چگونه بود؟",
    short: "سرعت سرو",
    scale: SCALE_QUALITY,
  },
  {
    id: "q5",
    text: "کیفیت لنو، ارزش قیمتش را داشت؟",
    short: "ارزش قیمت",
    scale: SCALE_VALUE,
  },
  {
    id: "q6",
    text: "لنو را به دوستان و آشنایان خود پیشنهاد می‌دهید؟",
    short: "پیشنهاد به دوستان",
    scale: SCALE_RECO,
  },
];

// The 6 ratings + Q7 = 7 numbered questions on the card.
export const ORDER_QUESTION_NUMBER = QUESTIONS.length + 1; // 7

// Verbatim copy from the card.
export const COPY = {
  title: "تجربه‌ی شما در لنو چگونه بود؟",
  subtitle:
    "حضور شما مایه‌ی افتخار ماست؛ چند لحظه وقت بگذارید و نظر ارزشمندتان را با ما در میان بگذارید.",
  instruction: "لطفاً دایرهٔ گزینه‌ای که با نظر شما همخوانی دارد را پر کنید.",
  orderQuestion: "امروز چه سفارشی دادید و کدام مورد بیشتر مورد پسند شما بود؟",
  contactHeading: "برای در ارتباط ماندن با لنو (اختیاری)",
  nameLabel: "نام",
  phoneLabel: "شماره تماس",
  submit: "ثبت نظر",
  footer: {
    line1: "از اینکه مهمان لنو بودید سپاسگزاریم.",
    line2:
      "مشتاقانه در انتظار دیدار دوباره‌ی شما هستیم. — با احترام، مجموعه‌ی لنو",
  },
} as const;

// UI-state microcopy — NOT from the printed card. Written to be gentle and in
// the interface's own voice (the card has no equivalents for these states).
export const UI_COPY = {
  submitting: "در حال ثبت…",
  fixErrors: "لطفاً موارد مشخص‌شده را کامل کنید.",
  serverError: "متأسفانه در ثبت نظر مشکلی پیش آمد. لطفاً دوباره تلاش کنید.",
  retry: "تلاش دوباره",
  // Field-status markers for the required/optional distinction (see validation.ts:
  // q1..q6 are required, orderNote/name/phone are optional). `optionalTag` renders
  // as "(اختیاری)" beside optional inputs; `requiredHint` is visually hidden and
  // announces the *-marked required inputs to screen readers.
  optionalTag: "اختیاری",
  requiredHint: "الزامی",
  // Admin dashboard: expand/collapse a long «سفارش / نظر» write-in.
  showMore: "بیشتر",
  showLess: "کمتر",
} as const;

// Copy for the site shell around the survey: the home landing (`/`) and the
// menu page (`/menu`). Kept separate from `survey.ts`, which is the VERBATIM
// survey-card copy from SPEC.md. These strings are NOT from the printed card —
// they're interface copy (like UI_COPY), written to match the brand's warm,
// formal-polite Persian tone (note the ZWNJ / نیم‌فاصله).

export const SITE_COPY = {
  backHome: "بازگشت به خانه",
} as const;

// Home landing — a hub linking to the menu and the survey.
export const HOME_COPY = {
  title: "به لنو خوش آمدید",
  subtitle: "برای دیدن منو یا ثبت نظرتان، یکی از گزینه‌های زیر را انتخاب کنید.",
  menu: {
    title: "منو",
    desc: "نگاهی به غذاها و نوشیدنی‌های لنو",
  },
  survey: {
    title: "نظرسنجی",
    desc: "تجربه‌تان را با ما در میان بگذارید",
  },
} as const;

// Menu page. The `comingSoon` block is the fallback for an empty menu — it can
// only surface on a fresh database, since the real items ship as a migration.
export const MENU_COPY = {
  heroTitle: "منوی لنو",
  // A claim about the food, then a warm close — not a compliment to the guest.
  // Whoever is reading this has already sat down; what they want from a menu
  // header is a reason to trust the kitchen, not to be welcomed a second time.
  heroSubtitle: "همه‌چیز تازه و همان لحظه آماده می‌شود؛ نوش جانتان.",
  // sr-only name for the sticky category rail — it is a real <nav>.
  railLabel: "دسته‌بندی‌های منو",
  soldOut: "ناموجود",
  discount: "تخفیف",
  // sr-only, so the struck-through number is announced for what it is.
  priceBefore: "قیمت پیش از تخفیف",
  priceUnit: "تومان",
  comingSoon: {
    title: "منوی لنو به‌زودی…",
    body: "در حال آماده‌سازی منوی کامل لنو هستیم؛ به‌زودی از همین‌جا می‌توانید غذاها و نوشیدنی‌ها را ببینید.",
    surveyNudge: "تا آن زمان، خوشحال می‌شویم نظرتان را بشنویم.",
    surveyCta: "ثبت نظر",
  },
} as const;

// Primary navigation — shared by the sticky <SiteNav> and the footer link list.
// Order is RTL reading order (first item renders at the inline start / right).
export const NAV_ITEMS = [
  { href: "/", label: "خانه" },
  { href: "/menu", label: "منو" },
  { href: "/survey", label: "نظرسنجی" },
] as const;

// Accessible labels for the site chrome (not visible copy).
export const NAV_COPY = {
  primary: "ناوبری اصلی",
  brandHome: "لنو، خانه",
  skip: "پرش به محتوای اصلی",
} as const;

// Footer microcopy (interface voice). navHeading is the slim footer nav's
// sr-only accessible name (no visible heading); rights closes the credit line.
export const FOOTER_COPY = {
  navHeading: "دسترسی سریع",
  rights: "همه‌ی حقوق محفوظ است.",
} as const;

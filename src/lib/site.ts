// Copy for the site shell around the survey: the home landing (`/`) and the
// menu "coming soon" page (`/menu`). Kept separate from `survey.ts`, which is
// the VERBATIM survey-card copy from SPEC.md. These strings are NOT from the
// printed card — they're interface copy (like UI_COPY), written to match the
// brand's warm, formal-polite Persian tone (note the ZWNJ / نیم‌فاصله).

export const SITE_COPY = {
  backHome: "بازگشت به خانه",
} as const;

// Home landing — a hub linking to the menu and the survey.
export const HOME_COPY = {
  title: "به لنو خوش آمدید",
  subtitle: "برای دیدن منو یا ثبت نظرتان، یکی از گزینه‌های زیر را انتخاب کنید.",
  comingSoonBadge: "به‌زودی",
  menu: {
    title: "منو",
    desc: "نگاهی به غذاها و نوشیدنی‌های لنو",
  },
  survey: {
    title: "نظرسنجی",
    desc: "تجربه‌تان را با ما در میان بگذارید",
  },
} as const;

// Menu page — a branded placeholder until the real menu is ready.
export const MENU_COPY = {
  title: "منوی لنو به‌زودی…",
  body: "در حال آماده‌سازی منوی کامل لنو هستیم؛ به‌زودی از همین‌جا می‌توانید غذاها و نوشیدنی‌ها را ببینید.",
  surveyNudge: "تا آن زمان، خوشحال می‌شویم نظرتان را بشنویم.",
  surveyCta: "ثبت نظر",
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

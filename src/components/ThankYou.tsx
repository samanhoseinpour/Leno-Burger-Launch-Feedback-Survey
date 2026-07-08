import { COPY } from "@/lib/survey";

// Shared success screen — used both in place after submit and on /thanks.
// `action` renders an optional CTA under the message; both callers pass a
// "back to home" link so a guest can reach the rest of the site (e.g. the menu).
// No Leno lockup here — the nav and footer already brand the page; the check
// badge is this screen's own focal mark.
export function ThankYou({ action }: { action?: React.ReactNode }) {
  return (
    <div
      role="status"
      className="mx-auto flex max-w-md flex-col items-center gap-7 px-5 py-20 text-center md:max-w-lg md:py-24"
    >
      <span
        aria-hidden="true"
        className="grid size-20 place-items-center rounded-full bg-brand text-cream md:size-24"
      >
        <svg
          viewBox="0 0 24 24"
          className="size-10 md:size-12"
          fill="none"
          stroke="currentColor"
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M5 13l4 4L19 7" />
        </svg>
      </span>

      <div className="space-y-3">
        <p className="text-lg font-bold leading-8 text-ink md:text-2xl">
          {COPY.footer.line1}
        </p>
        <p className="text-sm leading-7 text-muted md:text-base">
          {COPY.footer.line2}
        </p>
      </div>

      {action}
    </div>
  );
}

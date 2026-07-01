import { COPY } from "@/lib/survey";
import { Brand } from "./Brand";

// Shared success screen — used both in place after submit and on /thanks.
export function ThankYou() {
  return (
    <div
      role="status"
      className="mx-auto flex max-w-md flex-col items-center gap-7 px-5 py-20 text-center"
    >
      <span
        aria-hidden="true"
        className="grid size-20 place-items-center rounded-full bg-brand text-cream"
      >
        <svg
          viewBox="0 0 24 24"
          className="size-10"
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
        <p className="text-lg font-bold leading-8 text-ink">
          {COPY.footer.line1}
        </p>
        <p className="text-sm leading-7 text-muted">{COPY.footer.line2}</p>
      </div>

      <Brand surface="paper" />
    </div>
  );
}

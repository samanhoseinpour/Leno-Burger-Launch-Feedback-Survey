import type { Metadata } from "next";
import Link from "next/link";
import { Brand } from "@/components/Brand";
import { toPersianDigits } from "@/lib/format";

export const metadata: Metadata = {
  title: "صفحه پیدا نشد | لنو",
};

// Global 404 — same centered paper-card shell as /thanks, with the same
// back-to-survey pill so a lost guest lands back on the form. Copy is
// interface-voice microcopy (like UI_COPY), not card copy.
export default function NotFound() {
  return (
    <main
      data-canvas="cream2"
      className="flex min-h-dvh items-center justify-center sm:bg-cream2 sm:px-6 sm:py-10"
    >
      <div className="mx-auto w-full max-w-[600px] bg-paper sm:overflow-hidden sm:rounded-[2rem] sm:border sm:border-line sm:shadow-[0_24px_60px_-32px_rgb(90_24_12/0.4)]">
        <div className="mx-auto flex max-w-md flex-col items-center gap-7 px-5 py-20 text-center">
          <p className="text-7xl font-bold leading-none tracking-tight text-brand tabular-nums">
            {toPersianDigits(404)}
          </p>

          <div className="space-y-3">
            <h1 className="text-lg font-bold leading-8 text-ink">
              صفحه‌ی موردنظر پیدا نشد.
            </h1>
            <p className="text-sm leading-7 text-muted">
              به نظر می‌رسد نشانی واردشده وجود ندارد یا جابه‌جا شده است.
            </p>
          </div>

          <Link
            href="/"
            className="rounded-full border border-line px-5 py-3 text-sm text-ink transition hover:border-brand hover:text-brand"
          >
            بازگشت به نظرسنجی
          </Link>

          <Brand surface="paper" />
        </div>
      </div>
    </main>
  );
}

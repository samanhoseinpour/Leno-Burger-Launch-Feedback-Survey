import type { Metadata } from "next";
import Link from "next/link";
import { ThankYou } from "@/components/ThankYou";

export const metadata: Metadata = {
  title: "سپاسگزاریم | لنو",
};

// Standalone thank-you screen (used when the success flow redirects here rather
// than swapping in place on the survey page).
export default function ThanksPage() {
  return (
    <main
      data-canvas="cream2"
      className="flex min-h-dvh items-center justify-center sm:bg-cream2 sm:px-6 sm:py-10"
    >
      <div className="mx-auto w-full max-w-[600px] bg-paper sm:overflow-hidden sm:rounded-[2rem] sm:border sm:border-line sm:shadow-[0_24px_60px_-32px_rgb(90_24_12/0.4)]">
        <ThankYou
          action={
            // Same pill as the admin header's back link, sized for a ≥44px
            // guest tap target.
            <Link
              href="/"
              className="rounded-full border border-line px-5 py-3 text-sm text-ink transition hover:border-brand hover:text-brand"
            >
              بازگشت به نظرسنجی
            </Link>
          }
        />
      </div>
    </main>
  );
}

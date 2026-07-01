import type { Metadata } from "next";
import { ThankYou } from "@/components/ThankYou";

export const metadata: Metadata = {
  title: "سپاسگزاریم | لنو",
};

// Standalone thank-you screen (used when the success flow redirects here rather
// than swapping in place on the survey page).
export default function ThanksPage() {
  return (
    <main className="flex min-h-dvh items-center justify-center sm:bg-cream2 sm:px-6 sm:py-10">
      <div className="mx-auto w-full max-w-[600px] bg-paper sm:overflow-hidden sm:rounded-[2rem] sm:border sm:border-line sm:shadow-[0_24px_60px_-32px_rgb(90_24_12/0.4)]">
        <ThankYou />
      </div>
    </main>
  );
}

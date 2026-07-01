import type { Metadata } from "next";
import { ThankYou } from "@/components/ThankYou";

export const metadata: Metadata = {
  title: "سپاسگزاریم | لنو",
};

// Standalone thank-you screen (used when the success flow redirects here rather
// than swapping in place on the survey page).
export default function ThanksPage() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md items-center">
      <ThankYou />
    </main>
  );
}

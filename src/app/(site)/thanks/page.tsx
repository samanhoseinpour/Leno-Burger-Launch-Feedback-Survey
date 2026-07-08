import type { Metadata } from "next";
import Link from "next/link";
import { CenteredPanel } from "@/components/CenteredPanel";
import { ThankYou } from "@/components/ThankYou";
import { SITE_COPY } from "@/lib/site";

export const metadata: Metadata = {
  title: "سپاسگزاریم | لنو",
};

// Standalone thank-you screen (used when the success flow redirects here rather
// than swapping in place on the survey page). Framed by the shared CenteredPanel
// so it matches /menu and /404 between the nav and footer.
export default function ThanksPage() {
  return (
    <CenteredPanel>
      <ThankYou
        action={
          <Link
            href="/"
            className="rounded-full border border-line px-5 py-3 text-sm text-ink transition hover:border-brand hover:text-brand"
          >
            {SITE_COPY.backHome}
          </Link>
        }
      />
    </CenteredPanel>
  );
}

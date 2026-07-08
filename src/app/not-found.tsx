import type { Metadata } from "next";
import Link from "next/link";
import { Brand } from "@/components/Brand";
import { CenteredPanel } from "@/components/CenteredPanel";
import { SiteChrome } from "@/components/SiteChrome";
import { toPersianDigits } from "@/lib/format";
import { SITE_COPY } from "@/lib/site";

export const metadata: Metadata = {
  title: "صفحه پیدا نشد | لنو",
};

// Global 404. It is rendered by the ROOT layout — NOT the (site) route-group
// layout — so it can't inherit the shared chrome and self-mounts <SiteChrome>
// to get the same nav + footer + skip link. Copy is interface-voice microcopy.
export default function NotFound() {
  return (
    <SiteChrome>
      <CenteredPanel>
        <div className="mx-auto flex max-w-lg flex-col items-center gap-7 px-5 py-20 text-center md:py-24">
          <p className="text-7xl font-black leading-none tracking-tight text-brand tabular-nums md:text-8xl">
            {toPersianDigits(404)}
          </p>

          <div className="space-y-3">
            <h1 className="text-lg font-bold leading-8 text-ink md:text-2xl">
              صفحه‌ی موردنظر پیدا نشد.
            </h1>
            <p className="text-sm leading-7 text-muted md:text-base">
              به نظر می‌رسد نشانی واردشده وجود ندارد یا جابه‌جا شده است.
            </p>
          </div>

          <Link
            href="/"
            className="rounded-full border border-line px-5 py-3 text-sm text-ink transition hover:border-brand hover:text-brand"
          >
            {SITE_COPY.backHome}
          </Link>

          <Brand surface="paper" />
        </div>
      </CenteredPanel>
    </SiteChrome>
  );
}

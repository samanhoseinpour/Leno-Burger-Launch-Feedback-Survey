import Link from "next/link";
import { AdminLogin } from "@/components/admin/AdminLogin";
import { SITE_COPY } from "@/lib/site";

// The whole unauthenticated screen. Every admin page renders this in place of
// its content when `isAdmin()` is false — a layout gate would not work, because
// Next renders layouts and pages in parallel, so the page (and its database
// query) would still run behind a layout that discarded `children`.
export function AdminLoginScreen() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-sm flex-col items-center justify-center gap-5 px-5 py-10">
      <AdminLogin />
      {/* /admin is outside the (site) route group, so no SiteNav renders here.
          Without this the only way back to the public site is editing the URL.
          Same pill as the dashboard header; the chevron points right — the
          "back" direction in RTL. */}
      <Link
        href="/"
        className="group inline-flex min-h-11 items-center gap-2 rounded-full border border-line px-4 text-sm text-muted transition hover:border-brand hover:text-brand"
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className="size-4 shrink-0 transition group-hover:translate-x-0.5"
          fill="none"
          stroke="currentColor"
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M9 18l6-6-6-6" />
        </svg>
        {SITE_COPY.backHome}
      </Link>
    </main>
  );
}

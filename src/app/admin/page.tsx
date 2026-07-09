import type { Metadata } from "next";
import Link from "next/link";
import { isAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AdminLogin } from "@/components/admin/AdminLogin";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { SITE_COPY } from "@/lib/site";

export const metadata: Metadata = {
  title: "داشبورد | لنو",
  // Pinned, not inherited: the dashboard stays out of search even after
  // SEARCH_INDEXING is switched on for the public pages.
  robots: { index: false, follow: false },
};

// Always render fresh: this reads the session cookie and the latest responses.
export const dynamic = "force-dynamic";

export default async function AdminPage() {
  if (!(await isAdmin())) {
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

  const responses = await prisma.response.findMany({
    orderBy: { createdAt: "desc" },
  });

  return <AdminDashboard responses={responses} />;
}

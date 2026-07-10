import type { Metadata } from "next";
import { AdminLoginScreen } from "@/components/admin/AdminLoginScreen";
import { AdminShell } from "@/components/admin/AdminShell";
import { NavCard } from "@/components/NavCard";
import { FeedbackIcon, MenuIcon } from "@/components/icons";
import { isAdmin } from "@/lib/auth";
import { ADMIN_COPY } from "@/lib/menu-copy";

export const metadata: Metadata = {
  title: "پنل مدیریت | لنو",
  // Pinned, not inherited: the admin area stays out of search even after
  // SEARCH_INDEXING is switched on for the public pages.
  robots: { index: false, follow: false },
};

// Always render fresh: this reads the session cookie.
export const dynamic = "force-dynamic";

// The section picker. Also the post-login landing page (`adminLogin` redirects
// here), so it must render the login screen when the session is missing.
export default async function AdminPage() {
  if (!(await isAdmin())) return <AdminLoginScreen />;

  return (
    <AdminShell active={null} subtitle={ADMIN_COPY.hub.title}>
      <p className="mt-6 text-sm leading-7 text-muted">
        {ADMIN_COPY.hub.subtitle}
      </p>

      <div className="mt-4 flex flex-col gap-4">
        <NavCard
          href="/admin/survey"
          title={ADMIN_COPY.hub.survey.title}
          description={ADMIN_COPY.hub.survey.desc}
          icon={<FeedbackIcon />}
        />
        <NavCard
          href="/admin/menu"
          title={ADMIN_COPY.hub.menu.title}
          description={ADMIN_COPY.hub.menu.desc}
          icon={<MenuIcon />}
        />
      </div>
    </AdminShell>
  );
}

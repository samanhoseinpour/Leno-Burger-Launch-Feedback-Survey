import type { Metadata } from "next";
import { AdminLoginScreen } from "@/components/admin/AdminLoginScreen";
import { AdminShell } from "@/components/admin/AdminShell";
import { SurveyDashboard } from "@/components/admin/SurveyDashboard";
import { isAdmin } from "@/lib/auth";
import { ADMIN_COPY } from "@/lib/menu-copy";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "نظرسنجی | لنو",
  robots: { index: false, follow: false },
};

// Always render fresh: this reads the session cookie and the latest responses.
export const dynamic = "force-dynamic";

export default async function AdminSurveyPage() {
  // The gate has to sit above the query. A layout can't do this: Next renders
  // layouts and pages in parallel, so the query would run anyway.
  if (!(await isAdmin())) return <AdminLoginScreen />;

  const responses = await prisma.response.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <AdminShell active="survey" subtitle={ADMIN_COPY.subtitles.survey}>
      <SurveyDashboard responses={responses} />
    </AdminShell>
  );
}

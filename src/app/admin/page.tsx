import type { Metadata } from "next";
import { isAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AdminLogin } from "@/components/admin/AdminLogin";
import { AdminDashboard } from "@/components/admin/AdminDashboard";

export const metadata: Metadata = {
  title: "داشبورد | لنو",
};

// Always render fresh: this reads the session cookie and the latest responses.
export const dynamic = "force-dynamic";

export default async function AdminPage() {
  if (!(await isAdmin())) {
    return (
      <main className="mx-auto flex min-h-dvh max-w-sm items-center px-5">
        <AdminLogin />
      </main>
    );
  }

  const responses = await prisma.response.findMany({
    orderBy: { createdAt: "desc" },
  });

  return <AdminDashboard responses={responses} />;
}

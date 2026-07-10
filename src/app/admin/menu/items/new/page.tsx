import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createMenuItem } from "@/app/admin/menu/actions";
import { AdminLoginScreen } from "@/components/admin/AdminLoginScreen";
import { AdminShell } from "@/components/admin/AdminShell";
import { MenuItemForm } from "@/components/admin/MenuItemForm";
import { isAdmin } from "@/lib/auth";
import { ADMIN_COPY, MENU_ADMIN_COPY } from "@/lib/menu-copy";
import { usedIconSlugs } from "@/lib/menu-usage";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "آیتم تازه | لنو",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function NewMenuItemPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  if (!(await isAdmin())) return <AdminLoginScreen />;

  const [categories, usedSlugs] = await Promise.all([
    prisma.menuCategory.findMany({ orderBy: [{ sortOrder: "asc" }, { id: "asc" }] }),
    usedIconSlugs(),
  ]);

  // An item has to land in a category. With none, the form would be a dead end,
  // so send them back to the manager, which explains what to do first.
  if (categories.length === 0) redirect("/admin/menu");

  const { category } = await searchParams;

  return (
    <AdminShell active="menu" subtitle={ADMIN_COPY.subtitles.menu}>
      <h1 className="mt-6 text-lg font-bold text-ink">
        {MENU_ADMIN_COPY.newItemTitle}
      </h1>
      <MenuItemForm
        action={createMenuItem}
        categories={categories}
        defaultCategoryId={category}
        usedSlugs={usedSlugs}
      />
    </AdminShell>
  );
}

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { updateMenuItem } from "@/app/admin/menu/actions";
import { AdminLoginScreen } from "@/components/admin/AdminLoginScreen";
import { AdminShell } from "@/components/admin/AdminShell";
import { MenuItemForm } from "@/components/admin/MenuItemForm";
import { isAdmin } from "@/lib/auth";
import { ADMIN_COPY, MENU_ADMIN_COPY } from "@/lib/menu-copy";
import { usedIconSlugs } from "@/lib/menu-usage";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "ویرایش آیتم | لنو",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function EditMenuItemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  if (!(await isAdmin())) return <AdminLoginScreen />;

  const { id } = await params;
  const [item, categories, usedSlugs] = await Promise.all([
    prisma.menuItem.findUnique({ where: { id } }),
    prisma.menuCategory.findMany({ orderBy: [{ sortOrder: "asc" }, { id: "asc" }] }),
    usedIconSlugs({ exceptItemId: id }),
  ]);

  if (!item) notFound();

  return (
    <AdminShell active="menu" subtitle={ADMIN_COPY.subtitles.menu}>
      <h1 className="mt-6 text-lg font-bold text-ink">
        {MENU_ADMIN_COPY.editItemTitle}
      </h1>
      <MenuItemForm
        action={updateMenuItem}
        categories={categories}
        item={item}
        usedSlugs={usedSlugs}
      />
    </AdminShell>
  );
}

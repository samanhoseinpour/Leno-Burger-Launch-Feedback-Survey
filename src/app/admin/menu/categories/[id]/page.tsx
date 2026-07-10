import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { updateMenuCategory } from "@/app/admin/menu/actions";
import { AdminLoginScreen } from "@/components/admin/AdminLoginScreen";
import { AdminShell } from "@/components/admin/AdminShell";
import { MenuCategoryForm } from "@/components/admin/MenuCategoryForm";
import { isAdmin } from "@/lib/auth";
import { ADMIN_COPY, MENU_ADMIN_COPY } from "@/lib/menu-copy";
import { usedIconSlugs } from "@/lib/menu-usage";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "ویرایش دسته | لنو",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function EditMenuCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  if (!(await isAdmin())) return <AdminLoginScreen />;

  const { id } = await params;
  const [category, usedSlugs] = await Promise.all([
    prisma.menuCategory.findUnique({ where: { id } }),
    usedIconSlugs({ exceptCategoryId: id }),
  ]);
  if (!category) notFound();

  return (
    <AdminShell active="menu" subtitle={ADMIN_COPY.subtitles.menu}>
      <h1 className="mt-6 text-lg font-bold text-ink">
        {MENU_ADMIN_COPY.editCategoryTitle}
      </h1>
      <MenuCategoryForm
        action={updateMenuCategory}
        category={category}
        usedSlugs={usedSlugs}
      />
    </AdminShell>
  );
}

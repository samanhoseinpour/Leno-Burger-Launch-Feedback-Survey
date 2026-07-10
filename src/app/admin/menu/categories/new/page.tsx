import type { Metadata } from "next";
import { createMenuCategory } from "@/app/admin/menu/actions";
import { AdminLoginScreen } from "@/components/admin/AdminLoginScreen";
import { AdminShell } from "@/components/admin/AdminShell";
import { MenuCategoryForm } from "@/components/admin/MenuCategoryForm";
import { isAdmin } from "@/lib/auth";
import { ADMIN_COPY, MENU_ADMIN_COPY } from "@/lib/menu-copy";
import { usedIconSlugs } from "@/lib/menu-usage";

export const metadata: Metadata = {
  title: "دسته‌ی تازه | لنو",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function NewMenuCategoryPage() {
  if (!(await isAdmin())) return <AdminLoginScreen />;

  const usedSlugs = await usedIconSlugs();

  return (
    <AdminShell active="menu" subtitle={ADMIN_COPY.subtitles.menu}>
      <h1 className="mt-6 text-lg font-bold text-ink">
        {MENU_ADMIN_COPY.newCategoryTitle}
      </h1>
      <MenuCategoryForm action={createMenuCategory} usedSlugs={usedSlugs} />
    </AdminShell>
  );
}

import type { Metadata } from "next";
import { AdminLoginScreen } from "@/components/admin/AdminLoginScreen";
import { AdminShell } from "@/components/admin/AdminShell";
import { MenuManager } from "@/components/admin/MenuManager";
import { Toast } from "@/components/admin/Toast";
import { isAdmin } from "@/lib/auth";
import {
  ADMIN_COPY,
  flashMessage,
  resolveFlash,
  resolveFlashName,
} from "@/lib/menu-copy";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "مدیریت منو | لنو",
  robots: { index: false, follow: false },
};

// Always render fresh: this reads the session cookie and the latest menu.
export const dynamic = "force-dynamic";

// Every menu mutation redirects back here carrying `?flash=<code>&n=<nonce>`,
// plus the `name` of the row it touched. The code names the toast; the nonce
// only exists to re-key it (see `flashUrl`). All three are URL input, so all
// three go through a resolver before they reach the DOM.
export default async function AdminMenuPage({
  searchParams,
}: {
  searchParams: Promise<{ flash?: string; n?: string; name?: string }>;
}) {
  if (!(await isAdmin())) return <AdminLoginScreen />;

  const categories = await prisma.menuCategory.findMany({
    orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
    include: { items: { orderBy: [{ sortOrder: "asc" }, { id: "asc" }] } },
  });

  const { flash: rawFlash, n, name: rawName } = await searchParams;
  const flash = resolveFlash(rawFlash);

  return (
    <AdminShell active="menu" subtitle={ADMIN_COPY.subtitles.menu}>
      <MenuManager categories={categories} />
      {flash && (
        <Toast
          key={n}
          message={flashMessage(flash, resolveFlashName(rawName))}
          tone={flash === "error" ? "error" : "success"}
        />
      )}
    </AdminShell>
  );
}

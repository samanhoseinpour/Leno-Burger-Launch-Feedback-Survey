"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";
import { MENU_ADMIN_COPY, type FlashCode } from "@/lib/menu-copy";
import {
  MenuCategorySchema,
  MenuItemSchema,
  menuCategoryFromFormData,
  menuItemFromFormData,
  type MenuCategoryField,
  type MenuItemField,
} from "@/lib/menu-validation";
import { prisma } from "@/lib/prisma";
import { fieldErrorsOf, type FieldErrors } from "@/lib/validation";

const ERR = MENU_ADMIN_COPY.errors;

// Server Actions are public HTTP endpoints — the `isAdmin()` gate on the admin
// PAGES does nothing for them. Every mutation below re-checks the session itself.
// This is the only thing standing between the menu and the open internet.

export type MenuFormState =
  | { status: "idle" }
  | {
      status: "error";
      kind: "validation";
      fieldErrors: FieldErrors<MenuItemField | MenuCategoryField>;
    }
  | { status: "error"; kind: "conflict"; message: string }
  | { status: "error"; kind: "auth" }
  | { status: "error"; kind: "server" };

const SERVER_ERROR: MenuFormState = { status: "error", kind: "server" };
const AUTH_ERROR: MenuFormState = { status: "error", kind: "auth" };

const conflict = (message: string): MenuFormState => ({
  status: "error",
  kind: "conflict",
  message,
});

function isPrismaError(error: unknown, code: string): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError && error.code === code
  );
}

/**
 * Rewrite `sortOrder` for a whole sibling list so it is dense and gap-free.
 * Called after every move: a plain two-row swap silently no-ops whenever two
 * rows share a `sortOrder`, and Postgres orders tied rows arbitrarily. Reading
 * with an `id` tie-break and rewriting every index makes the order self-healing.
 */
function reindex<T extends { id: string }>(
  rows: T[],
  update: (id: string, sortOrder: number) => Prisma.PrismaPromise<unknown>,
) {
  return prisma.$transaction(rows.map((row, index) => update(row.id, index)));
}

// The `sortOrder` for a newly appended row. Deliberately `max + 1`, never
// `count()`: deleting a row leaves a gap, after which `count()` collides with an
// existing row and the newcomer lands wherever the id tie-break puts it — for a
// cuid, usually *not* last. `max + 1` appends no matter how sparse the list is.
async function nextItemSortOrder(categoryId: string): Promise<number> {
  const last = await prisma.menuItem.findFirst({
    where: { categoryId },
    orderBy: { sortOrder: "desc" },
    select: { sortOrder: true },
  });
  return last ? last.sortOrder + 1 : 0;
}

async function nextCategorySortOrder(): Promise<number> {
  const last = await prisma.menuCategory.findFirst({
    orderBy: { sortOrder: "desc" },
    select: { sortOrder: true },
  });
  return last ? last.sortOrder + 1 : 0;
}

/** Move `id` one slot toward the start (`up`) or end (`down`) of `ordered`. */
function reorder<T extends { id: string }>(
  ordered: T[],
  id: string,
  direction: "up" | "down",
): T[] | null {
  const from = ordered.findIndex((row) => row.id === id);
  if (from === -1) return null;

  const to = direction === "up" ? from - 1 : from + 1;
  if (to < 0 || to >= ordered.length) return null; // already at an edge

  const next = [...ordered];
  [next[from], next[to]] = [next[to], next[from]];
  return next;
}

/** The public menu is an ISR page, so it only refreshes when we say so. */
function revalidateMenu() {
  revalidatePath("/menu");
}

/**
 * Where every mutation lands, carrying the toast it wants the manager to show.
 *
 * The nonce is not decoration. Delete two items in a row and `?flash=` is byte
 * for byte the same both times, so React sees identical props, never remounts
 * <Toast>, never restarts its dismiss timer — and the second toast silently
 * never appears. The nonce is what <Toast> is keyed on.
 *
 * `name` is the row the action just touched, so the toast can say WHICH one.
 * It is omitted when the row was already gone — the fallback copy covers that.
 */
function flashUrl(code: FlashCode, name?: string): string {
  const params = new URLSearchParams({
    flash: code,
    n: crypto.randomUUID().slice(0, 8),
  });
  if (name) params.set("name", name);
  return `/admin/menu?${params}`;
}

// ─── Items ───────────────────────────────────────────────────────────────────

export async function createMenuItem(
  _prev: MenuFormState,
  formData: FormData,
): Promise<MenuFormState> {
  if (!(await isAdmin())) return AUTH_ERROR;

  const parsed = MenuItemSchema.safeParse(menuItemFromFormData(formData));
  if (!parsed.success) {
    return {
      status: "error",
      kind: "validation",
      fieldErrors: fieldErrorsOf<MenuItemField>(parsed.error),
    };
  }

  try {
    const sortOrder = await nextItemSortOrder(parsed.data.categoryId);
    await prisma.menuItem.create({ data: { ...parsed.data, sortOrder } });
  } catch (error) {
    if (isPrismaError(error, "P2003")) {
      return conflict(ERR.categoryMissing); // category deleted mid-submit
    }
    console.error("Failed to create menu item:", error);
    return SERVER_ERROR;
  }

  revalidateMenu();
  // Outside the try — `redirect` throws NEXT_REDIRECT.
  redirect(flashUrl("item-created", parsed.data.name));
}

export async function updateMenuItem(
  _prev: MenuFormState,
  formData: FormData,
): Promise<MenuFormState> {
  if (!(await isAdmin())) return AUTH_ERROR;

  const id = String(formData.get("id") ?? "");
  if (!id) return SERVER_ERROR;

  const parsed = MenuItemSchema.safeParse(menuItemFromFormData(formData));
  if (!parsed.success) {
    return {
      status: "error",
      kind: "validation",
      fieldErrors: fieldErrorsOf<MenuItemField>(parsed.error),
    };
  }

  try {
    const existing = await prisma.menuItem.findUnique({
      where: { id },
      select: { categoryId: true },
    });
    if (!existing) return conflict(ERR.itemMissing);

    // Moving an item to another category: its old `sortOrder` means nothing
    // there and would tie with a sibling, so append it instead.
    const data =
      existing.categoryId === parsed.data.categoryId
        ? parsed.data
        : {
            ...parsed.data,
            sortOrder: await nextItemSortOrder(parsed.data.categoryId),
          };

    await prisma.menuItem.update({ where: { id }, data });
  } catch (error) {
    if (isPrismaError(error, "P2025")) return conflict(ERR.itemMissing);
    if (isPrismaError(error, "P2003")) return conflict(ERR.categoryMissing);
    console.error("Failed to update menu item:", error);
    return SERVER_ERROR;
  }

  revalidateMenu();
  redirect(flashUrl("item-updated", parsed.data.name));
}

// The three actions below used to `return` silently from inside their try/catch,
// so a failed delete looked exactly like a successful one. They now report an
// outcome — which means `redirect()` can no longer live in either block: it
// signals by THROWING NEXT_REDIRECT, and the catch would swallow it. Compute the
// flash, fall out of the block, then redirect.

export async function deleteMenuItem(formData: FormData): Promise<void> {
  if (!(await isAdmin())) redirect("/admin");

  const id = String(formData.get("id") ?? "");
  if (!id) return;

  let flash: FlashCode = "item-deleted";
  // `delete` hands back the row it removed, which is the only chance to read the
  // name — a second later there is nothing left to select it from.
  let name: string | undefined;
  try {
    ({ name } = await prisma.menuItem.delete({
      where: { id },
      select: { name: true },
    }));
  } catch (error) {
    if (!isPrismaError(error, "P2025")) {
      // P2025 = already gone. It is off the menu either way, so still a success.
      console.error("Failed to delete menu item:", error);
      flash = "error";
    }
  }

  if (flash !== "error") revalidateMenu();
  redirect(flashUrl(flash, name));
}

export async function toggleMenuItemAvailability(
  formData: FormData,
): Promise<void> {
  if (!(await isAdmin())) redirect("/admin");

  const id = String(formData.get("id") ?? "");
  if (!id) return;

  let flash: FlashCode | null = null;
  let name: string | undefined;
  try {
    const item = await prisma.menuItem.findUnique({
      where: { id },
      select: { available: true, name: true },
    });
    if (item) {
      const available = !item.available;
      await prisma.menuItem.update({ where: { id }, data: { available } });
      flash = available ? "item-shown" : "item-hidden";
      name = item.name;
    }
  } catch (error) {
    console.error("Failed to toggle menu item availability:", error);
    flash = "error";
  }

  if (flash === null) return; // the row vanished; the re-render already says so
  if (flash !== "error") revalidateMenu();
  redirect(flashUrl(flash, name));
}

export async function moveMenuItem(formData: FormData): Promise<void> {
  if (!(await isAdmin())) redirect("/admin");

  const id = String(formData.get("id") ?? "");
  const direction = String(formData.get("direction") ?? "");
  if (!id || (direction !== "up" && direction !== "down")) return;

  try {
    const item = await prisma.menuItem.findUnique({
      where: { id },
      select: { categoryId: true },
    });
    if (!item) return;

    const siblings = await prisma.menuItem.findMany({
      where: { categoryId: item.categoryId },
      orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
      select: { id: true },
    });

    const next = reorder(siblings, id, direction);
    if (!next) return;

    await reindex(next, (rowId, sortOrder) =>
      prisma.menuItem.update({ where: { id: rowId }, data: { sortOrder } }),
    );
  } catch (error) {
    console.error("Failed to move menu item:", error);
    return;
  }

  revalidateMenu();
}

// ─── Categories ──────────────────────────────────────────────────────────────

export async function createMenuCategory(
  _prev: MenuFormState,
  formData: FormData,
): Promise<MenuFormState> {
  if (!(await isAdmin())) return AUTH_ERROR;

  const parsed = MenuCategorySchema.safeParse(
    menuCategoryFromFormData(formData),
  );
  if (!parsed.success) {
    return {
      status: "error",
      kind: "validation",
      fieldErrors: fieldErrorsOf<MenuCategoryField>(parsed.error),
    };
  }

  try {
    const sortOrder = await nextCategorySortOrder();
    await prisma.menuCategory.create({ data: { ...parsed.data, sortOrder } });
  } catch (error) {
    if (isPrismaError(error, "P2002")) return conflict(ERR.duplicateCategory);
    console.error("Failed to create menu category:", error);
    return SERVER_ERROR;
  }

  revalidateMenu();
  redirect(flashUrl("category-created", parsed.data.name));
}

export async function updateMenuCategory(
  _prev: MenuFormState,
  formData: FormData,
): Promise<MenuFormState> {
  if (!(await isAdmin())) return AUTH_ERROR;

  const id = String(formData.get("id") ?? "");
  if (!id) return SERVER_ERROR;

  const parsed = MenuCategorySchema.safeParse(
    menuCategoryFromFormData(formData),
  );
  if (!parsed.success) {
    return {
      status: "error",
      kind: "validation",
      fieldErrors: fieldErrorsOf<MenuCategoryField>(parsed.error),
    };
  }

  try {
    await prisma.menuCategory.update({ where: { id }, data: parsed.data });
  } catch (error) {
    if (isPrismaError(error, "P2002")) return conflict(ERR.duplicateCategory);
    if (isPrismaError(error, "P2025")) return conflict(ERR.categoryMissing);
    console.error("Failed to update menu category:", error);
    return SERVER_ERROR;
  }

  revalidateMenu();
  redirect(flashUrl("category-updated", parsed.data.name));
}

export async function deleteMenuCategory(formData: FormData): Promise<void> {
  if (!(await isAdmin())) redirect("/admin");

  const id = String(formData.get("id") ?? "");
  if (!id) return;

  let flash: FlashCode | null = "category-deleted";
  let name: string | undefined;
  try {
    // The manager only renders the delete control for empty categories, so this
    // guard (and the `onDelete: Restrict` P2003 below it) only catches a race or
    // a hand-rolled POST.
    const items = await prisma.menuItem.count({ where: { categoryId: id } });
    if (items > 0) flash = null;
    else
      ({ name } = await prisma.menuCategory.delete({
        where: { id },
        select: { name: true },
      }));
  } catch (error) {
    // P2025 = already gone. P2003 = an item slipped in under the count.
    if (isPrismaError(error, "P2025")) flash = "category-deleted";
    else if (isPrismaError(error, "P2003")) flash = null;
    else {
      console.error("Failed to delete menu category:", error);
      flash = "error";
    }
  }

  if (flash === null) return;
  if (flash !== "error") revalidateMenu();
  redirect(flashUrl(flash, name));
}

export async function moveMenuCategory(formData: FormData): Promise<void> {
  if (!(await isAdmin())) redirect("/admin");

  const id = String(formData.get("id") ?? "");
  const direction = String(formData.get("direction") ?? "");
  if (!id || (direction !== "up" && direction !== "down")) return;

  try {
    const categories = await prisma.menuCategory.findMany({
      orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
      select: { id: true },
    });

    const next = reorder(categories, id, direction);
    if (!next) return;

    await reindex(next, (rowId, sortOrder) =>
      prisma.menuCategory.update({ where: { id: rowId }, data: { sortOrder } }),
    );
  } catch (error) {
    console.error("Failed to move menu category:", error);
    return;
  }

  revalidateMenu();
}

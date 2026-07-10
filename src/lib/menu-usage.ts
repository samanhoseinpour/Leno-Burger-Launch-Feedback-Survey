// Server-only reads that the admin forms need but the Server Actions don't own.
// Kept out of `actions.ts`: every export of a "use server" module becomes a
// public HTTP endpoint, and this is a query, not a mutation.

import { prisma } from "./prisma";

/**
 * Icon slugs already spoken for by some OTHER row, so the picker can flag a
 * duplicate before staff pick it. The row being edited excludes itself —
 * otherwise every edit form would report its own icon as "already used".
 */
export async function usedIconSlugs({
  exceptItemId,
  exceptCategoryId,
}: {
  exceptItemId?: string;
  exceptCategoryId?: string;
} = {}): Promise<string[]> {
  const [items, categories] = await Promise.all([
    prisma.menuItem.findMany({
      where: {
        icon: { not: null },
        ...(exceptItemId ? { id: { not: exceptItemId } } : {}),
      },
      select: { icon: true },
      distinct: ["icon"],
    }),
    prisma.menuCategory.findMany({
      where: {
        icon: { not: null },
        ...(exceptCategoryId ? { id: { not: exceptCategoryId } } : {}),
      },
      select: { icon: true },
      distinct: ["icon"],
    }),
  ]);

  const slugs = [...items, ...categories]
    .map((row) => row.icon)
    .filter((icon): icon is string => icon !== null);

  return [...new Set(slugs)];
}

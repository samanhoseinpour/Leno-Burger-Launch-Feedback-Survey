"use client";

import type { MenuCategory } from "@prisma/client";
import Link from "next/link";
import { useActionState } from "react";
import type { MenuFormState } from "@/app/admin/menu/actions";
import { IconPicker } from "@/components/admin/IconPicker";
import { MENU_ADMIN_COPY } from "@/lib/menu-copy";

const initialState: MenuFormState = { status: "idle" };
const C = MENU_ADMIN_COPY;

// Create and edit share one form: `category` decides which. A duplicate name
// comes back from the action as a `conflict` (the DB holds the unique index).
export function MenuCategoryForm({
  action,
  category,
  usedSlugs,
}: {
  action: (prev: MenuFormState, formData: FormData) => Promise<MenuFormState>;
  category?: MenuCategory;
  usedSlugs?: readonly string[];
}) {
  const [state, formAction, pending] = useActionState(action, initialState);

  const fieldErrors =
    state.status === "error" && state.kind === "validation"
      ? state.fieldErrors
      : {};

  const nameError = fieldErrors.name;

  const banner =
    state.status === "error" && state.kind === "conflict"
      ? state.message
      : state.status === "error" && state.kind === "auth"
        ? C.errors.auth
        : state.status === "error" && state.kind === "server"
          ? C.errors.server
          : null;

  return (
    <form action={formAction} className="mt-6">
      {category && <input type="hidden" name="id" value={category.id} />}

      <div className="space-y-5 rounded-2xl border border-line bg-cream/30 p-5">
        <div>
          <label htmlFor="name" className="block text-sm text-muted">
            {C.fields.categoryName}
          </label>
          <input
            id="name"
            name="name"
            type="text"
            autoFocus
            defaultValue={category?.name ?? ""}
            className="mt-1.5 h-11 w-full rounded-xl border border-line bg-paper px-3 text-start text-base text-ink outline-none transition focus:border-brand"
          />
          {nameError && (
            <p role="alert" className="mt-1.5 text-sm font-medium text-brand">
              {nameError}
            </p>
          )}
        </div>

        <IconPicker
          defaultValue={category?.icon ?? null}
          usedSlugs={usedSlugs}
          error={fieldErrors.icon}
        />
      </div>

      {banner && (
        <p
          role="alert"
          className="mt-6 rounded-xl bg-brand/10 px-4 py-3 text-center text-sm font-medium text-brand"
        >
          {banner}
        </p>
      )}

      <div className="mt-6 flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="h-12 flex-1 rounded-xl bg-brand font-bold text-cream transition active:scale-[0.99] disabled:opacity-60 cursor-pointer"
        >
          {C.save}
        </button>
        <Link
          href="/admin/menu"
          className="inline-flex h-12 items-center rounded-xl border border-line px-5 text-sm text-muted transition hover:border-brand hover:text-brand"
        >
          {C.cancel}
        </Link>
      </div>
    </form>
  );
}

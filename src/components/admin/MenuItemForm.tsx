"use client";

import type { MenuCategory, MenuItem } from "@prisma/client";
import Link from "next/link";
import { useActionState } from "react";
import type { MenuFormState } from "@/app/admin/menu/actions";
import { IconPicker } from "@/components/admin/IconPicker";
import { PriceFields } from "@/components/admin/PriceFields";
import { MENU_ADMIN_COPY } from "@/lib/menu-copy";

const initialState: MenuFormState = { status: "idle" };
const C = MENU_ADMIN_COPY;

const inputClass =
  // text-base (16px), explicit: keeps iOS Safari from zooming in on focus.
  "mt-1.5 h-11 w-full rounded-xl border border-line bg-paper px-3 text-start text-base text-ink outline-none transition focus:border-brand";
const labelClass = "block text-sm text-muted";

// Create and edit share one form: `item` decides which. The Server Action
// re-validates with the same Zod schema, so a bypassed client check still can't
// write a bad row. On success the action redirects, so there is no success state
// to render here.
export function MenuItemForm({
  action,
  categories,
  item,
  defaultCategoryId,
  usedSlugs,
}: {
  action: (prev: MenuFormState, formData: FormData) => Promise<MenuFormState>;
  categories: MenuCategory[];
  item?: MenuItem;
  defaultCategoryId?: string;
  usedSlugs?: readonly string[];
}) {
  const [state, formAction, pending] = useActionState(action, initialState);

  const fieldErrors =
    state.status === "error" && state.kind === "validation"
      ? state.fieldErrors
      : {};

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
      {item && <input type="hidden" name="id" value={item.id} />}

      <div className="space-y-5 rounded-2xl border border-line bg-cream/30 p-5">
        <div>
          <label htmlFor="categoryId" className={labelClass}>
            {C.fields.category}
          </label>
          <select
            id="categoryId"
            name="categoryId"
            defaultValue={item?.categoryId ?? defaultCategoryId ?? ""}
            className={`${inputClass} cursor-pointer`}
          >
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          <FieldError message={fieldErrors.categoryId} />
        </div>

        <div>
          <label htmlFor="name" className={labelClass}>
            {C.fields.name}
          </label>
          <input
            id="name"
            name="name"
            type="text"
            autoFocus
            defaultValue={item?.name ?? ""}
            className={inputClass}
          />
          <FieldError message={fieldErrors.name} />
        </div>

        <div>
          <label htmlFor="description" className={labelClass}>
            {C.fields.description}{" "}
            <span className="text-xs">({C.fields.descriptionHint})</span>
          </label>
          <textarea
            id="description"
            name="description"
            rows={3}
            defaultValue={item?.description ?? ""}
            className={`${inputClass} h-auto resize-y py-2.5 leading-7`}
          />
          <FieldError message={fieldErrors.description} />
        </div>

        <PriceFields
          defaultPrice={item?.priceToman ?? null}
          defaultDiscount={item?.discountPercent ?? null}
          priceError={fieldErrors.priceToman}
          discountError={fieldErrors.discountPercent}
        />

        <IconPicker
          allowInherit
          defaultValue={item?.icon ?? null}
          usedSlugs={usedSlugs}
          error={fieldErrors.icon}
        />

        <label className="flex min-h-11 cursor-pointer items-center gap-3 text-sm text-ink">
          <input
            name="available"
            type="checkbox"
            defaultChecked={item?.available ?? true}
            className="size-5 shrink-0 cursor-pointer accent-[var(--color-brand)]"
          />
          {C.fields.available}
        </label>
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

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p role="alert" className="mt-1.5 text-sm font-medium text-brand">
      {message}
    </p>
  );
}

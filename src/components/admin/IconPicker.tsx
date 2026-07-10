"use client";

import { MenuGlyph } from "@/components/menu/MenuGlyph";
import { MENU_ADMIN_COPY } from "@/lib/menu-copy";
import {
  FALLBACK_ICON_SLUG,
  MENU_ICON_GROUPS,
  MENU_ICON_LABELS,
  isMenuIconSlug,
} from "@/lib/menu-icons";

const C = MENU_ADMIN_COPY;

// A real radio group, so it carries no client state and drops straight into the
// uncontrolled <form action={formAction}> both menu forms already use. Radios
// give us arrow-key traversal and a focus ring for free — the same reasoning as
// the survey's rating groups. Every tile shares `name="icon"`, so the arrow keys
// still walk all 58 of them regardless of the group headings.
//
// `allowInherit` prepends the «پیش‌فرض دسته» chip, which submits "" and means
// "inherit the category's icon". Categories have nothing to inherit from, so
// they omit it and `categoryIconField` requires a real slug.
//
// `usedSlugs` marks icons already spoken for elsewhere in the menu. It never
// disables them — two dishes may legitimately share a glyph — it just makes a
// duplicate a deliberate choice rather than an accident.
export function IconPicker({
  defaultValue,
  allowInherit = false,
  usedSlugs,
  error,
}: {
  defaultValue: string | null;
  allowInherit?: boolean;
  usedSlugs?: readonly string[];
  error?: string;
}) {
  // A row can hold a slug we have since retired. Fall back to something
  // selectable rather than rendering a group with nothing checked.
  const selected = isMenuIconSlug(defaultValue)
    ? defaultValue
    : allowInherit
      ? ""
      : FALLBACK_ICON_SLUG;

  const used = new Set(usedSlugs ?? []);

  return (
    <fieldset>
      <legend className="block text-sm text-muted">
        {allowInherit ? C.fields.icon : C.fields.categoryIcon}
      </legend>
      <p className="mt-1 text-xs text-muted">
        {allowInherit ? C.fields.iconHint : C.fields.categoryIconHint}
      </p>

      {allowInherit && (
        <label className="mt-2.5 inline-flex cursor-pointer">
          <input
            type="radio"
            name="icon"
            value=""
            defaultChecked={selected === ""}
            className="peer sr-only"
          />
          {/* Visible text is the accessible name here — no sr-only twin. */}
          <span className="flex h-11 items-center rounded-xl border border-dashed border-line bg-paper px-3 text-xs font-medium text-muted transition hover:border-brand peer-checked:border-solid peer-checked:border-brand peer-checked:bg-brand/10 peer-checked:text-brand peer-focus-visible:ring-2 peer-focus-visible:ring-brand">
            {C.fields.iconInherit}
          </span>
        </label>
      )}

      {MENU_ICON_GROUPS.map((group) => (
        // A nested fieldset per group: the heading is a real <legend>, not a
        // floating <p> that names nothing.
        <fieldset key={group.key} className="mt-4">
          <legend className="mb-2 text-xs font-semibold text-ink/70">
            {group.label}
          </legend>

          <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
            {group.slugs.map((slug) => (
              <label key={slug} className="cursor-pointer">
                <input
                  type="radio"
                  name="icon"
                  value={slug}
                  defaultChecked={selected === slug}
                  className="peer sr-only"
                />
                <span className="relative flex h-full min-h-18 flex-col items-center justify-center gap-1 rounded-xl border border-line bg-paper px-1 py-2 text-ink transition hover:border-brand peer-checked:border-brand peer-checked:bg-brand/10 peer-checked:text-brand peer-focus-visible:ring-2 peer-focus-visible:ring-brand">
                  <MenuGlyph slug={slug} className="size-5" />
                  {/* The glyph is aria-hidden, so this names the radio. */}
                  <span className="text-center text-[0.65rem] leading-tight">
                    {MENU_ICON_LABELS[slug]}
                  </span>
                  {used.has(slug) && (
                    <>
                      <span
                        aria-hidden="true"
                        className="absolute end-1.5 top-1.5 size-1.5 rounded-full bg-brand/50"
                      />
                      <span className="sr-only">({C.fields.iconUsed})</span>
                    </>
                  )}
                </span>
              </label>
            ))}
          </div>
        </fieldset>
      ))}

      {error && (
        <p role="alert" className="mt-1.5 text-sm font-medium text-brand">
          {error}
        </p>
      )}
    </fieldset>
  );
}

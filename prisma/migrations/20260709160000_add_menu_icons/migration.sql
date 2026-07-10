-- Give categories and items an icon.
--
-- Plain nullable TEXT, not a Postgres enum: an icon slug is a key into the
-- registry in `src/lib/menu-icons.ts`, and retiring a slug there must never
-- break `migrate deploy` or strand existing rows. `resolveIconSlug()` validates
-- on read and degrades to the fallback glyph.
--
-- NULL means different things on the two tables, on purpose:
--   MenuCategory.icon → NULL falls back to the generic glyph.
--   MenuItem.icon     → NULL inherits the category's icon (the common case, so
--                       staff only pick an icon when a dish should differ).

ALTER TABLE "MenuCategory" ADD COLUMN "icon" TEXT;
ALTER TABLE "MenuItem" ADD COLUMN "icon" TEXT;

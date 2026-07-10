-- Data migration: give the opening-day menu its icons.
--
-- Same reasoning as `20260709154210_seed_menu` — this is real content, so it
-- ships as a migration rather than through `prisma/seed.mjs` (destructive,
-- dev-only). `migrate deploy` applies it exactly once, so later edits made in
-- /admin/menu are safe.
--
-- Every statement is keyed by the literal ids that migration inserted. If staff
-- have already deleted one of those rows, the UPDATE matches nothing and the
-- migration still succeeds.

-- Categories carry the icon their items inherit, and the rail chips render it.
UPDATE "MenuCategory" SET "icon" = 'burger' WHERE "id" = 'cat_burgers';
UPDATE "MenuCategory" SET "icon" = 'hotdog' WHERE "id" = 'cat_hot_sandwich';
UPDATE "MenuCategory" SET "icon" = 'pasta'  WHERE "id" = 'cat_pasta';

-- Only the dishes that differ from their category get an override. The other
-- eight items keep icon = NULL, so the inherit path is exercised in production
-- rather than only in a test.
UPDATE "MenuItem" SET "icon" = 'cheese'  WHERE "id" = 'item_cheese_burger';
UPDATE "MenuItem" SET "icon" = 'veggie'  WHERE "id" = 'item_mushroom_burger';
UPDATE "MenuItem" SET "icon" = 'chicken' WHERE "id" IN ('item_chicken_burger', 'item_chicken_fillet');

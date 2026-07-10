// Draws a menu icon. Server-safe on purpose: `/menu` is a QR-scan page, so it
// must not ship an icon runtime to guests.
//
// `lucide` (not `lucide-react`) and `@lucide/lab` both export plain path data —
// `[tag, attrs][]` arrays with no React inside. `lucide-react`'s components all
// route through its `<Icon>`, which is "use client", so importing even one of
// them would drag the whole icon runtime across the client boundary. Taking the
// data instead means lucide glyphs, lab glyphs and the house-drawn `fries`
// below are all the same kind of thing, rendered by the one <svg> here.
//
// Those <svg> attributes are copied from `components/icons.tsx` so the menu
// glyphs sit on exactly the same 24×24, strokeWidth-1.8, round-cap grid as the
// destination badges. They draw in `currentColor`; the tile picks the color.

import { createElement } from "react";
import {
  Beef,
  ChefHat,
  Citrus,
  CupSoda,
  Dessert,
  Drumstick,
  EggFried,
  Flame,
  GlassWater,
  Hamburger,
  IceCreamCone,
  LeafyGreen,
  Milk,
  Pizza,
  Salad,
  Sandwich,
  TicketPercent,
  Utensils,
  UtensilsCrossed,
} from "lucide";
import {
  bottleDispenser,
  bowlChopsticks,
  cheese,
  hotDog,
  jug,
  sausage,
} from "@lucide/lab";
import {
  FALLBACK_ICON_SLUG,
  type MenuIconSlug,
} from "@/lib/menu-icons";

// Structural, rather than lucide's internal `IconNode` — it is not exported.
type IconNode = readonly [tag: string, attrs: Record<string, unknown>][];

// Neither lucide nor Lucide Lab draws french fries, so this one is ours: the
// carton, its band, and four fries. Same grid and stroke as everything above.
// The carton is drawn nearly full-width (4.6 → 19.4) so the glyph carries the
// same optical weight as `burger` and `hotdog` when they sit side by side.
const fries: IconNode = [
  ["path", { d: "M4.6 10h14.8l-1.5 10.2a1 1 0 0 1-1 .8H7.1a1 1 0 0 1-1-.8z" }],
  ["path", { d: "M5.5 14.3h13" }],
  ["path", { d: "M7.4 10 6.5 6.6" }],
  ["path", { d: "M10.3 10V4.3" }],
  ["path", { d: "M13.6 10V5.9" }],
  ["path", { d: "M16.6 10 17.5 6.6" }],
];

// Exhaustive by type: adding a slug to MENU_ICON_SLUGS fails to compile until a
// glyph is registered here.
const GLYPHS: Record<MenuIconSlug, IconNode> = {
  // Mains
  burger: Hamburger,
  hotdog: hotDog,
  sandwich: Sandwich,
  pizza: Pizza,
  pasta: bowlChopsticks,
  chicken: Drumstick,
  steak: Beef,
  // Sides & toppings
  fries,
  cheese,
  sausage,
  egg: EggFried,
  salad: Salad,
  veggie: LeafyGreen,
  spicy: Flame,
  sauce: bottleDispenser,
  // Drinks. `milkshake` keeps lucide's Milk it has always had — reassigning it
  // would silently redraw every row already using it.
  soda: CupSoda,
  water: GlassWater,
  juice: Citrus,
  milkshake: Milk,
  yogurtdrink: jug,
  // Sweets
  icecream: IceCreamCone,
  dessert: Dessert,
  // Generic
  utensils: Utensils,
  chefhat: ChefHat,
  discount: TicketPercent,
  special: UtensilsCrossed,
};

const base = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
} as const;

export function MenuGlyph({
  slug,
  className = "size-6",
}: {
  slug: MenuIconSlug;
  className?: string;
}) {
  // The `?? fallback` is not dead code: `slug` is typed, but it originates in a
  // TEXT column that may still hold a slug we have since retired.
  const glyph = GLYPHS[slug] ?? GLYPHS[FALLBACK_ICON_SLUG];

  return (
    <svg {...base} className={className}>
      {glyph.map(([tag, attrs], index) =>
        // `createElement` strips `key` from the props, so Lucide Lab's own
        // `key` field never reaches the DOM.
        createElement(tag, { ...attrs, key: index }),
      )}
    </svg>
  );
}

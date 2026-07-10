// Dish photos for /menu, keyed by the row's exact item name. Deliberately a
// code-side registry and NOT a database column: the photos were needed on
// opening day, so they ship as static files in /public/menu and attach to
// whatever row currently carries the name. Renaming a row simply drops it
// back to its icon tile — a miss is a fallback, never an error. When images
// become a real `MenuItem` field this file is the list to migrate.
//
// The files are 320×320 AVIFs: the dishes cut from the owner's sprite sheet,
// the drinks from standalone product shots. All sit on a flat white
// background (no alpha), which is why the tile that renders one is
// `bg-white`, not the cream icon tile.

const MENU_IMAGES: Record<string, string> = {
  "کلاسیک": "/menu/classic.avif",
  "اوکلاهاما": "/menu/oklahoma.avif",
  "چیز برگر": "/menu/cheese.avif",
  "رویال برگر": "/menu/royal.avif",
  "ماشروم برگر": "/menu/mushroom.avif",
  "چوریتسو برگر": "/menu/chorizo.avif",
  "هات داگ ویژه": "/menu/hotdog-special.avif",
  "هات داگ": "/menu/hotdog.avif",
  "نوشابه کوکاکولا": "/menu/coca-cola.avif",
  "نوشابه اسپرایت": "/menu/sprite.avif",
  "آب معدنی": "/menu/water.avif",
};

// Trim + collapse whitespace so a name retyped in the admin form with a stray
// double space still finds its photo. Anything further (missing row, retired
// photo) falls through to `null` and the icon tile takes over.
export function menuImageSrc(name: string): string | null {
  return MENU_IMAGES[name.trim().replace(/\s+/g, " ")] ?? null;
}

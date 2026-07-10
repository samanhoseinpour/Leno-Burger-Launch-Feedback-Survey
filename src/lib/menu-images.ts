// Dish photos for /menu, keyed by the row's exact item name. Deliberately a
// code-side registry and NOT a database column: the photos were needed on
// opening day, so they ship as static files in /public/menu and attach to
// whatever row currently carries the name. Renaming a row simply drops it
// back to its icon tile — a miss is a fallback, never an error. When images
// become a real `MenuItem` field this file is the list to migrate.
//
// The files are 320×320 JPEGs cut from the owner's sprite sheet. They sit on
// the sprite's own flat white background (no alpha), which is why the tile
// that renders one is `bg-white`, not the cream icon tile.

const MENU_IMAGES: Record<string, string> = {
  "کلاسیک": "/menu/classic.jpg",
  "اوکلاهاما": "/menu/oklahoma.jpg",
  "چیز برگر": "/menu/cheese.jpg",
  "رویال برگر": "/menu/royal.jpg",
  "ماشروم برگر": "/menu/mushroom.jpg",
  "چوریتسو برگر": "/menu/chorizo.jpg",
  "هات داگ ویژه": "/menu/hotdog-special.jpg",
  "هات داگ": "/menu/hotdog.jpg",
};

// Trim + collapse whitespace so a name retyped in the admin form with a stray
// double space still finds its photo. Anything further (missing row, retired
// photo) falls through to `null` and the icon tile takes over.
export function menuImageSrc(name: string): string | null {
  return MENU_IMAGES[name.trim().replace(/\s+/g, " ")] ?? null;
}

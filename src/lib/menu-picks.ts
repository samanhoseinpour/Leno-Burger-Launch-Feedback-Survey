// «پیشنهاد سرآشپز» tags for /menu, keyed by the row's exact item name — the
// same deliberate code-side registry as `menu-images.ts`, NOT a database
// column: the picks are a handful of names the owner chose, so they attach to
// whatever row currently carries the name. Renaming a row simply drops its
// pill — a miss is "no tag", never an error. If the picks ever become
// staff-editable this turns into a `MenuItem` boolean and this file is the
// list to migrate.

const CHEF_PICKS = new Set(["چیز برگر", "رویال برگر"]);

// Same whitespace forgiveness as `menuImageSrc`: a name retyped in the admin
// form with a stray double space still keeps its tag.
export function isChefPick(name: string): boolean {
  return CHEF_PICKS.has(name.trim().replace(/\s+/g, " "));
}

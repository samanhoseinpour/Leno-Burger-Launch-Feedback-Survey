// Destination glyphs shared by the home hub and the admin hub. Purposeful per
// destination (dining / feedback) and deliberately NOT the Leno mark, which the
// nav, hero and footer already carry — the badge is not a generic bullet.
//
// All draw in currentColor at strokeWidth 1.8, so whichever badge renders them
// picks the color.

type IconProps = { className?: string };

const base = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
} as const;

export function MenuIcon({ className = "size-6" }: IconProps) {
  // A cloche (domed food cover) — reads clearly as "dining / menu" at 24px,
  // where a fine fork-and-knife glyph turns to mush.
  return (
    <svg {...base} className={className}>
      <path d="M3.5 18h17" />
      <path d="M5 18a7 7 0 0 1 14 0" />
      <path d="M12 7.5v3.5" />
      <circle cx="12" cy="6.3" r="1.15" />
    </svg>
  );
}

export function FeedbackIcon({ className = "size-6" }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M21 15a2 2 0 0 1-2 2H8l-4 4V5a2 2 0 0 1 2-2h13a2 2 0 0 1 2 2z" />
      <path d="M8 9h8" />
      <path d="M8 13h5" />
    </svg>
  );
}

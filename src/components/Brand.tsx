// The Leno mark: a circular badge holding the three stacked rounded bars
// (inline SVG from SPEC.md §"Logo mark"), next to the "Leno" wordmark.
//
// The badge contrasts the surface it sits on so it stays legible:
//   surface="red"   → cream badge + red mark  (on the red header / footer band)
//   surface="paper" → red badge + cream mark  (on the warm paper surfaces)
// Both use the spec's red/cream pairings; the assignment keeps the mark visible.
//
// markOnly renders just the badge (used in the footer band, which has no wordmark).

type BrandProps = {
  surface?: "red" | "paper";
  markOnly?: boolean;
  className?: string;
};

export function Brand({
  surface = "red",
  markOnly = false,
  className = "",
}: BrandProps) {
  const onRed = surface === "red";

  return (
    // The mark + Latin "Leno" wordmark is a fixed LTR lockup (mark left,
    // wordmark right) — pin the direction so it renders identically on RTL
    // surfaces (e.g. /admin) instead of flipping to inherit the page's dir.
    <div dir="ltr" className={`flex items-center gap-3 ${className}`}>
      <span
        aria-hidden="true"
        className={`grid size-11 shrink-0 place-items-center rounded-full ${
          onRed ? "bg-cream text-brand" : "bg-brand text-cream"
        }`}
      >
        <svg viewBox="10 32 100 70" className="w-7">
          <g fill="currentColor">
            <rect x="20" y="40" width="80" height="14" rx="7" />
            <rect x="14" y="60" width="92" height="14" rx="3" />
            <rect x="20" y="80" width="80" height="14" rx="7" />
          </g>
        </svg>
      </span>

      {!markOnly && (
        <span
          dir="ltr"
          className={`font-display text-[1.7rem] leading-none tracking-tight ${
            onRed ? "text-cream" : "text-ink"
          }`}
        >
          Leno
        </span>
      )}
    </div>
  );
}

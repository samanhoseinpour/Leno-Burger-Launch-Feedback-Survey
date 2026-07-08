import Link from "next/link";

// A tappable destination tile used on the home landing. Flat and warm, matching
// the admin card idiom (rounded-2xl border + cream fill). The chevron points
// toward the RTL reading direction (left) and nudges on hover. `icon` is a
// PURPOSEFUL glyph per destination (utensils, feedback) — deliberately NOT the
// Leno mark, which the nav/hero/footer already carry, so the badge isn't reused
// as a generic bullet.
export function NavCard({
  href,
  title,
  description,
  badge,
  icon,
}: {
  href: string;
  title: string;
  description: string;
  badge?: string;
  icon: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-4 rounded-2xl border border-line bg-cream/30 p-5 transition hover:border-brand"
    >
      <span
        aria-hidden="true"
        className="grid size-12 shrink-0 place-items-center rounded-full bg-brand text-cream"
      >
        {icon}
      </span>

      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          <span className="text-lg font-bold text-ink">{title}</span>
          {badge && (
            <span className="inline-flex items-center rounded-full bg-brand/10 px-2.5 py-0.5 text-[0.7rem] font-medium text-brand">
              {badge}
            </span>
          )}
        </span>
        <span className="mt-1 block text-sm leading-6 text-muted">
          {description}
        </span>
      </span>

      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className="size-5 shrink-0 text-muted transition group-hover:-translate-x-0.5 group-hover:text-brand"
        fill="none"
        stroke="currentColor"
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M15 18l-6-6 6-6" />
      </svg>
    </Link>
  );
}

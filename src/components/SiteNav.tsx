"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Brand } from "@/components/Brand";
import { NAV_ITEMS, NAV_COPY } from "@/lib/site";

// Shared sticky masthead for the public site (everything under the (site) route
// group; NOT /admin). Deliberately a LIGHT bar — frosted paper glass, red Leno
// mark, ink links — so the red type-forward heroes below it read as the hero and
// the small link text keeps comfortable AA contrast. Flat, no gradient, per
// brand. Translucent + backdrop-blur so content scrolls through it as glass;
// engines without backdrop-filter fall back to a near-opaque paper so the links
// stay legible over the red heroes underneath.
export function SiteNav() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper/80 backdrop-blur-lg supports-[backdrop-filter]:bg-paper/65">
      <nav
        aria-label={NAV_COPY.primary}
        className="mx-auto flex h-[var(--nav-h)] w-full max-w-6xl items-center justify-between gap-4 px-5 sm:px-6 lg:px-8"
      >
        {/* RTL convention: the brand LEADS at the inline start (right in RTL),
            the links TRAIL at the inline end (left). DOM order (brand first,
            links last) drives it, so it stays semantic RTL, not a visual hack. */}
        <Link
          href="/"
          aria-label={NAV_COPY.brandHome}
          className="inline-flex items-center rounded-lg"
        >
          {/* Brand keeps its own dir="ltr" lockup, so it always renders
              mark-then-wordmark regardless of the page direction. */}
          <Brand surface="paper" />
        </Link>

        <ul className="flex items-center gap-1 sm:gap-2">
          {NAV_ITEMS.map((item) => {
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`relative inline-flex min-h-11 items-center rounded-lg px-3 text-sm transition sm:text-[0.95rem] ${
                    active
                      ? "font-bold text-brand after:absolute after:inset-x-3 after:bottom-1 after:h-0.5 after:rounded-full after:bg-brand"
                      : "font-medium text-ink/80 hover:bg-ink/[0.03] hover:text-brand"
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </header>
  );
}

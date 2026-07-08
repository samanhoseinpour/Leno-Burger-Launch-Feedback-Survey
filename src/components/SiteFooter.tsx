import Link from 'next/link';
import { Brand } from '@/components/Brand';
import { NAV_ITEMS, NAV_COPY, FOOTER_COPY } from '@/lib/site';

// Site-wide footer: one slim paper band (kept light so it never merges with the
// red hero bands into a doubled slab). Brand mark + the repeated nav on one row,
// a credit line below. Deliberately NOT a multi-column mega-footer —
// a 4-page opening-day survey site doesn't warrant hours/address columns, and
// those were placeholder data anyway. Server component — no interactivity. The
// Jalali year comes from Intl (fa-IR → Persian digits).
export function SiteFooter() {
  const year = new Intl.DateTimeFormat('fa-IR', { year: 'numeric' }).format(
    new Date(),
  );

  return (
    <footer className="border-t border-line bg-paper">
      <div className="mx-auto w-full max-w-6xl px-5 py-8 sm:px-6 sm:py-10 lg:px-8">
        {/* Same RTL convention as the nav: the brand LEADS at the inline start
            (right in RTL), the links TRAIL at the inline end (left). DOM order
            (brand first, nav last) drives it. On mobile it stacks brand → links
            → © line. */}
        <div className="flex flex-col items-center gap-6 text-center sm:flex-row sm:justify-between sm:text-start">
          <Link
            href="/"
            aria-label={NAV_COPY.brandHome}
            className="inline-flex items-center rounded-lg"
          >
            <Brand surface="paper" />
          </Link>

          <nav aria-label={FOOTER_COPY.navHeading}>
            <ul className="flex items-center gap-4 sm:gap-6">
              {NAV_ITEMS.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="inline-flex min-h-11 items-center text-sm text-muted transition hover:text-brand"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <p className="mt-8 border-t border-line pt-6 text-center text-xs leading-6 text-muted sm:text-start">
          © {year} لنو — {FOOTER_COPY.rights}
        </p>
      </div>
    </footer>
  );
}

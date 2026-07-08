import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";
import { NAV_COPY } from "@/lib/site";

// The public-site frame: skip link + sticky nav + page + footer, in a flex
// column that owns full height (so the footer sits at the bottom and each
// page's <main> can be flex-1 instead of min-h-dvh).
//
// Used by the (site) route-group layout AND self-mounted by app/not-found.tsx —
// the global 404 is rendered by the ROOT layout, so it can't inherit the group
// layout's chrome and has to compose it by hand.
export function SiteChrome({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:start-3 focus:top-3 focus:z-[60] focus:inline-flex focus:min-h-11 focus:items-center focus:rounded-lg focus:bg-brand focus:px-4 focus:text-sm focus:font-bold focus:text-cream"
      >
        {NAV_COPY.skip}
      </a>
      <SiteNav />
      {children}
      <SiteFooter />
    </div>
  );
}

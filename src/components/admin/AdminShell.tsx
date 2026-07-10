import Link from "next/link";
import { adminLogout } from "@/app/admin/actions";
import { Brand } from "@/components/Brand";
import { ADMIN_COPY } from "@/lib/menu-copy";
import { SITE_COPY } from "@/lib/site";

// `publicHref` is the page a guest sees for this section. It lives next to the
// tab rather than on the hub cards: the link is only useful once you are IN a
// section, and putting it here means it is never more than one glance away.
const TABS = [
  {
    key: "survey",
    href: "/admin/survey",
    label: ADMIN_COPY.tabs.survey,
    publicHref: "/survey",
    viewLabel: ADMIN_COPY.view.survey,
  },
  {
    key: "menu",
    href: "/admin/menu",
    label: ADMIN_COPY.tabs.menu,
    publicHref: "/menu",
    viewLabel: ADMIN_COPY.view.menu,
  },
] as const;

type AdminSection = (typeof TABS)[number]["key"];

// Chrome shared by every authenticated admin page: the sticky masthead, the
// section tabs, and the page column. `active` comes from the server page rather
// than `usePathname`, which keeps this a server component.
//
// The hub passes `active={null}` — it *is* the section picker, so tabs would
// just repeat its two cards.
export function AdminShell({
  active,
  subtitle,
  children,
}: {
  active: AdminSection | null;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <main className="mx-auto max-w-2xl px-5 pb-8 pt-4">
      <header className="sticky top-0 z-10 -mx-5 border-b border-line bg-paper px-5 py-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <Brand surface="paper" />
            <p className="mt-2 text-sm text-muted">{subtitle}</p>
          </div>
          <div className="flex flex-wrap justify-end gap-2">
            <Link
              href="/"
              className="inline-flex min-h-11 items-center rounded-full border border-line px-4 text-sm text-ink transition hover:border-brand hover:text-brand"
            >
              {SITE_COPY.backHome}
            </Link>
            <form action={adminLogout}>
              <button
                type="submit"
                className="inline-flex min-h-11 items-center rounded-full border border-line px-4 text-sm text-muted transition hover:border-brand hover:text-brand cursor-pointer"
              >
                {ADMIN_COPY.logout}
              </button>
            </form>
          </div>
        </div>

        {active !== null && (
          // Same red underline treatment as the public <SiteNav>, so the two
          // navigations read as one system.
          <nav
            aria-label={ADMIN_COPY.tabs.label}
            className="-mb-4 mt-3 flex items-center justify-between gap-3"
          >
            <ul className="flex items-center gap-1 sm:gap-2">
              {TABS.map((tab) => {
                const current = tab.key === active;
                return (
                  <li key={tab.key}>
                    <Link
                      href={tab.href}
                      aria-current={current ? "page" : undefined}
                      className={`relative inline-flex min-h-11 items-center rounded-lg px-3 text-sm transition ${
                        current
                          ? "font-bold text-brand after:absolute after:inset-x-3 after:bottom-1 after:h-0.5 after:rounded-full after:bg-brand"
                          : "font-medium text-ink/80 hover:bg-ink/[0.03] hover:text-brand"
                      }`}
                    >
                      {tab.label}
                    </Link>
                  </li>
                );
              })}
            </ul>

            <ViewPublicPage section={active} />
          </nav>
        )}
      </header>

      {children}
    </main>
  );
}

/** "See what a guest sees" for the section currently open. */
function ViewPublicPage({ section }: { section: AdminSection }) {
  const tab = TABS.find((entry) => entry.key === section);
  if (!tab) return null;

  return (
    <Link
      href={tab.publicHref}
      target="_blank"
      rel="noopener"
      className="inline-flex min-h-11 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg px-2 text-xs font-semibold text-muted transition hover:text-brand sm:text-sm"
    >
      {tab.viewLabel}
      <span className="sr-only">({ADMIN_COPY.view.newTab})</span>
      {/* Points up-LEFT: the RTL reading direction. */}
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className="size-3.5 shrink-0"
        fill="none"
        stroke="currentColor"
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M15 5H5v10M5 5l12 12" />
      </svg>
    </Link>
  );
}

import { SiteChrome } from "@/components/SiteChrome";

// Layout for the PUBLIC site — everything under (site): / , /survey , /menu ,
// /thanks. Wraps each page in the shared chrome (skip link + sticky nav +
// footer). /admin deliberately lives OUTSIDE this route group, so it never
// inherits the chrome and stays a self-contained staff surface.
export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SiteChrome>{children}</SiteChrome>;
}

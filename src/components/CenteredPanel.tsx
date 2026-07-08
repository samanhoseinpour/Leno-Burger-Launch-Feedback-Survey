// Shared shell for the short "single message" pages — /menu, /thanks, /404.
// Renders the page's <main> (so it owns the #main landmark + data-canvas
// backdrop) and centers a paper panel in the space BETWEEN the nav and footer
// (flex-1, not min-h-dvh). Widens modestly on larger screens so the panel reads
// as intentional rather than a phone card marooned in cream2.
export function CenteredPanel({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <main
      id="main"
      tabIndex={-1}
      data-canvas="cream2"
      className="flex flex-1 items-center justify-center sm:bg-cream2 sm:px-6 sm:py-10 lg:py-14"
    >
      <div
        className={`mx-auto w-full max-w-[600px] bg-paper sm:overflow-hidden sm:rounded-[2rem] sm:border sm:border-line sm:shadow-[0_24px_60px_-32px_rgb(90_24_12/0.4)] md:max-w-2xl ${className}`}
      >
        {children}
      </div>
    </main>
  );
}

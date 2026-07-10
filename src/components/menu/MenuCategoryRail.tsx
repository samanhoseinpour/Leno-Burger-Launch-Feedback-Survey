"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

export type RailCategory = {
  id: string;
  name: string;
  /** Rendered on the server so `lucide` never crosses the client boundary. */
  icon: ReactNode;
};

// The reading line, as a fraction of the band between the rail's bottom edge and
// the bottom of the viewport. A section becomes "current" once its heading
// crosses it — roughly, once the guest is looking at the middle of that section.
//
// The line used to sit ON the rail's bottom edge (plus 24px of slop), which read
// as broken in two ways:
//   • A section the page is too SHORT to scroll to the top could never become
//     current at all. With three categories on a phone the document ends while
//     the middle one is still below the rail, so its chip never lit — and the
//     `bottomed` rule below then handed the highlight straight past it to the
//     last category.
//   • Even on a tall viewport, a guest reading a section that filled the screen
//     kept seeing the PREVIOUS chip lit until that heading reached the very top.
//
// Two bounds hold it in place. It must stay well ABOVE the `--rail-gap` (1rem)
// that `scroll-mt` adds to every section, because that is exactly where a chip
// click parks its own section — a line any tighter and every click would light
// the previous chip. And it must stay BELOW 0.5, so that tapping a short section
// does not hand the highlight to the next one the instant the guest scrolls.
const READING_LINE_RATIO = 0.4;

// The sticky category rail on /menu. Chips are real anchors, so the rail
// navigates with JavaScript disabled — the only thing JS adds is the highlight
// that follows the scroll position.
//
// It pins at `top: var(--nav-h)`, directly beneath <SiteNav> (z-40), which is
// why it sits at z-30. This only works because the menu card is `overflow-clip`
// rather than `overflow-hidden`: `hidden` would make the card a scroll
// container and silently disable `position: sticky` from the sm breakpoint up.
export function MenuCategoryRail({
  label,
  categories,
}: {
  label: string;
  categories: RailCategory[];
}) {
  // The server cannot know the scroll position, so it renders the first chip
  // active — which is what a guest landing at the top of the page sees anyway,
  // and avoids a frame with no chip highlighted. The effect below corrects it on
  // mount. Without JS the highlight simply never moves.
  const [activeId, setActiveId] = useState(categories[0]?.id ?? "");
  const railRef = useRef<HTMLElement>(null);
  const stripRef = useRef<HTMLUListElement>(null);
  const chips = useRef(new Map<string, HTMLAnchorElement>());

  // Set when a guest taps a chip. Until they scroll under their own steam, the
  // spy stops second-guessing them: a smooth scroll fires dozens of scroll
  // events on the way down, and letting the spy answer each one made the
  // highlight stutter through every category it passed. It also settles the
  // bottom-of-page case, where the last sections can never reach the line and
  // the `bottomed` rule below would otherwise steal the tapped chip.
  const pinned = useRef(false);

  // Which section is the guest reading? Rather than parsing --nav-h/--rail-h,
  // measure the rail: once it is stuck, its own bottom edge is where the visible
  // page begins, so the reading line below it can never drift out of sync with
  // the two bars stacked above.
  useEffect(() => {
    const sections = categories
      .map((category) => ({
        id: category.id,
        el: document.getElementById(`cat-${category.id}`),
      }))
      .filter((section): section is { id: string; el: HTMLElement } =>
        Boolean(section.el),
      );

    if (sections.length === 0) return;

    let frame = 0;

    const measure = () => {
      frame = 0;
      if (pinned.current) return;

      const railBottom = railRef.current?.getBoundingClientRect().bottom ?? 0;
      const line =
        railBottom + (window.innerHeight - railBottom) * READING_LINE_RATIO;

      // The final section is often too short to ever cross the line, so once the
      // page bottoms out it wins outright.
      const bottomed =
        window.scrollY + window.innerHeight >=
        document.documentElement.scrollHeight - 2;

      if (bottomed) {
        setActiveId(sections[sections.length - 1].id);
        return;
      }

      let current = sections[0].id;
      for (const section of sections) {
        if (section.el.getBoundingClientRect().top <= line) current = section.id;
      }
      setActiveId(current);
    };

    const onScroll = () => {
      frame ||= requestAnimationFrame(measure);
    };

    // Only a deliberate gesture releases the pin — `scroll` alone cannot, since
    // the tap's own smooth scroll fires it.
    const release = () => {
      if (!pinned.current) return;
      pinned.current = false;
      onScroll();
    };

    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    window.addEventListener("wheel", release, { passive: true });
    window.addEventListener("touchmove", release, { passive: true });
    window.addEventListener("keydown", release);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      window.removeEventListener("wheel", release);
      window.removeEventListener("touchmove", release);
      window.removeEventListener("keydown", release);
      cancelAnimationFrame(frame);
    };
  }, [categories]);

  // Keep the active chip in view when the rail overflows — but only when it has
  // actually slipped off an edge. Re-centring a chip that is already on screen
  // is what made the strip twitch on every scroll tick.
  useEffect(() => {
    const chip = chips.current.get(activeId);
    const strip = stripRef.current;
    if (!chip || !strip || strip.scrollWidth <= strip.clientWidth) return;

    const chipBox = chip.getBoundingClientRect();
    const stripBox = strip.getBoundingClientRect();
    if (chipBox.left >= stripBox.left && chipBox.right <= stripBox.right) return;

    // `block: "nearest"` is what stops this from hijacking the page's vertical
    // scroll; omitting `behavior` defers to the strip's CSS `scroll-smooth`,
    // which the global reduced-motion rule already forces back to `auto`.
    chip.scrollIntoView({ inline: "center", block: "nearest" });
  }, [activeId]);

  return (
    <nav
      ref={railRef}
      aria-label={label}
      className="sticky top-[var(--nav-h)] z-30 border-b border-line bg-paper/85 backdrop-blur-lg supports-[backdrop-filter]:bg-paper/70"
    >
      <ul
        ref={stripRef}
        className="no-scrollbar flex h-[var(--rail-h)] items-center gap-2 overflow-x-auto scroll-smooth px-5 sm:px-9 lg:px-14"
      >
        {categories.map((category) => {
          const active = category.id === activeId;

          return (
            <li key={category.id}>
              {/* The anchor keeps the full 44px tap target; the pill inside is
                  what you see. That lets the chip look light without dropping
                  below the tap-target floor. */}
              <a
                href={`#cat-${category.id}`}
                aria-current={active ? "true" : undefined}
                onClick={() => {
                  pinned.current = true;
                  setActiveId(category.id);
                }}
                ref={(node) => {
                  if (node) chips.current.set(category.id, node);
                  else chips.current.delete(category.id);
                }}
                className="group flex h-11 shrink-0 items-center rounded-full outline-none"
              >
                <span
                  className={`flex h-9 items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 text-[0.8125rem] font-semibold transition group-focus-visible:ring-2 group-focus-visible:ring-brand ${
                    active
                      ? "bg-brand text-cream"
                      : "bg-cream2 text-ink group-hover:text-brand"
                  }`}
                >
                  {category.icon}
                  {category.name}
                </span>
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

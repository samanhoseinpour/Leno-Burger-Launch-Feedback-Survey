"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";

// iOS-only brand scrollbar. Every iOS browser runs WebKit (Chrome included),
// and iOS never applies scrollbar CSS to its native overlay indicator —
// ::-webkit-scrollbar painting is skipped for touch scrolling, and
// scrollbar-color (Safari 26.2+) doesn't tint it either. So where the native
// pill can actually be hidden (scrollbar-width: none, iOS 18.2+), this hides
// it via html[data-ios-scrollbar] and draws the red thumb itself. Everywhere
// else it renders nothing; older iOS / no-JS keeps the system indicator.
// Purely decorative: aria-hidden, no pointer events, visible only while
// scrolling — never a focus or touch target.
let supportCache: boolean | undefined;
const supportsIosHidableScrollbar = () =>
  (supportCache ??=
    CSS.supports("-webkit-touch-callout", "none") && // true only on iOS-family WebKit
    CSS.supports("scrollbar-width", "none")); // can hide the native pill (iOS 18.2+)

const emptySubscribe = () => () => {};

export function IosScrollIndicator() {
  // Client-only constant: false during SSR/hydration, the real capability
  // check after — without a setState-in-effect re-render.
  const active = useSyncExternalStore(
    emptySubscribe,
    supportsIosHidableScrollbar,
    () => false,
  );
  const trackRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!active) return;
    const track = trackRef.current;
    const thumb = thumbRef.current;
    if (!track || !thumb) return;

    const html = document.documentElement;
    html.setAttribute("data-ios-scrollbar", "");

    let frame = 0;
    let hideTimer: ReturnType<typeof setTimeout> | undefined;

    // Re-measure every frame instead of caching: the iOS toolbar collapse
    // changes viewport height and scrollHeight mid-scroll.
    const paint = () => {
      frame = 0;
      const scroller = document.scrollingElement ?? html;
      const maxScroll = scroller.scrollHeight - scroller.clientHeight;
      if (maxScroll <= 0) {
        thumb.style.opacity = "0";
        return;
      }
      const trackHeight = track.clientHeight;
      const thumbHeight = Math.max(
        40, // same floor as the desktop ::-webkit-scrollbar-thumb
        (scroller.clientHeight / scroller.scrollHeight) * trackHeight,
      );
      const progress = Math.min(1, Math.max(0, scroller.scrollTop / maxScroll));
      thumb.style.height = `${thumbHeight}px`;
      thumb.style.transform = `translateY(${progress * (trackHeight - thumbHeight)}px)`;
      thumb.style.opacity = "1";
      clearTimeout(hideTimer);
      hideTimer = setTimeout(() => {
        thumb.style.opacity = "0";
      }, 850); // linger like the native indicator, then fade
    };

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(paint);
    };

    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (frame) cancelAnimationFrame(frame);
      clearTimeout(hideTimer);
      html.removeAttribute("data-ios-scrollbar");
    };
  }, [active]);

  if (!active) return null;

  return (
    <div ref={trackRef} className="ios-scrollbar" aria-hidden="true">
      <div ref={thumbRef} className="ios-scrollbar-thumb" />
    </div>
  );
}

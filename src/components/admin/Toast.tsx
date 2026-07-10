"use client";

import { useEffect, useState } from "react";
import { FLASH_DISMISS } from "@/lib/menu-copy";

const DISMISS_AFTER_MS = 4000;

// The only client component in the menu manager. Everything around it — the
// rows, their move/toggle/delete buttons — is a server component posting to a
// Server Action, so the toast cannot be handed down as state. It arrives as a
// `?flash=` code the action redirected to, and is keyed on that URL's nonce so a
// repeated action (delete, delete) remounts it and restarts the timer.
export function Toast({
  message,
  tone,
}: {
  message: string;
  tone: "success" | "error";
}) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // Strip the flash out of the URL so a refresh doesn't replay the toast.
    //
    // `history.replaceState`, NOT `router.replace`: the latter is a server
    // round-trip that would re-run the manager's Prisma query and flicker the
    // page. Next supports the native call for exactly this. The page reads
    // `searchParams` as a PROP rather than via `useSearchParams`, so nothing
    // re-renders and the toast lives out its timer.
    window.history.replaceState(null, "", "/admin/menu");

    const timer = setTimeout(() => setVisible(false), DISMISS_AFTER_MS);
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  const success = tone === "success";

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-6 z-20 flex justify-center px-5">
      <div
        // An error interrupts; a confirmation waits its turn.
        role={success ? "status" : "alert"}
        aria-live={success ? "polite" : "assertive"}
        className={`pointer-events-auto flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium shadow-[0_12px_32px_-12px_rgb(90_24_12/0.45)] animate-[toast-in_180ms_ease-out] ${
          success ? "bg-ink text-cream" : "bg-brand text-cream"
        }`}
      >
        <span>{message}</span>
        <button
          type="button"
          onClick={() => setVisible(false)}
          aria-label={FLASH_DISMISS}
          className="-me-1 grid size-6 shrink-0 place-items-center rounded-full text-cream/70 transition hover:bg-cream/15 hover:text-cream cursor-pointer"
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className="size-4"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.5}
            strokeLinecap="round"
          >
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}

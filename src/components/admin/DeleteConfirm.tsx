"use client";

import { useEffect, useRef, useState } from "react";
import { ADMIN_COPY } from "@/lib/menu-copy";

// A two-step delete. This was a native <details>, which owned the open/closed
// state for free — but <details> only ever toggles: it cannot dismiss on an
// outside click, and two of them happily sit open at once. Both are table
// stakes for something that looks like a popover, so the state moved here.
//
// One `pointerdown` listener buys both behaviours. Closing on any pointerdown
// outside this row's wrapper *is* the "only one open at a time" rule: opening
// another row's panel means pressing its حذف button, which is outside this
// wrapper, so this panel closes on the way. No cross-row coordination needed.
//
// The row unmounts when the action succeeds, so nothing has to close it then.
export function DeleteConfirm({
  id,
  action,
  prompt,
}: {
  id: string;
  action: (formData: FormData) => Promise<void>;
  prompt: string;
}) {
  const [open, setOpen] = useState(false);
  const wrapper = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    // The pointerdown that opened this panel has already been dispatched by the
    // time React runs this effect, so it can never close the panel it opened.
    const onPointerDown = (event: PointerEvent) => {
      if (!wrapper.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={wrapper} className="relative">
      {/* A pointerdown inside the wrapper never closes the panel, so pressing
          حذف while it is open falls through to this toggle and shuts it. */}
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((wasOpen) => !wasOpen)}
        className="inline-flex min-h-11 cursor-pointer items-center rounded-lg px-2 text-xs font-semibold text-muted transition hover:text-brand aria-expanded:text-brand"
      >
        {ADMIN_COPY.delete}
      </button>

      {/* Anchored to the row so the confirmation never pushes the list around. */}
      {open && (
        <div className="absolute inset-x-auto end-0 top-full z-20 mt-1 w-56 rounded-xl border border-line bg-paper p-3 shadow-[0_16px_40px_-24px_rgb(90_24_12/0.5)]">
          <p className="text-xs leading-6 text-ink">{prompt}</p>
          <form action={action} className="mt-2">
            <input type="hidden" name="id" value={id} />
            <button
              type="submit"
              className="inline-flex min-h-11 w-full cursor-pointer items-center justify-center rounded-lg bg-brand px-3 text-xs font-bold text-cream transition active:scale-[0.99]"
            >
              {ADMIN_COPY.confirmYes}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

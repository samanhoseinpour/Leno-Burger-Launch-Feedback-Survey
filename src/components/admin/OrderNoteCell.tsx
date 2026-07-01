'use client';

import { useEffect, useRef, useState } from 'react';
import { UI_COPY } from '@/lib/survey';

// The «سفارش / نظر» write-in can be very long. Collapsed, it clamps to a few
// lines so one comment can't turn a table row into an 18-line-tall block; the
// «بیشتر» toggle reveals the full text in place. The toggle only appears when
// the text is actually truncated, so short notes render plainly.
export function OrderNoteCell({ text }: { text: string | null }) {
  const [expanded, setExpanded] = useState(false);
  const [overflowing, setOverflowing] = useState(false);
  const ref = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || expanded) return;

    const check = () => {
      // While clamped, a truncated paragraph's full height (scrollHeight)
      // exceeds its visible height (clientHeight). +1 absorbs sub-pixel rounding.
      setOverflowing(el.scrollHeight > el.clientHeight + 1);
    };

    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, [text, expanded]);

  if (!text) {
    return <span className="text-muted">—</span>;
  }

  return (
    <div className="max-w-[18rem]">
      <p
        ref={ref}
        className={`leading-7 text-ink ${expanded ? '' : 'line-clamp-4'}`}
      >
        {text}
      </p>
      {(overflowing || expanded) && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="mt-1 inline-flex min-h-11 items-center px-1 text-xs font-semibold text-brand transition hover:underline cursor-pointer"
        >
          {expanded ? UI_COPY.showLess : UI_COPY.showMore}
        </button>
      )}
    </div>
  );
}

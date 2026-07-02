import { useState } from "react";
import { toPersianDigits } from "@/lib/format";
import { UI_COPY } from "@/lib/survey";
import { LenoMark } from "./Brand";

type RatingQuestionProps = {
  id: string;
  number: number;
  text: string;
  scale: readonly string[];
  error?: string;
  onSelect?: () => void;
};

// A 5-point rating as a real radio group (fieldset/legend). Each option's value
// is its array index + 1, so the stored score never depends on visual position.
// In RTL the row flips visually — index 0 renders rightmost — but value is fixed.
export function RatingQuestion({
  id,
  number,
  text,
  scale,
  error,
  onSelect,
}: RatingQuestionProps) {
  // Selection is controlled solely so a repeat tap can CLEAR it — users can
  // never uncheck a native radio. `null` = unanswered: no radio is checked,
  // FormData omits the field, and the required rule in validation.ts reports
  // it at submit. All selected styling still reads the DOM `:checked` state.
  const [selected, setSelected] = useState<number | null>(null);
  const errorId = `${id}-error`;
  const describedBy = error ? errorId : undefined;

  return (
    <fieldset
      aria-invalid={error ? true : undefined}
      aria-describedby={describedBy}
    >
      <legend className="mb-4 flex w-full items-start gap-3">
        <span className="grid size-7 shrink-0 place-items-center rounded-full bg-brand text-sm font-bold text-cream">
          {toPersianDigits(number)}
        </span>
        <span className="pt-0.5 text-base font-semibold leading-7 text-ink">
          {text}
          {/* Required marker — q1..q6 are required (validation.ts). */}
          <span aria-hidden="true" className="ms-1 text-brand">
            *
          </span>
          <span className="sr-only">{UI_COPY.requiredHint}</span>
        </span>
      </legend>

      <div className="flex items-start justify-between gap-1 sm:gap-2">
        {scale.map((label, index) => {
          const value = index + 1;
          return (
            <label
              key={index}
              className="group flex min-w-0 flex-1 cursor-pointer flex-col items-center gap-2 rounded-xl py-1"
            >
              <input
                type="radio"
                name={id}
                value={value}
                checked={selected === value}
                onChange={() => {
                  setSelected(value);
                  onSelect?.();
                }}
                // A tap on the already-selected option clears it. Safe because
                // the browser dispatches click BEFORE change — and a click on
                // an already-checked radio fires click alone — so `selected`
                // still holds the pre-click choice here.
                onClick={() => {
                  if (selected === value) setSelected(null);
                }}
                // Space on a checked radio is natively a no-op; make it
                // deselect so keyboard users get the same toggle as touch.
                // preventDefault stops the browser's own re-activation click.
                onKeyDown={(event) => {
                  if (event.key === " " && selected === value) {
                    event.preventDefault();
                    setSelected(null);
                  }
                }}
                aria-describedby={describedBy}
                className="peer sr-only"
              />
              <span
                aria-hidden="true"
                className={`grid size-11 place-items-center rounded-full border-2 bg-cream/60 transition peer-hover:border-brand/60 peer-checked:border-brand peer-checked:bg-brand peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-brand sm:size-12 ${
                  error ? "border-brand/70" : "border-brand/30"
                }`}
              >
                {/* The badge "stamp" — pops in while this option's radio is
                    checked. The mark is a descendant of this span (not a
                    sibling of the radio), so it can't use peer-checked; the
                    label is the `group`, and :has(:checked) only ever sees the
                    label's own radio. */}
                <LenoMark className="w-7 text-cream opacity-0 scale-75 transition duration-200 ease-out group-has-checked:opacity-100 group-has-checked:scale-100" />
              </span>
              <span className="text-center text-[11px] font-medium leading-tight text-muted transition-colors peer-checked:font-bold peer-checked:text-ink sm:text-xs">
                {label}
              </span>
            </label>
          );
        })}
      </div>

      {error && (
        <p id={errorId} className="mt-3 text-sm font-medium text-brand">
          {error}
        </p>
      )}
    </fieldset>
  );
}

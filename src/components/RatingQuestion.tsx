import { toPersianDigits } from "@/lib/format";

type RatingQuestionProps = {
  id: string;
  number: number;
  text: string;
  scale: readonly string[];
};

// A 5-point rating as a real radio group (fieldset/legend). Each option's value
// is its array index + 1, so the stored score never depends on visual position.
// In RTL the row flips visually — index 0 renders rightmost — but value is fixed.
export function RatingQuestion({
  id,
  number,
  text,
  scale,
}: RatingQuestionProps) {
  return (
    <fieldset>
      <legend className="mb-4 flex w-full items-start gap-3">
        <span className="grid size-7 shrink-0 place-items-center rounded-full bg-brand text-sm font-bold text-cream">
          {toPersianDigits(number)}
        </span>
        <span className="pt-0.5 text-base font-semibold leading-7 text-ink">
          {text}
        </span>
      </legend>

      <div className="flex items-start justify-between gap-1">
        {scale.map((label, index) => (
          <label
            key={index}
            className="group flex flex-1 cursor-pointer flex-col items-center gap-2 rounded-xl py-1"
          >
            <input
              type="radio"
              name={id}
              value={index + 1}
              className="peer sr-only"
            />
            <span
              aria-hidden="true"
              className="size-10 rounded-full border-2 border-brand/30 bg-cream/60 transition peer-hover:border-brand/60 peer-checked:border-brand peer-checked:bg-brand peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-brand"
            />
            <span className="text-center text-[11px] font-medium leading-tight text-muted transition-colors peer-checked:font-bold peer-checked:text-ink">
              {label}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

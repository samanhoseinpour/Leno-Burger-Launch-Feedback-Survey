import { toPersianDigits } from "@/lib/format";
import { UI_COPY } from "@/lib/survey";

type TextQuestionProps = {
  number: number;
  text: string;
  name: string;
};

export function TextQuestion({ number, text, name }: TextQuestionProps) {
  return (
    <div>
      <label htmlFor={name} className="mb-3 flex w-full items-start gap-3">
        <span className="grid size-7 shrink-0 place-items-center rounded-full bg-brand text-sm font-bold text-cream">
          {toPersianDigits(number)}
        </span>
        <span className="pt-0.5 text-base font-semibold leading-7 text-ink">
          {text}
          {/* The order note (Q7) is optional free text — mark it like name/phone. */}
          <span className="ms-1.5 whitespace-nowrap text-sm font-normal text-muted">
            ({UI_COPY.optionalTag})
          </span>
        </span>
      </label>
      {/* text-base (16px): iOS Safari auto-zooms into a focused field under
          16px. Keep it at 16px so tapping to type doesn't zoom the page. */}
      <textarea
        id={name}
        name={name}
        rows={3}
        className="w-full resize-none rounded-2xl border border-line bg-cream/30 px-4 py-3 text-base leading-7 text-ink outline-none transition placeholder:text-muted/60 focus:border-brand focus:bg-cream/50"
      />
    </div>
  );
}

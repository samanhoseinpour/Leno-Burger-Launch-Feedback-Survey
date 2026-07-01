import { toPersianDigits } from "@/lib/format";

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
        </span>
      </label>
      <textarea
        id={name}
        name={name}
        rows={3}
        className="w-full resize-none rounded-2xl border border-line bg-cream/30 px-4 py-3 text-sm leading-7 text-ink outline-none transition placeholder:text-muted/60 focus:border-brand focus:bg-cream/50"
      />
    </div>
  );
}

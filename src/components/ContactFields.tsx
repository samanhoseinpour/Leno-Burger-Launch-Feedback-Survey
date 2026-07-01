import { COPY } from "@/lib/survey";

export function ContactFields() {
  return (
    <fieldset className="rounded-2xl bg-cream2/50 p-5">
      <legend className="px-1 text-sm font-semibold text-ink">
        {COPY.contactHeading}
      </legend>
      <div className="mt-2 grid gap-4">
        <div className="grid gap-1.5">
          <label htmlFor="name" className="text-sm text-muted">
            {COPY.nameLabel}
          </label>
          <input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            className="h-11 rounded-xl border border-line bg-paper px-3 text-sm text-ink outline-none transition focus:border-brand"
          />
        </div>
        <div className="grid gap-1.5">
          <label htmlFor="phone" className="text-sm text-muted">
            {COPY.phoneLabel}
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            dir="ltr"
            placeholder="۰۹۱۲۳۴۵۶۷۸۹"
            className="h-11 rounded-xl border border-line bg-paper px-3 text-start text-sm text-ink outline-none transition placeholder:text-muted/50 focus:border-brand"
          />
        </div>
      </div>
    </fieldset>
  );
}

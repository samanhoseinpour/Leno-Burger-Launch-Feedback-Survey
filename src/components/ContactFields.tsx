import { COPY } from "@/lib/survey";

type ContactFieldsProps = {
  errors?: { name?: string; phone?: string };
  onFieldChange?: (field: "name" | "phone") => void;
};

export function ContactFields({ errors = {}, onFieldChange }: ContactFieldsProps) {
  return (
    <fieldset className="rounded-2xl bg-cream2/50 p-5 sm:p-6">
      <legend className="px-1 text-sm font-semibold text-ink">
        {COPY.contactHeading}
      </legend>
      <div className="mt-2 grid items-start gap-4 sm:grid-cols-2">
        <div className="grid gap-1.5">
          <label htmlFor="name" className="text-sm text-muted">
            {COPY.nameLabel}
          </label>
          <input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            onChange={() => onFieldChange?.("name")}
            aria-invalid={errors.name ? true : undefined}
            aria-describedby={errors.name ? "name-error" : undefined}
            className={`h-11 rounded-xl border bg-paper px-3 text-sm text-ink outline-none transition focus:border-brand ${
              errors.name ? "border-brand" : "border-line"
            }`}
          />
          {errors.name && (
            <p id="name-error" className="text-sm font-medium text-brand">
              {errors.name}
            </p>
          )}
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
            onChange={() => onFieldChange?.("phone")}
            aria-invalid={errors.phone ? true : undefined}
            aria-describedby={errors.phone ? "phone-error" : undefined}
            className={`h-11 rounded-xl border bg-paper px-3 text-start text-sm text-ink outline-none transition placeholder:text-muted/50 focus:border-brand ${
              errors.phone ? "border-brand" : "border-line"
            }`}
          />
          {errors.phone && (
            <p id="phone-error" className="text-sm font-medium text-brand">
              {errors.phone}
            </p>
          )}
        </div>
      </div>
    </fieldset>
  );
}

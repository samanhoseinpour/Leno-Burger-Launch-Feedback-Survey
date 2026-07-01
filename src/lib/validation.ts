// Shared, type-safe validation for the feedback submit. The SAME schema runs on
// the server (source of truth in `actions.ts`) and on the client (instant inline
// errors in `SurveyForm`), so the two can never drift.
//
// Policy (a deliberate product decision — see the plan / CLAUDE.md):
//   • q1..q6 ratings are REQUIRED (1..5).
//   • orderNote (Q7) and name are OPTIONAL free text.
//   • phone is OPTIONAL, but if entered it must normalize to a valid Iranian
//     mobile (09xxxxxxxxx). Empty stays fine.
//
// All messages here are UI microcopy (not printed-card copy), so they are written
// in the interface's own gentle Persian voice — same rationale as `UI_COPY`.

import { z } from "zod";
import { normalizePhone } from "./format";

export const VALIDATION_MESSAGES = {
  ratingRequired: "لطفاً به این پرسش پاسخ دهید.",
  ratingInvalid: "امتیاز نامعتبر است.",
  phoneInvalid: "شماره موبایل معتبر نیست (مثل ۰۹۱۲۳۴۵۶۷۸۹).",
  textTooLong: "متن واردشده بیش از حد طولانی است.",
} as const;

const M = VALIDATION_MESSAGES;

// A required 1..5 rating. Absent / empty / non-numeric collapse to `undefined`
// so the "please answer" message fires cleanly; a real out-of-range number (only
// reachable by a tampered request) gets the "invalid score" message.
const ratingField = z.preprocess(
  (value) => {
    if (value === "" || value === null || value === undefined) return undefined;
    const n = Number(value);
    return Number.isFinite(n) ? n : undefined;
  },
  z
    .number({ error: M.ratingRequired })
    .int({ error: M.ratingInvalid })
    .min(1, { error: M.ratingInvalid })
    .max(5, { error: M.ratingInvalid }),
);

// Optional trimmed free text → `null` when blank, with a generous length cap.
const optionalText = (max: number) =>
  z
    .preprocess(
      (value) => (typeof value === "string" ? value.trim() : ""),
      z.string().max(max, { error: M.textTooLong }),
    )
    .transform((value) => (value === "" ? null : value));

// Optional phone → normalized `09xxxxxxxxx` or `null`. Never blocks on empty;
// only a non-empty, non-mobile value is rejected.
const phoneField = z
  .preprocess(
    (value) => (typeof value === "string" ? normalizePhone(value) : ""),
    z
      .string()
      .refine((v) => v === "" || /^09\d{9}$/.test(v), { error: M.phoneInvalid }),
  )
  .transform((value) => (value === "" ? null : value));

export const FeedbackSchema = z.object({
  q1: ratingField,
  q2: ratingField,
  q3: ratingField,
  q4: ratingField,
  q5: ratingField,
  q6: ratingField,
  orderNote: optionalText(2000),
  name: optionalText(120),
  phone: phoneField,
});

export type FeedbackInput = z.input<typeof FeedbackSchema>;
export type FeedbackData = z.output<typeof FeedbackSchema>;
export type FeedbackField = keyof FeedbackData;
export type FieldErrors = Partial<Record<FeedbackField, string>>;

/** Pull the raw survey fields out of a submitted FormData (client + server). */
export function feedbackFromFormData(formData: FormData) {
  const get = (key: string) => {
    const value = formData.get(key);
    return typeof value === "string" ? value : undefined;
  };
  return {
    q1: get("q1"),
    q2: get("q2"),
    q3: get("q3"),
    q4: get("q4"),
    q5: get("q5"),
    q6: get("q6"),
    orderNote: get("orderNote"),
    name: get("name"),
    phone: get("phone"),
  };
}

/** Flatten a ZodError into `{ field: firstMessage }` for inline display. */
export function fieldErrorsOf(error: z.ZodError): FieldErrors {
  const out: FieldErrors = {};
  for (const issue of error.issues) {
    const key = issue.path[0];
    if (typeof key === "string" && !(key in out)) {
      out[key as FeedbackField] = issue.message;
    }
  }
  return out;
}

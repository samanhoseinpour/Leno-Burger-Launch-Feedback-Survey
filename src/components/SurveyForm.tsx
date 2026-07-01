'use client';

import { useActionState, useState, startTransition } from 'react';
import { submitFeedback, type SubmitState } from '@/app/actions';
import { COPY, UI_COPY, QUESTIONS, ORDER_QUESTION_NUMBER } from '@/lib/survey';
import {
  FeedbackSchema,
  feedbackFromFormData,
  fieldErrorsOf,
  type FeedbackField,
  type FieldErrors,
} from '@/lib/validation';
import { RatingQuestion } from './RatingQuestion';
import { TextQuestion } from './TextQuestion';
import { ContactFields } from './ContactFields';
import { ThankYou } from './ThankYou';
import { SurveyFooter } from './SurveyFooter';

const initialState: SubmitState = { status: 'idle' };

// Focus order matches the visual/DOM order of the form.
const FIELD_ORDER: FeedbackField[] = [
  'q1',
  'q2',
  'q3',
  'q4',
  'q5',
  'q6',
  'orderNote',
  'name',
  'phone',
];

export function SurveyForm() {
  const [state, formAction, pending] = useActionState(
    submitFeedback,
    initialState,
  );
  const [errors, setErrors] = useState<FieldErrors>({});

  // On success, swap the whole form for the thank-you (also blocks re-submits).
  if (state.status === 'success') {
    return <ThankYou />;
  }

  function clearError(field: FeedbackField) {
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }

  const hasErrors = Object.keys(errors).length > 0;

  return (
    <>
      <form
        onSubmit={(event) => {
          // Validate on the client for instant inline errors, then dispatch the
          // Server Action ourselves. The server re-validates with the same schema
          // (source of truth), so a bypassed check still can't write a bad row.
          event.preventDefault();
          const form = event.currentTarget;
          const formData = new FormData(form);
          const result = FeedbackSchema.safeParse(
            feedbackFromFormData(formData),
          );
          if (!result.success) {
            const fieldErrors = fieldErrorsOf(result.error);
            setErrors(fieldErrors);
            focusFirstError(form, fieldErrors);
            return;
          }
          setErrors({});
          startTransition(() => formAction(formData));
        }}
        noValidate
        className="px-5 pb-9 sm:px-9"
      >
        <p className="mt-6 rounded-2xl border border-line bg-cream2/50 px-4 py-3 text-sm leading-7 text-ink/80">
          {COPY.instruction}
        </p>

        <div className="mt-2 divide-y divide-line">
          {QUESTIONS.map((question, index) => (
            <div key={question.id} className="py-7">
              <RatingQuestion
                id={question.id}
                number={index + 1}
                text={question.text}
                scale={question.scale}
                error={errors[question.id]}
                onSelect={() => clearError(question.id)}
              />
            </div>
          ))}
          <div className="py-7">
            <TextQuestion
              number={ORDER_QUESTION_NUMBER}
              text={COPY.orderQuestion}
              name="orderNote"
            />
          </div>
        </div>

        <ContactFields
          errors={{ name: errors.name, phone: errors.phone }}
          onFieldChange={clearError}
        />

        {state.status === 'error' && state.kind === 'server' && (
          <p
            role="alert"
            className="mt-6 rounded-xl bg-brand/10 px-4 py-3 text-center text-sm font-medium text-brand"
          >
            {UI_COPY.serverError}
          </p>
        )}
        {hasErrors && (
          <p
            role="alert"
            className="mt-6 rounded-xl bg-brand/10 px-4 py-3 text-center text-sm font-medium text-brand"
          >
            {UI_COPY.fixErrors}
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="mt-7 flex h-14 w-full items-center justify-center rounded-2xl bg-brand text-base font-bold text-cream transition active:scale-[0.99] disabled:opacity-60 cursor-pointer"
        >
          {pending ? UI_COPY.submitting : COPY.submit}
        </button>
      </form>

      <SurveyFooter />
    </>
  );
}

function focusFirstError(form: HTMLFormElement, errors: FieldErrors) {
  for (const field of FIELD_ORDER) {
    if (errors[field]) {
      const el = form.querySelector<HTMLElement>(`[name="${field}"]`);
      if (el) {
        el.focus();
        el.scrollIntoView({ block: 'center', behavior: 'smooth' });
      }
      return;
    }
  }
}

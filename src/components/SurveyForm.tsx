"use client";

import { useActionState } from "react";
import { submitFeedback, type SubmitState } from "@/app/actions";
import { COPY, UI_COPY, QUESTIONS, ORDER_QUESTION_NUMBER } from "@/lib/survey";
import { RatingQuestion } from "./RatingQuestion";
import { TextQuestion } from "./TextQuestion";
import { ContactFields } from "./ContactFields";
import { ThankYou } from "./ThankYou";
import { Brand } from "./Brand";

const initialState: SubmitState = { status: "idle" };

export function SurveyForm() {
  const [state, formAction, pending] = useActionState(
    submitFeedback,
    initialState,
  );

  // On success, swap the whole form for the thank-you (also blocks re-submits).
  if (state.status === "success") {
    return <ThankYou />;
  }

  return (
    <form action={formAction} noValidate className="px-5 pb-6">
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

      <ContactFields />

      {state.status === "error" && (
        <p
          role="alert"
          className="mt-6 rounded-xl bg-brand/10 px-4 py-3 text-center text-sm font-medium text-brand"
        >
          {state.kind === "empty" ? UI_COPY.emptyError : UI_COPY.serverError}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-7 flex h-14 w-full items-center justify-center rounded-2xl bg-brand text-base font-bold text-cream transition active:scale-[0.99] disabled:opacity-60"
      >
        {pending ? UI_COPY.submitting : COPY.submit}
      </button>

      <div className="flex justify-center pt-9">
        <Brand surface="paper" />
      </div>
    </form>
  );
}

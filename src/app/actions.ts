"use server";

import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import {
  FeedbackSchema,
  feedbackFromFormData,
  fieldErrorsOf,
  type FieldErrors,
} from "@/lib/validation";

export type SubmitState =
  | { status: "idle" }
  | { status: "error"; kind: "validation"; fieldErrors: FieldErrors }
  | { status: "error"; kind: "server" }
  | { status: "success" };

export async function submitFeedback(
  _prev: SubmitState,
  formData: FormData,
): Promise<SubmitState> {
  // The schema is the source of truth and runs even if the client check is
  // bypassed (tampered request, JS off): required q1..q6, optional note/name,
  // and a phone that must be a valid Iranian mobile when present.
  const parsed = FeedbackSchema.safeParse(feedbackFromFormData(formData));
  if (!parsed.success) {
    return {
      status: "error",
      kind: "validation",
      fieldErrors: fieldErrorsOf(parsed.error),
    };
  }

  try {
    // Privacy: store the user agent only — never IP or any tracking.
    const userAgent = (await headers()).get("user-agent");
    await prisma.response.create({
      data: { ...parsed.data, userAgent },
    });
    return { status: "success" };
  } catch (error) {
    console.error("Failed to save feedback response:", error);
    return { status: "error", kind: "server" };
  }
}

"use server";

import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { normalizePhone } from "@/lib/format";

export type SubmitState =
  | { status: "idle" }
  | { status: "error"; kind: "empty" | "server" }
  | { status: "success" };

// A rating is a stored integer 1..5 (array index + 1) or null when skipped.
function parseRating(value: FormDataEntryValue | null): number | null {
  if (typeof value !== "string" || value === "") return null;
  const n = Number(value);
  return Number.isInteger(n) && n >= 1 && n <= 5 ? n : null;
}

function optionalText(value: FormDataEntryValue | null): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}

export async function submitFeedback(
  _prev: SubmitState,
  formData: FormData,
): Promise<SubmitState> {
  const ratings = {
    q1: parseRating(formData.get("q1")),
    q2: parseRating(formData.get("q2")),
    q3: parseRating(formData.get("q3")),
    q4: parseRating(formData.get("q4")),
    q5: parseRating(formData.get("q5")),
    q6: parseRating(formData.get("q6")),
  };
  const orderNote = optionalText(formData.get("orderNote"));
  const name = optionalText(formData.get("name"));
  const phoneRaw = optionalText(formData.get("phone"));
  const phone = phoneRaw ? normalizePhone(phoneRaw) || null : null;

  // Ratings are optional; only a *fully* empty submission is rejected.
  const noRatings = Object.values(ratings).every((v) => v === null);
  if (noRatings && !orderNote && !name && !phone) {
    return { status: "error", kind: "empty" };
  }

  try {
    // Privacy: store the user agent only — never IP or any tracking.
    const userAgent = (await headers()).get("user-agent");
    await prisma.response.create({
      data: { ...ratings, orderNote, name, phone, userAgent },
    });
    return { status: "success" };
  } catch (error) {
    console.error("Failed to save feedback response:", error);
    return { status: "error", kind: "server" };
  }
}

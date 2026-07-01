import type { Response } from "@prisma/client";
import { QUESTIONS, type QuestionId } from "./survey";

export type QuestionStat = {
  average: number; // 0..5 (0 when there are no ratings yet)
  count: number; // number of non-null ratings
  distribution: number[]; // length 5: counts for stored values 1..5
};

export function summarizeQuestion(
  responses: Response[],
  id: QuestionId,
): QuestionStat {
  const distribution = [0, 0, 0, 0, 0];
  let sum = 0;
  let count = 0;
  for (const r of responses) {
    const v = r[id];
    if (typeof v === "number" && v >= 1 && v <= 5) {
      distribution[v - 1] += 1;
      sum += v;
      count += 1;
    }
  }
  return { average: count ? sum / count : 0, count, distribution };
}

export function summarizeAll(responses: Response[]) {
  return QUESTIONS.map((question) => ({
    question,
    stat: summarizeQuestion(responses, question.id),
  }));
}

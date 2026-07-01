import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { QUESTIONS } from "@/lib/survey";

const HEADER = [
  "شناسه",
  "تاریخ ثبت",
  // Rating columns — labels match the admin table (QUESTIONS[i].short).
  ...QUESTIONS.map((q) => q.short),
  "سفارش / نظر",
  "نام",
  "تلفن",
  "مرورگر",
];

function csvCell(value: unknown): string {
  if (value === null || value === undefined) return "";
  let s = value instanceof Date ? value.toISOString() : String(value);
  // Neutralize spreadsheet formula injection: guest-supplied text (name, note,
  // phone) is opened in Excel/Sheets, where a leading = + - @ (or tab/CR) would
  // execute as a formula. Prefix with an apostrophe so it stays literal text.
  if (/^[=+\-@\t\r]/.test(s)) s = "'" + s;
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export async function GET() {
  if (!(await isAdmin())) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const responses = await prisma.response.findMany({
    orderBy: { createdAt: "asc" },
  });

  const rows = responses.map((r) => [
    r.id,
    r.createdAt,
    // Emit the scale label ("خیلی خوب" …) rather than the raw 1..5, matching the
    // admin table. Blank when the guest skipped the question.
    ...QUESTIONS.map((q) => {
      const value = r[q.id];
      return typeof value === "number" ? q.scale[value - 1] : null;
    }),
    r.orderNote,
    r.name,
    r.phone,
    r.userAgent,
  ]);

  const csv = [HEADER, ...rows]
    .map((row) => row.map(csvCell).join(","))
    .join("\r\n");

  // Prepend a UTF-8 BOM so Excel opens the Persian text correctly.
  const body = "﻿" + csv;

  return new NextResponse(body, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="leno-feedback.csv"',
    },
  });
}

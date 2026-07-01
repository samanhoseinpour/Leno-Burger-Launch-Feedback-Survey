import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const HEADER = [
  "شناسه",
  "تاریخ ثبت",
  "طعم",
  "اندازه",
  "کیفیت مواد",
  "سرعت",
  "ارزش",
  "پیشنهاد",
  "سفارش / نظر",
  "نام",
  "تلفن",
  "مرورگر",
];

function csvCell(value: unknown): string {
  if (value === null || value === undefined) return "";
  const s = value instanceof Date ? value.toISOString() : String(value);
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
    r.q1,
    r.q2,
    r.q3,
    r.q4,
    r.q5,
    r.q6,
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

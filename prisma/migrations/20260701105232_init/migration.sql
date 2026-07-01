-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "Response" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "q1" INTEGER,
    "q2" INTEGER,
    "q3" INTEGER,
    "q4" INTEGER,
    "q5" INTEGER,
    "q6" INTEGER,
    "orderNote" TEXT,
    "name" TEXT,
    "phone" TEXT,
    "userAgent" TEXT,

    CONSTRAINT "Response_pkey" PRIMARY KEY ("id")
);


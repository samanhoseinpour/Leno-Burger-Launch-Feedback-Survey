import { createHash, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const ADMIN_COOKIE = "leno_admin";

// Constant-time string comparison (guards against timing attacks).
function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  return ab.length === bb.length && timingSafeEqual(ab, bb);
}

// The session cookie stores a non-reversible token derived from ADMIN_PASSWORD,
// so the raw password is never persisted client-side. Rotating the password
// invalidates any existing sessions.
export function adminToken(): string {
  const secret = process.env.ADMIN_PASSWORD ?? "";
  return createHash("sha256").update(secret).digest("hex");
}

export function verifyPassword(input: string): boolean {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) return false; // Not configured → always locked.
  return safeEqual(input, password);
}

export async function isAdmin(): Promise<boolean> {
  if (!process.env.ADMIN_PASSWORD) return false;
  const token = (await cookies()).get(ADMIN_COOKIE)?.value;
  return !!token && safeEqual(token, adminToken());
}

import { NextRequest, NextResponse } from "next/server";
import { loginSchema } from "@/lib/validation";
import { login } from "@/services/auth-service";
import { SESSION_COOKIE_NAME } from "@/lib/env";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const ip = req.headers.get("x-forwarded-for") || "local";
  const result = await login(parsed.data.username, parsed.data.password, ip);

  if (!result.ok || !result.token) {
    return NextResponse.json({ error: result.error || "Login failed." }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE_NAME, result.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: new Date(result.expiresAt!),
  });
  return res;
}

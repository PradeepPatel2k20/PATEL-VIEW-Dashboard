import { findUserByUsername, updateUser } from "@/repositories/user-repository";
import { verifyPassword } from "@/lib/auth";
import { createSessionToken } from "@/lib/crypto";
import { isRateLimited, recordAttempt, clearAttempts } from "@/lib/rate-limit";
import { logAuditEvent } from "@/lib/audit";

const LOCK_DURATION_MS = 15 * 60 * 1000;

export interface LoginResult {
  ok: boolean;
  token?: string;
  expiresAt?: number;
  error?: string;
}

export async function login(username: string, password: string, ip: string): Promise<LoginResult> {
  const rateLimitKey = `${ip}:${username.toLowerCase()}`;
  if (isRateLimited(rateLimitKey)) {
    await logAuditEvent(username, "login_blocked_rate_limit", { ip });
    return { ok: false, error: "Too many attempts. Try again in 15 minutes." };
  }

  const user = await findUserByUsername(username);
  if (!user) {
    recordAttempt(rateLimitKey);
    await logAuditEvent(username, "login_failed_unknown_user", { ip });
    return { ok: false, error: "Invalid username or password." };
  }

  if (user.lockedUntil && new Date(user.lockedUntil).getTime() > Date.now()) {
    await logAuditEvent(username, "login_blocked_locked_account", { ip });
    return { ok: false, error: "Account temporarily locked. Try again later." };
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    recordAttempt(rateLimitKey);
    const failedAttempts = user.failedLoginAttempts + 1;
    const patch: Partial<typeof user> = { failedLoginAttempts: failedAttempts };
    if (failedAttempts >= 5) {
      patch.lockedUntil = new Date(Date.now() + LOCK_DURATION_MS).toISOString();
    }
    await updateUser(username, patch);
    await logAuditEvent(username, "login_failed_bad_password", { ip, failedAttempts });
    return { ok: false, error: "Invalid username or password." };
  }

  clearAttempts(rateLimitKey);
  await updateUser(username, {
    failedLoginAttempts: 0,
    lockedUntil: null,
    lastLoginAt: new Date().toISOString(),
  });

  const expiresAt = Date.now() + 60 * 60 * 1000; // 1 hour; session settings can extend this
  const token = await createSessionToken({
    username: user.username,
    role: "admin",
    issuedAt: Date.now(),
    expiresAt,
  });

  await logAuditEvent(username, "login_success", { ip });
  return { ok: true, token, expiresAt };
}

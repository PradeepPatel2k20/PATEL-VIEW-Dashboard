// Central place for server-only secrets. In production, set these via real
// environment variables (.env.local) — never commit real secrets to git.
export const SESSION_SECRET = process.env.SESSION_SECRET || "dev-only-insecure-secret-change-me";
export const SESSION_COOKIE_NAME = "ptv_session";

import { SESSION_SECRET } from "./env";

/**
 * Minimal stateless session token: base64url(payload) + "." + HMAC-SHA256 signature.
 * Built on the Web Crypto API (globalThis.crypto.subtle) rather than Node's `crypto`
 * module so this works in BOTH the Node runtime (API routes) and the Edge runtime
 * (middleware) without a "Node.js module in Edge Runtime" build error.
 */
export interface SessionPayload {
  username: string;
  role: "admin";
  issuedAt: number;
  expiresAt: number;
}

function toBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(input: string): Uint8Array<ArrayBuffer> {
  const padded = input.replace(/-/g, "+").replace(/_/g, "/").padEnd(input.length + ((4 - (input.length % 4)) % 4), "=");
  const binary = atob(padded);
  const buffer = new ArrayBuffer(binary.length);
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function getKey(): Promise<CryptoKey> {
  const enc = new TextEncoder();
  return crypto.subtle.importKey("raw", enc.encode(SESSION_SECRET), { name: "HMAC", hash: "SHA-256" }, false, [
    "sign",
    "verify",
  ]);
}

async function sign(data: string): Promise<string> {
  const key = await getKey();
  const sigBuffer = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(data));
  return toBase64Url(new Uint8Array(sigBuffer));
}

async function verify(data: string, signature: string): Promise<boolean> {
  const key = await getKey();
  try {
    const sigBytes = fromBase64Url(signature);
    const dataBytes = new TextEncoder().encode(data);
    return await crypto.subtle.verify("HMAC", key, sigBytes, dataBytes);
  } catch {
    return false;
  }
}

export async function createSessionToken(payload: SessionPayload): Promise<string> {
  const body = toBase64Url(new TextEncoder().encode(JSON.stringify(payload)));
  const sig = await sign(body);
  return `${body}.${sig}`;
}

export async function verifySessionToken(token: string | undefined | null): Promise<SessionPayload | null> {
  if (!token) return null;
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;

  const valid = await verify(body, sig);
  if (!valid) return null;

  try {
    const decoded = new TextDecoder().decode(fromBase64Url(body));
    const payload = JSON.parse(decoded) as SessionPayload;
    if (payload.expiresAt < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

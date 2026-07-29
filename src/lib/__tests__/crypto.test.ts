import { describe, it, expect } from "vitest";
import { createSessionToken, verifySessionToken } from "@/lib/crypto";

describe("session token signing (Web Crypto based, Edge-compatible)", () => {
  it("round-trips a valid payload", async () => {
    const token = await createSessionToken({
      username: "admin",
      role: "admin",
      issuedAt: Date.now(),
      expiresAt: Date.now() + 60_000,
    });
    const payload = await verifySessionToken(token);
    expect(payload).not.toBeNull();
    expect(payload?.username).toBe("admin");
  });

  it("rejects a tampered token", async () => {
    const token = await createSessionToken({
      username: "admin",
      role: "admin",
      issuedAt: Date.now(),
      expiresAt: Date.now() + 60_000,
    });
    const [body] = token.split(".");
    const tampered = `${body}.invalidsignature`;
    expect(await verifySessionToken(tampered)).toBeNull();
  });

  it("rejects an expired token", async () => {
    const token = await createSessionToken({
      username: "admin",
      role: "admin",
      issuedAt: Date.now() - 120_000,
      expiresAt: Date.now() - 60_000,
    });
    expect(await verifySessionToken(token)).toBeNull();
  });

  it("rejects null/undefined tokens", async () => {
    expect(await verifySessionToken(null)).toBeNull();
    expect(await verifySessionToken(undefined)).toBeNull();
  });
});

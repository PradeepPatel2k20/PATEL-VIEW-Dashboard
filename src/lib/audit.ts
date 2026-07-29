import { appendFile, mkdir } from "fs/promises";
import path from "path";

const AUDIT_LOG_PATH = path.join(process.cwd(), "data", "audit.log");

export async function logAuditEvent(actor: string, action: string, detail?: Record<string, unknown>): Promise<void> {
  try {
    await mkdir(path.dirname(AUDIT_LOG_PATH), { recursive: true });
    const line = JSON.stringify({
      timestamp: new Date().toISOString(),
      actor,
      action,
      detail: detail ?? {},
    });
    await appendFile(AUDIT_LOG_PATH, line + "\n", "utf-8");
  } catch (err) {
    // Audit logging must never break the request it's observing.
    console.error("Failed to write audit log:", err);
  }
}

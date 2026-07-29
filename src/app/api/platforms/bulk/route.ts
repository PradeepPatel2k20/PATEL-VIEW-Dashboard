import { NextRequest, NextResponse } from "next/server";
import { bulkDeletePlatforms, bulkSetEnabled } from "@/services/platform-service";
import { bulkIdsSchema } from "@/lib/validation";
import { requireAdmin } from "@/lib/require-admin";
import { logAuditEvent } from "@/lib/audit";
import { z } from "zod";

const bulkActionSchema = bulkIdsSchema.extend({
  action: z.enum(["delete", "enable", "disable"]),
});

export async function POST(req: NextRequest) {
  const guard = await requireAdmin(req);
  if (guard instanceof NextResponse) return guard;

  const body = await req.json().catch(() => null);
  const parsed = bulkActionSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid request." }, { status: 400 });

  const { ids, action } = parsed.data;
  let count = 0;
  if (action === "delete") count = await bulkDeletePlatforms(ids);
  else count = await bulkSetEnabled(ids, action === "enable");

  await logAuditEvent(guard.username, `bulk_${action}`, { ids, count });
  return NextResponse.json({ ok: true, count });
}

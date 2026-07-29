import { NextRequest, NextResponse } from "next/server";
import { reorderPlatforms } from "@/services/platform-service";
import { requireAdmin } from "@/lib/require-admin";
import { logAuditEvent } from "@/lib/audit";
import { z } from "zod";

const reorderSchema = z.object({ orderedIds: z.array(z.string()).min(1) });

export async function POST(req: NextRequest) {
  const guard = await requireAdmin(req);
  if (guard instanceof NextResponse) return guard;

  const body = await req.json().catch(() => null);
  const parsed = reorderSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid request." }, { status: 400 });

  const platforms = await reorderPlatforms(parsed.data.orderedIds);
  await logAuditEvent(guard.username, "platforms_reordered", { count: platforms.length });
  return NextResponse.json({ data: platforms });
}

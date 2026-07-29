import { NextResponse } from "next/server";
import { getKpis } from "@/services/platform-service";
import { getSettings } from "@/services/settings-service";

export async function GET() {
  const settings = await getSettings();
  const kpis = await getKpis(settings.newReleaseThresholdDays);
  return NextResponse.json({ data: kpis });
}

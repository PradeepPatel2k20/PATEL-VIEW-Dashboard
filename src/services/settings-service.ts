import { readSettings, writeSettings } from "@/repositories/settings-repository";
import type { AppSettings } from "@/types/settings";

export async function getSettings(): Promise<AppSettings> {
  return readSettings();
}

export async function updateSettings(patch: Partial<AppSettings>): Promise<AppSettings> {
  const current = await readSettings();
  const next = { ...current, ...patch };
  await writeSettings(next);
  return next;
}

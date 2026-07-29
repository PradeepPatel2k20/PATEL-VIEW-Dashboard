import { readFile, writeFile, mkdir } from "fs/promises";
import path from "path";
import type { AppSettings } from "@/types/settings";

const DATA_PATH = path.join(process.cwd(), "data", "settings.json");

const DEFAULT_SETTINGS: AppSettings = {
  refreshIntervalMinutes: 5,
  theme: "dark",
  defaultView: "cards",
  appName: "Altudo VIEW — Platform Tracker",
  logoUrl: "/logo.png",
  sessionTimeoutMinutes: 60,
  defaultCategory: "All",
  sidebarDefaultCollapsed: false,
  animationsEnabled: true,
  dateFormat: "MMM d, yyyy",
  timezone: "Asia/Kolkata",
  tablePageSize: 25,
  newReleaseThresholdDays: 30,
  exportFormats: ["csv", "json", "xlsx", "pdf"],
};

async function ensureDataFile(): Promise<void> {
  await mkdir(path.dirname(DATA_PATH), { recursive: true });
  try {
    await readFile(DATA_PATH, "utf-8");
  } catch {
    await writeFile(DATA_PATH, JSON.stringify(DEFAULT_SETTINGS, null, 2), "utf-8");
  }
}

export async function readSettings(): Promise<AppSettings> {
  await ensureDataFile();
  const raw = await readFile(DATA_PATH, "utf-8");
  try {
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } as AppSettings;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export async function writeSettings(settings: AppSettings): Promise<void> {
  await ensureDataFile();
  await writeFile(DATA_PATH, JSON.stringify(settings, null, 2), "utf-8");
}

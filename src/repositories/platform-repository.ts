import { readFile, writeFile, mkdir } from "fs/promises";
import path from "path";
import type { Platform } from "@/types/platform";

/**
 * Repository layer: the ONLY place that touches the JSON file on disk.
 * Swapping this for a real database later means rewriting this file only —
 * the service layer and API routes never change.
 */
const DATA_PATH = path.join(process.cwd(), "data", "platforms.json");

async function ensureDataFile(): Promise<void> {
  await mkdir(path.dirname(DATA_PATH), { recursive: true });
  try {
    await readFile(DATA_PATH, "utf-8");
  } catch {
    await writeFile(DATA_PATH, "[]", "utf-8");
  }
}

export async function readAllPlatforms(): Promise<Platform[]> {
  await ensureDataFile();
  const raw = await readFile(DATA_PATH, "utf-8");
  try {
    return JSON.parse(raw) as Platform[];
  } catch {
    return [];
  }
}

export async function writeAllPlatforms(platforms: Platform[]): Promise<void> {
  await ensureDataFile();
  await writeFile(DATA_PATH, JSON.stringify(platforms, null, 2), "utf-8");
}

export async function findPlatformById(id: string): Promise<Platform | undefined> {
  const platforms = await readAllPlatforms();
  return platforms.find((p) => p.id === id);
}

import { randomUUID } from "crypto";
import {
  readAllPlatforms,
  writeAllPlatforms,
  findPlatformById,
} from "@/repositories/platform-repository";
import type { Platform, PlatformFilters, SortDirection, SortField } from "@/types/platform";
import type { PlatformInputParsed } from "@/lib/validation";
import { slugify } from "@/lib/utils";

export async function listPlatforms(
  filters: PlatformFilters = {},
  sort?: { field: SortField; direction: SortDirection },
  thresholdDays = 30
): Promise<Platform[]> {
  let platforms = await readAllPlatforms();

  if (filters.enabledOnly) platforms = platforms.filter((p) => p.enabled);
  if (filters.category && filters.category !== "All") {
    platforms = platforms.filter((p) => p.category === filters.category);
  }
  if (filters.vendor) platforms = platforms.filter((p) => p.vendor === filters.vendor);
  if (filters.priority) platforms = platforms.filter((p) => p.priority === filters.priority);
  if (filters.monitoringEnabled) platforms = platforms.filter((p) => p.monitoringEnabled);
  if (filters.hasSecurityUpdate) {
    platforms = platforms.filter((p) => p.urgency === "urgent");
  }
  if (filters.recentlyUpdated) {
    const now = Date.now();
    platforms = platforms.filter((p) => {
      const diffDays = (now - new Date(p.latestReleaseDate).getTime()) / 86_400_000;
      return diffDays <= thresholdDays;
    });
  }
  if (filters.search) {
    const q = filters.search.toLowerCase();
    platforms = platforms.filter(
      (p) =>
        p.productName.toLowerCase().includes(q) ||
        p.vendor.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.currentVersion.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q))
    );
  }

  if (sort) {
    const dir = sort.direction === "asc" ? 1 : -1;
    const priorityRank: Record<string, number> = { low: 0, medium: 1, high: 2, critical: 3 };
    platforms = [...platforms].sort((a, b) => {
      switch (sort.field) {
        case "latestReleaseDate":
          return (new Date(a.latestReleaseDate).getTime() - new Date(b.latestReleaseDate).getTime()) * dir;
        case "priority":
          return (priorityRank[a.priority] - priorityRank[b.priority]) * dir;
        case "category":
          return a.category.localeCompare(b.category) * dir;
        case "currentVersion":
          return a.currentVersion.localeCompare(b.currentVersion) * dir;
        default:
          return a.productName.localeCompare(b.productName) * dir;
      }
    });
  } else {
    platforms = [...platforms].sort((a, b) => a.order - b.order);
  }

  return platforms;
}

export async function getPlatform(id: string): Promise<Platform | undefined> {
  return findPlatformById(id);
}

export async function createPlatform(input: PlatformInputParsed): Promise<Platform> {
  const platforms = await readAllPlatforms();
  const now = new Date().toISOString();

  let id = slugify(input.productName);
  if (platforms.some((p) => p.id === id)) id = `${id}-${randomUUID().slice(0, 6)}`;

  const platform: Platform = {
    ...input,
    id,
    order: platforms.length,
    createdAt: now,
    updatedAt: now,
  };

  platforms.push(platform);
  await writeAllPlatforms(platforms);
  return platform;
}

export async function updatePlatform(
  id: string,
  patch: Partial<PlatformInputParsed>
): Promise<Platform | null> {
  const platforms = await readAllPlatforms();
  const idx = platforms.findIndex((p) => p.id === id);
  if (idx === -1) return null;

  platforms[idx] = { ...platforms[idx], ...patch, updatedAt: new Date().toISOString() };
  await writeAllPlatforms(platforms);
  return platforms[idx];
}

export async function deletePlatform(id: string): Promise<boolean> {
  const platforms = await readAllPlatforms();
  const next = platforms.filter((p) => p.id !== id);
  if (next.length === platforms.length) return false;
  await writeAllPlatforms(next);
  return true;
}

export async function bulkDeletePlatforms(ids: string[]): Promise<number> {
  const platforms = await readAllPlatforms();
  const idSet = new Set(ids);
  const next = platforms.filter((p) => !idSet.has(p.id));
  await writeAllPlatforms(next);
  return platforms.length - next.length;
}

export async function bulkSetEnabled(ids: string[], enabled: boolean): Promise<number> {
  const platforms = await readAllPlatforms();
  const idSet = new Set(ids);
  let count = 0;
  const next = platforms.map((p) => {
    if (idSet.has(p.id)) {
      count += 1;
      return { ...p, enabled, updatedAt: new Date().toISOString() };
    }
    return p;
  });
  await writeAllPlatforms(next);
  return count;
}

export async function duplicatePlatform(id: string): Promise<Platform | null> {
  const platforms = await readAllPlatforms();
  const source = platforms.find((p) => p.id === id);
  if (!source) return null;

  const now = new Date().toISOString();
  let newId = `${source.id}-copy`;
  let suffix = 2;
  while (platforms.some((p) => p.id === newId)) {
    newId = `${source.id}-copy-${suffix}`;
    suffix += 1;
  }

  const copy: Platform = {
    ...source,
    id: newId,
    productName: `${source.productName} (Copy)`,
    order: platforms.length,
    createdAt: now,
    updatedAt: now,
  };
  platforms.push(copy);
  await writeAllPlatforms(platforms);
  return copy;
}

export async function reorderPlatforms(orderedIds: string[]): Promise<Platform[]> {
  const platforms = await readAllPlatforms();
  const rank = new Map(orderedIds.map((id, idx) => [id, idx]));
  const next = platforms.map((p) => ({
    ...p,
    order: rank.has(p.id) ? (rank.get(p.id) as number) : p.order,
  }));
  await writeAllPlatforms(next);
  return next.sort((a, b) => a.order - b.order);
}

export async function getKpis(thresholdDays = 30) {
  const platforms = await readAllPlatforms();
  const total = platforms.length;
  const securityUpdates = platforms.filter((p) => p.urgency === "urgent").length;
  const pendingUpdates = platforms.filter((p) => p.urgency === "watch").length;
  const now = Date.now();
  const newReleases = platforms.filter((p) => {
    const diffDays = (now - new Date(p.latestReleaseDate).getTime()) / 86_400_000;
    return diffDays <= thresholdDays;
  }).length;

  return { total, securityUpdates, pendingUpdates, newReleases };
}

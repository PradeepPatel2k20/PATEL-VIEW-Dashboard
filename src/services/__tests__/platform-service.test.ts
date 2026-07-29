import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Platform } from "@/types/platform";

const mockPlatforms: Platform[] = [
  {
    id: "sitecore",
    productName: "Sitecore",
    vendor: "Sitecore",
    category: "DXP",
    currentVersion: "10.4",
    previousVersion: "10.3",
    latestReleaseDate: "2020-01-01T00:00:00.000Z", // old, so it never counts as "recent"
    securityAdvisoryUrl: "",
    releaseNotesUrl: "",
    statusPageUrl: "",
    documentationUrl: "",
    releaseFrequency: "",
    supportLifecycle: "",
    autoRefreshEnabled: true,
    monitoringEnabled: true,
    priority: "high",
    tags: ["DXP"],
    description: "",
    notes: "",
    enabled: true,
    order: 0,
    urgency: "watch",
    urgencyNote: "",
    createdAt: "",
    updatedAt: "",
  },
  {
    id: "nextjs",
    productName: "Next.js",
    vendor: "Vercel",
    category: "Framework",
    currentVersion: "16.2",
    previousVersion: "15.5",
    latestReleaseDate: new Date().toISOString(), // recent
    securityAdvisoryUrl: "",
    releaseNotesUrl: "",
    statusPageUrl: "",
    documentationUrl: "",
    releaseFrequency: "",
    supportLifecycle: "",
    autoRefreshEnabled: true,
    monitoringEnabled: false,
    priority: "critical",
    tags: ["Framework"],
    description: "",
    notes: "",
    enabled: false, // disabled — should be excluded by enabledOnly filter
    order: 1,
    urgency: "urgent",
    urgencyNote: "",
    createdAt: "",
    updatedAt: "",
  },
  {
    id: "asana",
    productName: "Asana",
    vendor: "Asana Inc.",
    category: "PPM",
    currentVersion: "SaaS",
    previousVersion: "",
    latestReleaseDate: "2020-01-01T00:00:00.000Z",
    securityAdvisoryUrl: "",
    releaseNotesUrl: "",
    statusPageUrl: "",
    documentationUrl: "",
    releaseFrequency: "",
    supportLifecycle: "",
    autoRefreshEnabled: true,
    monitoringEnabled: true,
    priority: "medium",
    tags: ["PPM"],
    description: "",
    notes: "",
    enabled: true,
    order: 2,
    urgency: "continuous",
    urgencyNote: "",
    createdAt: "",
    updatedAt: "",
  },
];

vi.mock("@/repositories/platform-repository", () => ({
  readAllPlatforms: vi.fn(async () => mockPlatforms),
  writeAllPlatforms: vi.fn(async () => {}),
  findPlatformById: vi.fn(async (id: string) => mockPlatforms.find((p) => p.id === id)),
}));

const { listPlatforms, getKpis } = await import("@/services/platform-service");

describe("listPlatforms", () => {
  it("returns all platforms when enabledOnly is false", async () => {
    const result = await listPlatforms({ enabledOnly: false });
    expect(result).toHaveLength(3);
  });

  it("excludes disabled platforms when enabledOnly is true", async () => {
    const result = await listPlatforms({ enabledOnly: true });
    expect(result.map((p) => p.id)).not.toContain("nextjs");
    expect(result).toHaveLength(2);
  });

  it("filters by category", async () => {
    const result = await listPlatforms({ category: "DXP", enabledOnly: false });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("sitecore");
  });

  it("filters by search across name/vendor/category", async () => {
    const result = await listPlatforms({ search: "vercel", enabledOnly: false });
    expect(result.map((p) => p.id)).toEqual(["nextjs"]);
  });

  it("filters by monitoringEnabled", async () => {
    const result = await listPlatforms({ monitoringEnabled: true, enabledOnly: false });
    expect(result.map((p) => p.id).sort()).toEqual(["asana", "sitecore"]);
  });

  it("filters by hasSecurityUpdate (urgent only)", async () => {
    const result = await listPlatforms({ hasSecurityUpdate: true, enabledOnly: false });
    expect(result.map((p) => p.id)).toEqual(["nextjs"]);
  });

  it("sorts by productName ascending", async () => {
    const result = await listPlatforms({ enabledOnly: false }, { field: "productName", direction: "asc" });
    expect(result.map((p) => p.productName)).toEqual(["Asana", "Next.js", "Sitecore"]);
  });

  it("sorts by priority descending (critical first)", async () => {
    const result = await listPlatforms({ enabledOnly: false }, { field: "priority", direction: "desc" });
    expect(result[0].priority).toBe("critical");
  });

  it("defaults to stored `order` when no sort is given", async () => {
    const result = await listPlatforms({ enabledOnly: false });
    expect(result.map((p) => p.id)).toEqual(["sitecore", "nextjs", "asana"]);
  });
});

describe("getKpis", () => {
  it("computes total, security, pending, and new-release counts", async () => {
    const kpis = await getKpis(30);
    expect(kpis.total).toBe(3);
    expect(kpis.securityUpdates).toBe(1); // nextjs is 'urgent'
    expect(kpis.pendingUpdates).toBe(1); // sitecore is 'watch'
    expect(kpis.newReleases).toBe(1); // only nextjs has a recent latestReleaseDate
  });
});

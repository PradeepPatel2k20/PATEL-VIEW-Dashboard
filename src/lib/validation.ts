import { z } from "zod";

export const platformInputSchema = z.object({
  productName: z.string().min(1, "Product name is required").max(120),
  vendor: z.string().min(1, "Vendor is required").max(120),
  category: z.string().min(1, "Category is required").max(60),
  currentVersion: z.string().min(1).max(120),
  previousVersion: z.string().max(120).default(""),
  latestReleaseDate: z.string().min(1, "Release date is required"),
  securityAdvisoryUrl: z.string().max(300).default(""),
  releaseNotesUrl: z.string().max(300).default(""),
  statusPageUrl: z.string().max(300).default(""),
  documentationUrl: z.string().max(300).default(""),
  releaseFrequency: z.string().max(60).default(""),
  supportLifecycle: z.string().max(200).default(""),
  autoRefreshEnabled: z.boolean().default(true),
  monitoringEnabled: z.boolean().default(true),
  priority: z.enum(["low", "medium", "high", "critical"]).default("medium"),
  tags: z.array(z.string()).default([]),
  description: z.string().max(400).default(""),
  notes: z.string().max(1000).default(""),
  enabled: z.boolean().default(true),
  urgency: z.enum(["urgent", "watch", "continuous", "stable"]).default("watch"),
  urgencyNote: z.string().max(300).default(""),
});

export type PlatformInputParsed = z.infer<typeof platformInputSchema>;

export const platformUpdateSchema = platformInputSchema.partial();

export const loginSchema = z.object({
  username: z.string().min(1).max(60),
  password: z.string().min(1).max(200),
});

export const settingsSchema = z.object({
  refreshIntervalMinutes: z.union([
    z.literal(1), z.literal(2), z.literal(5), z.literal(10), z.literal(15), z.literal(30), z.literal(60),
  ]),
  theme: z.enum(["dark", "light"]),
  defaultView: z.enum(["cards", "table"]),
  appName: z.string().min(1).max(80),
  logoUrl: z.string().min(1),
  sessionTimeoutMinutes: z.number().min(5).max(1440),
  defaultCategory: z.string().min(1),
  sidebarDefaultCollapsed: z.boolean(),
  animationsEnabled: z.boolean(),
  dateFormat: z.string().min(1),
  timezone: z.string().min(1),
  tablePageSize: z.number().min(5).max(200),
  newReleaseThresholdDays: z.number().min(1).max(365),
  exportFormats: z.array(z.enum(["csv", "json", "xlsx", "pdf"])),
});

export const bulkIdsSchema = z.object({
  ids: z.array(z.string().min(1)).min(1),
});

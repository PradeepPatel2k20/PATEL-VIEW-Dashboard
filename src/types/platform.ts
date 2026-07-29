export type Urgency = "urgent" | "watch" | "continuous" | "stable";

export interface Platform {
  id: string;
  productName: string;
  vendor: string;
  category: string;
  currentVersion: string;
  previousVersion: string;
  latestReleaseDate: string; // ISO date
  securityAdvisoryUrl: string;
  releaseNotesUrl: string;
  statusPageUrl: string;
  documentationUrl: string;
  releaseFrequency: string;
  supportLifecycle: string;
  autoRefreshEnabled: boolean;
  monitoringEnabled: boolean;
  priority: "low" | "medium" | "high" | "critical";
  tags: string[];
  description: string;
  notes: string;
  enabled: boolean;
  order: number;
  urgency: Urgency;
  urgencyNote: string;
  createdAt: string;
  updatedAt: string;
}

export type PlatformInput = Omit<Platform, "id" | "createdAt" | "updatedAt" | "order">;

export interface PlatformFilters {
  search?: string;
  category?: string;
  vendor?: string;
  priority?: string;
  hasSecurityUpdate?: boolean;
  recentlyUpdated?: boolean;
  monitoringEnabled?: boolean;
  enabledOnly?: boolean;
}

export type SortField = "productName" | "latestReleaseDate" | "category" | "currentVersion" | "priority";
export type SortDirection = "asc" | "desc";

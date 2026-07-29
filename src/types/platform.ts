export type Urgency = "urgent" | "watch" | "continuous" | "stable";

export interface ClosestItem {
  item: string;
  url: string;
  date: string;
  why: string;
}

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
  /** The single release-notes entry closest to today's date, extracted from the
   *  platform's own release-notes page — shown as a clickable headline on the card. */
  closestReleaseNote?: ClosestItem;
  /** Same idea, but from the platform's security-advisory / bulletin page. */
  closestSecurityItem?: ClosestItem;
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

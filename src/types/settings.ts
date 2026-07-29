export interface AppSettings {
  refreshIntervalMinutes: 1 | 2 | 5 | 10 | 15 | 30 | 60;
  theme: "dark" | "light";
  defaultView: "cards" | "table";
  appName: string;
  logoUrl: string;
  sessionTimeoutMinutes: number;
  defaultCategory: string;
  sidebarDefaultCollapsed: boolean;
  animationsEnabled: boolean;
  dateFormat: string;
  timezone: string;
  tablePageSize: number;
  newReleaseThresholdDays: number;
  exportFormats: ("csv" | "json" | "xlsx" | "pdf")[];
}

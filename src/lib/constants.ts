export const URGENCY_META: Record<string, { label: string; className: string }> = {
  urgent: { label: "Urgent", className: "urgent" },
  watch: { label: "Watch", className: "watch" },
  continuous: { label: "Continuous", className: "continuous" },
  stable: { label: "Stable", className: "stable" },
};

export const PRIORITY_META: Record<string, { label: string; className: string }> = {
  critical: { label: "Critical", className: "urgent" },
  high: { label: "High", className: "watch" },
  medium: { label: "Medium", className: "continuous" },
  low: { label: "Low", className: "stable" },
};

export const REFRESH_INTERVAL_OPTIONS = [1, 2, 5, 10, 15, 30, 60] as const;

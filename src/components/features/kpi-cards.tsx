"use client";

import { motion } from "framer-motion";
import { Boxes, ShieldAlert, Clock, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface KpiCardsProps {
  kpis?: { total: number; securityUpdates: number; pendingUpdates: number; newReleases: number };
  isLoading: boolean;
  animationsEnabled: boolean;
}

const items = [
  { key: "total", label: "Platforms tracked", icon: Boxes, color: "text-textPrimary" },
  { key: "securityUpdates", label: "Urgent — security / EOL soon", icon: ShieldAlert, color: "text-danger" },
  { key: "pendingUpdates", label: "Watch — mixed support", icon: Clock, color: "text-warning" },
  { key: "newReleases", label: "New releases (recent)", icon: Sparkles, color: "text-accent" },
] as const;

export function KpiCards({ kpis, isLoading, animationsEnabled }: KpiCardsProps) {
  return (
    <div className="grid grid-cols-2 gap-3.5 md:grid-cols-4">
      {items.map((item, i) => {
        const Icon = item.icon;
        const value = kpis?.[item.key as keyof typeof kpis];
        return (
          <motion.div
            key={item.key}
            initial={animationsEnabled ? { opacity: 0, y: 8 } : false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: i * 0.05 }}
          >
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-[11.5px] text-textMuted">{item.label}</span>
                <Icon className={cn("h-4 w-4", item.color)} />
              </div>
              {isLoading ? (
                <Skeleton className="mt-2 h-7 w-12" />
              ) : (
                <div className={cn("mt-1 font-display text-[26px] font-bold leading-none", item.color)}>
                  {value ?? 0}
                </div>
              )}
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}

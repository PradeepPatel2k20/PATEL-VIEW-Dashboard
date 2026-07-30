"use client";

import Image from "next/image";
import { RefreshCw } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/features/theme-toggle";
import { useTheme } from "@/hooks/use-theme";
import { timeAgo } from "@/lib/utils";

interface DashboardHeaderProps {
  lastRefreshedAt: number;
  onRefresh: () => void;
  isFetching: boolean;
}

export function DashboardHeader({ lastRefreshedAt, onRefresh, isFetching }: DashboardHeaderProps) {
  const [, forceTick] = useState(0);
  const theme = useTheme();
  const isLight = theme === "light";

  // re-render every 20s so "time ago" stays fresh without a full data refetch
  useState(() => {
    const t = setInterval(() => forceTick((n) => n + 1), 20_000);
    return () => clearInterval(t);
  });

  return (
    <header className="sticky top-0 z-20 border-b border-borderSoft bg-bg/85 backdrop-blur-md">
      <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-3.5">
        <div className="flex items-center gap-1">
          <Image
            src={isLight ? "/view-logo-light.png" : "/view-logo.png"}
            alt="Altudo VIEW — Visibility, Insights & Enterprise Watch"
            width={isLight ? 1490 : 1501}
            height={isLight ? 725 : 543}
            className="w-[202px] h-auto object-contain sm:w-[229px] md:w-[260px]"
            priority
          />
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden flex-col items-end gap-0.5 font-mono text-[10.5px] text-textDim sm:flex">
            <span>
              Last refreshed: <span className="text-accent">{timeAgo(new Date(lastRefreshedAt).toISOString())}</span>
            </span>
          </div>

          <ThemeToggle />

          <Button size="sm" onClick={onRefresh} disabled={isFetching}>
            <motion.span
              animate={isFetching ? { rotate: 360 } : { rotate: 0 }}
              transition={isFetching ? { repeat: Infinity, duration: 0.9, ease: "linear" } : {}}
              className="inline-flex"
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </motion.span>
            Refresh
          </Button>
        </div>
      </div>
    </header>
  );
}

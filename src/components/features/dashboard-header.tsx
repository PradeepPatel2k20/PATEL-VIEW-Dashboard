"use client";

import Image from "next/image";
import { RefreshCw, Download, ChevronDown } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/features/theme-toggle";
import { timeAgo } from "@/lib/utils";

interface DashboardHeaderProps {
  lastRefreshedAt: number;
  onRefresh: () => void;
  isFetching: boolean;
}

export function DashboardHeader({ lastRefreshedAt, onRefresh, isFetching }: DashboardHeaderProps) {
  const [, forceTick] = useState(0);

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
            src="/view-logo.png"
            alt="Altudo VIEW — Visibility, Insights & Enterprise Watch"
            width={420}
            height={150}
            className="h-11 w-auto object-contain sm:h-12"
            priority
          />
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden flex-col items-end gap-0.5 font-mono text-[10.5px] text-textDim sm:flex">
            <span>
              Last refreshed: <span className="text-accent">{timeAgo(new Date(lastRefreshedAt).toISOString())}</span>
            </span>
          </div>

          <ExportMenu />
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

function ExportMenu() {
  const formats: { key: string; label: string }[] = [
    { key: "csv", label: "Export as CSV" },
    { key: "json", label: "Export as JSON" },
    { key: "xlsx", label: "Export as Excel" },
    { key: "pdf", label: "Export as PDF (print)" },
  ];

  const handleExport = (key: string) => {
    if (key === "pdf") {
      window.print();
      return;
    }
    window.location.href = `/api/export?format=${key}`;
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="sm" variant="secondary">
          <Download className="h-3.5 w-3.5" />
          Export
          <ChevronDown className="h-3 w-3 opacity-60" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {formats.map((f) => (
          <DropdownMenuItem key={f.key} onSelect={() => handleExport(f.key)}>
            {f.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

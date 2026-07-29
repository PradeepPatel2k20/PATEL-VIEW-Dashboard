import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide",
  {
    variants: {
      variant: {
        urgent: "bg-danger/10 text-danger border border-danger/35",
        watch: "bg-warning/10 text-warning border border-warning/35",
        continuous: "bg-blue/10 text-blue border border-blue/35",
        stable: "bg-success/10 text-success border border-success/35",
        neutral: "bg-surface2 text-textMuted border border-border",
      },
    },
    defaultVariants: { variant: "neutral" },
  }
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };

import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type AccentName = "cyan" | "blue" | "green" | "yellow" | "purple" | "red" | "orange";

const ACCENT_VAR: Record<AccentName, string> = {
  cyan: "var(--accent-cyan)",
  blue: "var(--accent-blue)",
  green: "var(--accent-green)",
  yellow: "var(--accent-yellow)",
  purple: "var(--accent-purple)",
  red: "var(--accent-red)",
  orange: "var(--accent-orange)",
};

export function InternalPage({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("internal-page space-y-5", className)}>{children}</div>;
}

export function SectionPanel({
  title,
  subtitle,
  icon: Icon,
  right,
  children,
  className,
  contentClassName,
}: {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  right?: ReactNode;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
}) {
  return (
    <section className={cn("panel section-panel overflow-hidden", className)}>
      <div className="section-panel__header">
        <div className="flex min-w-0 items-center gap-3">
          {Icon && (
            <span className="section-panel__icon">
              <Icon className="h-4 w-4" />
            </span>
          )}
          <div className="min-w-0">
            <h2 className="truncate text-sm font-semibold text-foreground">{title}</h2>
            {subtitle && <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>}
          </div>
        </div>
        {right && <div className="shrink-0">{right}</div>}
      </div>
      <div className={cn("p-4", contentClassName)}>{children}</div>
    </section>
  );
}

export function StatCard({
  label,
  value,
  unit,
  detail,
  icon: Icon,
  accent = "cyan",
  className,
}: {
  label: string;
  value: string | number;
  unit?: string;
  detail?: string;
  icon?: LucideIcon;
  accent?: AccentName;
  className?: string;
}) {
  const color = ACCENT_VAR[accent];
  return (
    <div className={cn("panel summary-card", className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
            {label}
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="metric-value text-2xl text-foreground">{value}</span>
            {unit && <span className="text-xs text-muted-foreground">{unit}</span>}
          </div>
          {detail && <p className="mt-1.5 text-[11px] text-muted-foreground">{detail}</p>}
        </div>
        {Icon && (
          <span
            className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border"
            style={{
              color,
              borderColor: `color-mix(in oklab, ${color} 28%, transparent)`,
              background: `color-mix(in oklab, ${color} 10%, transparent)`,
            }}
          >
            <Icon className="h-4 w-4" />
          </span>
        )}
      </div>
    </div>
  );
}

export function FilterBar({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("panel page-toolbar p-3", className)}>{children}</div>;
}

export function StatusPill({
  label,
  tone = "neutral",
}: {
  label: string;
  tone?: "positive" | "warning" | "danger" | "info" | "neutral";
}) {
  const classByTone = {
    positive:
      "border-[var(--accent-green)]/25 bg-[var(--accent-green)]/10 text-[var(--accent-green)]",
    warning:
      "border-[var(--accent-yellow)]/25 bg-[var(--accent-yellow)]/10 text-[var(--accent-yellow)]",
    danger: "border-[var(--accent-red)]/25 bg-[var(--accent-red)]/10 text-[var(--accent-red)]",
    info: "border-[var(--accent-cyan)]/25 bg-[var(--accent-cyan)]/10 text-[var(--accent-cyan)]",
    neutral: "border-border/60 bg-muted/30 text-muted-foreground",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-1 text-[10px] font-medium",
        classByTone[tone],
      )}
    >
      {label}
    </span>
  );
}

export const chartTooltipStyle = {
  background: "oklch(0.19 0.034 260 / 98%)",
  border: "1px solid oklch(0.37 0.04 250 / 72%)",
  borderRadius: 10,
  boxShadow: "0 16px 42px -24px rgba(0,0,0,.9)",
  fontSize: 12,
};

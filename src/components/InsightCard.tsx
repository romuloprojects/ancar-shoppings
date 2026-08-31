import { Link } from "@tanstack/react-router";
import type { CSSProperties } from "react";
import {
  AlertTriangle,
  ChevronRight,
  Settings2,
  TrendingDown,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";
import type { Insight } from "@/types";

interface InsightTheme {
  label: string;
  icon: LucideIcon;
  color: string;
  destination: "/alertas" | "/analises" | "/ranking";
}

const insightThemes: Record<Insight["icon"], InsightTheme> = {
  warning: {
    label: "Alerta",
    icon: AlertTriangle,
    color: "var(--accent-yellow)",
    destination: "/alertas",
  },
  settings: {
    label: "Oportunidade",
    icon: Settings2,
    color: "var(--accent-orange)",
    destination: "/analises",
  },
  trend: {
    label: "Destaque",
    icon: TrendingUp,
    color: "var(--accent-green)",
    destination: "/ranking",
  },
  "trending-down": {
    label: "Economia",
    icon: TrendingDown,
    color: "var(--accent-blue)",
    destination: "/analises",
  },
};

export function InsightCard({ insight }: { insight: Insight }) {
  const theme = insightThemes[insight.icon];
  const Icon = theme.icon;

  return (
    <Link
      to={theme.destination}
      aria-label={`${theme.label}: ${insight.title}`}
      className="group relative flex min-h-[76px] items-center gap-3 overflow-hidden rounded-xl border border-border/45 bg-[linear-gradient(110deg,color-mix(in_oklab,var(--card)_94%,transparent),color-mix(in_oklab,var(--background)_80%,transparent))] px-3 py-2.5 transition-all duration-200 hover:-translate-y-px hover:border-[color-mix(in_oklab,var(--insight-color)_42%,transparent)] hover:shadow-[0_12px_28px_-22px_color-mix(in_oklab,var(--insight-color)_70%,transparent)]"
      style={{ "--insight-color": theme.color } as CSSProperties}
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-2 left-0 w-px rounded-full opacity-80"
        style={{
          background: theme.color,
          boxShadow: `0 0 14px ${theme.color}`,
        }}
      />

      <div
        className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border"
        style={{
          color: theme.color,
          borderColor: `color-mix(in oklab, ${theme.color} 32%, transparent)`,
          background: `radial-gradient(circle at 35% 28%, color-mix(in oklab, ${theme.color} 24%, transparent), color-mix(in oklab, var(--card) 94%, transparent) 72%)`,
          boxShadow: `inset 0 1px 0 oklch(1 0 0 / 7%), 0 0 20px -12px ${theme.color}`,
        }}
      >
        <Icon className="h-[17px] w-[17px]" strokeWidth={1.9} />
      </div>

      <div className="min-w-0 flex-1">
        <div className="mb-0.5 flex items-center gap-2">
          <span
            className="text-[9px] font-semibold uppercase tracking-[0.12em]"
            style={{ color: theme.color }}
          >
            {theme.label}
          </span>
        </div>
        <div className="line-clamp-2 text-[11px] font-semibold leading-[1.25] text-foreground/95">
          {insight.title}
        </div>
        <div className="mt-0.5 line-clamp-1 text-[10px] leading-tight text-muted-foreground">
          {insight.subtitle}
        </div>
        {insight.detail && (
          <div
            className="mt-1 line-clamp-1 text-[10px] font-medium leading-tight"
            style={{ color: theme.color }}
          >
            {insight.detail}
          </div>
        )}
      </div>

      <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/70 transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-foreground" />
    </Link>
  );
}

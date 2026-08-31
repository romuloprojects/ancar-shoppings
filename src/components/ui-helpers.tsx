import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Inbox } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export function PageHeader({
  title,
  subtitle,
  right,
  eyebrow,
  icon: Icon,
}: {
  title: string;
  subtitle?: string;
  right?: ReactNode;
  eyebrow?: string;
  icon?: LucideIcon;
}) {
  return (
    <header className="page-heading">
      <div className="flex min-w-0 items-start gap-3.5">
        {Icon && (
          <span className="page-heading__icon">
            <Icon className="h-5 w-5" />
          </span>
        )}
        <div className="min-w-0">
          {eyebrow && (
            <div className="mb-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--accent-cyan)]/80">
              {eyebrow}
            </div>
          )}
          <h1 className="text-2xl font-semibold tracking-tight text-foreground md:text-[1.75rem]">
            {title}
          </h1>
          {subtitle && <p className="mt-1.5 max-w-3xl text-sm text-muted-foreground">{subtitle}</p>}
        </div>
      </div>
      {right && <div className="flex shrink-0 items-center gap-2">{right}</div>}
    </header>
  );
}

export function LoadingBlock({ h = 240 }: { h?: number }) {
  return (
    <div className="panel overflow-hidden p-4">
      <Skeleton className="w-full rounded-xl" style={{ height: h }} />
    </div>
  );
}

export function LoadingCards({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="panel p-4">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="mt-4 h-8 w-32" />
          <Skeleton className="mt-4 h-3 w-full" />
        </div>
      ))}
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
  icon: Icon = Inbox,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  icon?: LucideIcon;
}) {
  return (
    <div className="panel empty-state">
      <span className="empty-state__icon">
        <Icon className="h-5 w-5" />
      </span>
      <div className="mt-3 text-sm font-medium">{title}</div>
      {description && (
        <div className="mt-1 max-w-md text-xs text-muted-foreground">{description}</div>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

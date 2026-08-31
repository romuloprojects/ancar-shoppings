import type { ShoppingStatus } from "@/types";
import { statusLabel } from "@/utils/format";
import { cn } from "@/lib/utils";

const dotClass: Record<ShoppingStatus, string> = {
  otimo: "bg-[var(--accent-green)]",
  bom: "bg-[var(--accent-cyan)]",
  atencao: "bg-[var(--accent-yellow)]",
  critico: "bg-[var(--accent-red)]",
  offline: "bg-muted-foreground",
};

const badgeClass: Record<ShoppingStatus, string> = {
  otimo: "bg-[var(--accent-green)]/15 text-[var(--accent-green)] border-[var(--accent-green)]/30",
  bom: "bg-[var(--accent-cyan)]/15 text-[var(--accent-cyan)] border-[var(--accent-cyan)]/30",
  atencao:
    "bg-[var(--accent-yellow)]/15 text-[var(--accent-yellow)] border-[var(--accent-yellow)]/30",
  critico: "bg-[var(--accent-red)]/15 text-[var(--accent-red)] border-[var(--accent-red)]/30",
  offline: "bg-muted/40 text-muted-foreground border-border",
};

export function StatusDot({ status, className }: { status: ShoppingStatus; className?: string }) {
  return <span className={cn("inline-block h-2 w-2 rounded-full", dotClass[status], className)} />;
}

export function StatusBadge({ status }: { status: ShoppingStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[11px] font-medium",
        badgeClass[status],
      )}
    >
      <StatusDot status={status} /> {statusLabel(status)}
    </span>
  );
}

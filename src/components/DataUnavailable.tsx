import { Info } from "lucide-react";
import { cn } from "@/lib/utils";

export function DataUnavailable({
  label = "Dado não disponível",
  className,
}: {
  label?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border border-dashed border-border/60 bg-muted/20 px-2 py-1 text-xs text-muted-foreground",
        className,
      )}
    >
      <Info className="h-3 w-3" /> {label}
    </div>
  );
}

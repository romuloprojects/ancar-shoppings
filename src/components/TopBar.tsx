import { RefreshCw } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useDashboardRuntime } from "@/contexts/dashboard-runtime-context";
import { formatRelative } from "@/utils/format";

export function TopBar() {
  const { lastUpdate, refreshNow, refreshIntervalMs } = useDashboardRuntime();
  const intervalMinutes = Math.round(refreshIntervalMs / 60_000);

  return (
    <header className="sticky top-0 z-30 border-b border-border/55 bg-[color-mix(in_oklab,var(--background)_92%,transparent)] backdrop-blur-xl">
      <div className="flex h-16 min-w-0 items-center gap-3 px-3 sm:px-4 lg:px-5">
        <SidebarTrigger className="h-9 w-9 shrink-0 text-muted-foreground hover:text-foreground md:hidden" />

        <Link
          to="/"
          aria-label="Página inicial"
          className="hidden h-10 w-[132px] shrink-0 items-center border-r border-border/45 pr-4 lg:flex"
        >
          <img
            src="/images/logo-ancar-white.png"
            alt="Ancar"
            className="h-[30px] w-auto object-contain opacity-95"
          />
        </Link>

        <div className="min-w-0 flex-1">
          <div className="text-sm font-semibold text-foreground">Monitoramento CAG</div>
          <div className="mt-0.5 text-[11px] text-muted-foreground">
            Atualização automática a cada {intervalMinutes} minutos
          </div>
        </div>

        <div className="hidden items-center gap-2 whitespace-nowrap text-[11px] text-muted-foreground sm:flex">
          <span className="inline-flex h-2 w-2 rounded-full bg-[var(--accent-green)]" />
          Atualizado {formatRelative(lastUpdate.toISOString())}
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={refreshNow}
          className="h-9 gap-2 border-border/55 bg-card/55 text-xs"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Atualizar</span>
        </Button>
      </div>
    </header>
  );
}

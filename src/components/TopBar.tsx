import { Calendar, ChevronDown, GitCompareArrows, Search } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { dashboardService } from "@/services/dashboardService";
import type { Shopping } from "@/types";
import { useDashboardRuntime } from "@/contexts/dashboard-runtime-context";
import { formatRelative } from "@/utils/format";

const controlClass =
  "h-9 shrink-0 gap-2 rounded-lg border-border/55 bg-[color-mix(in_oklab,var(--card)_76%,transparent)] px-3 text-[12px] font-medium text-foreground/90 shadow-none hover:bg-accent/55 hover:text-foreground";

export function TopBar() {
  const { lastUpdate } = useDashboardRuntime();
  const [shoppings, setShoppings] = useState<Shopping[]>([]);

  useEffect(() => {
    let alive = true;
    dashboardService.getShoppings().then((items) => {
      if (alive) setShoppings(items);
    });
    return () => {
      alive = false;
    };
  }, []);

  return (
    <header className="sticky top-0 z-30 border-b border-border/55 bg-[color-mix(in_oklab,var(--background)_92%,transparent)] backdrop-blur-xl">
      <div className="flex h-16 min-w-0 items-center gap-3 px-3 sm:px-4 lg:px-5">
        <SidebarTrigger className="h-9 w-9 shrink-0 text-muted-foreground hover:text-foreground md:hidden" />

        <Link
          to="/"
          aria-label="Página inicial"
          className="hidden h-10 w-[112px] shrink-0 items-center border-r border-border/45 pr-4 lg:flex"
        >
          <img
            src="/images/logo-ancar-white.png"
            alt=""
            className="h-[30px] w-auto object-contain opacity-95 transition-opacity hover:opacity-100"
          />
        </Link>

        <div className="relative min-w-[180px] flex-1 md:max-w-[620px]">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            aria-label="Buscar shopping ou métrica"
            placeholder="Buscar shopping ou métrica..."
            className="h-10 rounded-xl border-border/55 bg-[color-mix(in_oklab,var(--card)_72%,transparent)] pl-10 pr-4 text-sm shadow-none placeholder:text-muted-foreground/75 focus-visible:border-primary/45 focus-visible:ring-primary/20"
          />
        </div>

        <div className="hidden min-w-0 items-center gap-2 xl:flex">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className={`${controlClass} min-w-[166px] justify-between`}
              >
                <span>Todos os Shoppings</span>
                <ChevronDown className="h-3.5 w-3.5 opacity-60" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="max-h-80 w-72 overflow-y-auto" align="start">
              <DropdownMenuLabel>Selecionar shopping</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Todos os Shoppings</DropdownMenuItem>
              {shoppings.map((shopping) => (
                <DropdownMenuItem key={shopping.id}>
                  <span className="mr-2 rounded bg-muted px-1.5 py-0.5 text-[10px] font-semibold">
                    {shopping.code}
                  </span>
                  {shopping.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className={controlClass}>
                <Calendar className="h-3.5 w-3.5 opacity-70" />
                Hoje
                <ChevronDown className="h-3.5 w-3.5 opacity-60" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              {[
                "Hoje",
                "Ontem",
                "Últimos 7 dias",
                "Últimos 30 dias",
                "Este mês",
                "Personalizado",
              ].map((period) => (
                <DropdownMenuItem key={period}>{period}</DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="outline" size="sm" className={controlClass}>
            <GitCompareArrows className="h-3.5 w-3.5 opacity-70" />
            Comparar
            <ChevronDown className="h-3.5 w-3.5 opacity-60" />
          </Button>

          <div className="flex items-center gap-2 whitespace-nowrap px-1 text-[11px] text-muted-foreground">
            <span className="inline-flex h-2 w-2 rounded-full bg-[var(--accent-cyan)]" />
            Atualizado {formatRelative(lastUpdate.toISOString())}
          </div>
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-3 lg:gap-4">
          <div className="hidden items-center gap-2 border-r border-border/55 pr-4 lg:flex">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--accent-green)] opacity-55" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--accent-green)]" />
            </span>
            <span className="text-xs text-muted-foreground">Sistema Operacional</span>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 rounded-xl px-1.5 py-1 outline-none transition-colors hover:bg-muted/45 focus-visible:ring-1 focus-visible:ring-ring">
                <Avatar className="h-9 w-9 border border-border/70 shadow-sm">
                  <AvatarFallback className="bg-gradient-to-br from-[color-mix(in_oklab,var(--accent-blue)_45%,var(--card))] to-[color-mix(in_oklab,var(--accent-purple)_35%,var(--card))] text-xs font-semibold text-foreground">
                    AG
                  </AvatarFallback>
                </Avatar>
                <div className="hidden min-w-[82px] text-left leading-tight 2xl:block">
                  <div className="text-xs font-medium text-foreground">Alex G.</div>
                  <div className="mt-0.5 text-[10px] text-muted-foreground">Administrador</div>
                </div>
                <ChevronDown className="hidden h-3.5 w-3.5 text-muted-foreground 2xl:block" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Minha conta</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Perfil</DropdownMenuItem>
              <DropdownMenuItem>Preferências</DropdownMenuItem>
              <DropdownMenuItem>Sair</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}

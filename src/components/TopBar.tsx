import {
  Calendar,
  ChevronDown,
  GitCompareArrows,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { getPortfolioSystemStatus, liveDashboardService, mapLiveShoppingToLegacy } from "@/services/liveDashboardService";
import type { Shopping } from "@/types";
import type { AnalysisMetric, HistoryPeriod } from "@/types/live";
import { useDashboardRuntime } from "@/contexts/dashboard-runtime-context";
import { useAuth } from "@/auth/AuthContext";
import { ThemeToggle } from "@/components/ThemeToggle";

const controlClass =
  "h-9 shrink-0 gap-2 rounded-xl border-border/55 bg-[color-mix(in_oklab,var(--card)_76%,transparent)] px-3 text-[11px] font-medium text-foreground/90 shadow-none hover:bg-accent/55 hover:text-foreground";

const periodLabels: Record<HistoryPeriod, string> = {
  "24h": "Últimas 24 horas",
  "7d": "Últimos 7 dias",
  "30d": "Últimos 30 dias",
};

const comparisonMetrics: Record<AnalysisMetric, string> = {
  kwCag: "Potência CAG",
  energyKwh: "Energia elétrica",
  trTotal: "Produção térmica",
  kwTr: "Eficiência Energética (kW/TR)",
  kwAux: "Periféricos",
  temperatureC: "Temperatura externa",
  dataQualityPct: "Qualidade dos dados",
};

export function TopBar() {
  const navigate = useNavigate();
  const { session, logout } = useAuth();
  const {
    tick,
    selectedShoppingCode,
    setSelectedShoppingCode,
    historyPeriod,
    setHistoryPeriod,
    comparisonShoppingCodes,
    setComparisonShoppingCodes,
    comparisonMetric,
    setComparisonMetric,
  } = useDashboardRuntime();
  const [shoppings, setShoppings] = useState<Shopping[]>([]);
  const [systemStatus, setSystemStatus] = useState<{ kind: "checking" | "operational" | "attention" | "degraded" | "api-error"; label: string }>({ kind: "checking", label: "Verificando sistema" });
  const [mobileOpen, setMobileOpen] = useState(false);
  const [compareOpen, setCompareOpen] = useState(false);
  const [draftComparison, setDraftComparison] = useState<string[]>([]);
  const [draftMetric, setDraftMetric] = useState<AnalysisMetric>(comparisonMetric);

  useEffect(() => {
    let alive = true;
    liveDashboardService
      .getPortfolio()
      .then((portfolio) => {
        if (!alive) return;
        const sortedItems = portfolio.shoppings
          .map(mapLiveShoppingToLegacy)
          .sort((a, b) => a.code.localeCompare(b.code, "pt-BR"));
        setShoppings(sortedItems);
        const acquisition = getPortfolioSystemStatus(portfolio.shoppings);
        setSystemStatus({ kind: acquisition.kind, label: acquisition.label });
        if (sortedItems.length && !sortedItems.some((shopping) => shopping.code === selectedShoppingCode)) {
          setSelectedShoppingCode(sortedItems[0].code);
        }
      })
      .catch(() => {
        if (!alive) return;
        // Valores já carregados permanecem na tela, mas o status deve refletir a indisponibilidade da API.
        setSystemStatus({ kind: "api-error", label: "API indisponível" });
      });
    return () => {
      alive = false;
    };
  }, [tick, selectedShoppingCode, setSelectedShoppingCode]);

  const selectedShopping = useMemo(
    () => shoppings.find((shopping) => shopping.code === selectedShoppingCode) ?? null,
    [shoppings, selectedShoppingCode],
  );

  const openCompare = () => {
    const availableCodes = new Set(shoppings.map((shopping) => shopping.code));
    const persisted = comparisonShoppingCodes.filter((code) => availableCodes.has(code));
    const base = selectedShoppingCode && availableCodes.has(selectedShoppingCode) ? selectedShoppingCode : "";
    const initial = Array.from(new Set([base, ...persisted].filter(Boolean)));
    setDraftComparison(initial);
    setDraftMetric(comparisonMetric);
    setMobileOpen(false);
    setCompareOpen(true);
  };

  const toggleComparison = (code: string) => {
    setDraftComparison((current) =>
      current.includes(code) ? current.filter((item) => item !== code) : [...current, code],
    );
  };

  const confirmComparison = () => {
    if (draftComparison.length < 2) return;
    setComparisonShoppingCodes(draftComparison);
    setComparisonMetric(draftMetric);
    setCompareOpen(false);
    navigate({ to: "/analises" });
  };

  const systemTone = systemStatus.kind === "operational"
    ? "var(--accent-green)"
    : systemStatus.kind === "attention" || systemStatus.kind === "checking"
      ? "var(--accent-yellow)"
      : "var(--accent-red)";

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-border/55 bg-[color-mix(in_oklab,var(--background)_92%,transparent)] backdrop-blur-xl">
        <div className="topbar-inner flex h-16 min-w-0 items-center gap-2 px-3 sm:gap-2.5 sm:px-3.5 lg:px-4">
          <SidebarTrigger className="h-9 w-9 shrink-0 text-muted-foreground hover:text-foreground md:hidden" />

          <Link
            to="/"
            aria-label="Página inicial"
            className="hidden h-10 w-[112px] shrink-0 items-center border-r border-border/45 pr-4 lg:flex"
          >
            <img
              src="/images/logo-ancar-white.png"
              alt="ancar"
              className="hidden h-[30px] w-auto object-contain opacity-95 transition-opacity hover:opacity-100 dark:block"
            />
            <img
              src="/images/logo-ancar-v56.png"
              alt="ancar"
              className="h-[28px] w-auto object-contain opacity-95 transition-opacity hover:opacity-100 dark:hidden"
            />
          </Link>

          <div className="relative hidden min-w-0 flex-1 2xl:block 2xl:max-w-[520px]">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              aria-label="Buscar shopping ou métrica"
              placeholder="Buscar shopping ou métrica..."
              className="h-10 rounded-xl border-border/55 bg-[color-mix(in_oklab,var(--card)_72%,transparent)] pl-10 pr-4 text-sm shadow-none placeholder:text-muted-foreground/75 focus-visible:border-primary/45 focus-visible:ring-primary/20"
            />
          </div>

          <div className="topbar-controls hidden min-w-0 items-center gap-2 lg:flex">
            <ShoppingDropdown
              shoppings={shoppings}
              selectedShopping={selectedShopping}
              selectedShoppingCode={selectedShoppingCode}
              onSelect={setSelectedShoppingCode}
            />
            <PeriodDropdown value={historyPeriod} onSelect={setHistoryPeriod} />
            <Button variant="outline" size="sm" className={controlClass} onClick={openCompare}>
              <GitCompareArrows className="h-3.5 w-3.5 opacity-70" />
              Comparar
            </Button>
            <div className="whitespace-nowrap px-1 text-[11px] text-muted-foreground">
              {formatLastTelemetryUpdate(selectedShopping?.lastUpdate)}
            </div>
          </div>

          <div className="topbar-partner ml-auto hidden shrink-0 items-center xl:flex" title="Tecnologia 2SEE">
            <div className="topbar-partner-plate flex h-9 items-center rounded-xl border border-border/60 bg-white px-2.5 shadow-sm">
              <img src="/images/logo-2see-header.svg" alt="2SEE hub de monitoramento" className="h-[25px] w-auto max-w-[128px] object-contain" />
            </div>
          </div>

          <div className="topbar-status flex shrink-0 items-center gap-2 lg:gap-3">
            <ThemeToggle />
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9 border-border/55 bg-card/55 lg:hidden"
                  aria-label="Controles do dashboard"
                >
                  <SlidersHorizontal className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[min(92vw,380px)] overflow-y-auto">
                <SheetHeader>
                  <SheetTitle>Controles do dashboard</SheetTitle>
                </SheetHeader>
                <div className="mt-5 flex justify-center xl:hidden">
                  <div className="flex h-10 items-center rounded-xl border border-border/60 bg-white px-3 shadow-sm">
                    <img src="/images/logo-2see-header.svg" alt="2SEE hub de monitoramento" className="h-[27px] w-auto max-w-[138px] object-contain" />
                  </div>
                </div>
                <div className="mt-6 space-y-5">
                  <label className="block text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
                    Shopping
                    <select
                      value={selectedShoppingCode}
                      onChange={(event) => setSelectedShoppingCode(event.target.value)}
                      className="mt-1.5 h-10 w-full rounded-lg border border-border/60 bg-background/55 px-3 text-sm font-normal normal-case tracking-normal text-foreground"
                    >
                      {shoppings.map((shopping) => (
                        <option key={shopping.id} value={shopping.code}>
                          {shopping.code} · {shopping.name}
                        </option>
                      ))}
                    </select>
                  </label>

                  <div>
                    <div className="mb-1.5 text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
                      Período
                    </div>
                    <div className="segmented-control w-full">
                      {(Object.entries(periodLabels) as [HistoryPeriod, string][]).map(([value, label]) => (
                        <button
                          type="button"
                          key={value}
                          data-active={historyPeriod === value}
                          onClick={() => setHistoryPeriod(value)}
                          className="min-w-0 flex-1"
                        >
                          {value === "24h" ? "24h" : value}
                        </button>
                      ))}
                    </div>
                  </div>

                  <Button variant="outline" className="w-full justify-center" onClick={openCompare}>
                    <GitCompareArrows className="mr-2 h-4 w-4" />
                    Comparar shoppings
                  </Button>

                  <div className="rounded-lg border border-border/55 bg-muted/15 px-3 py-2 text-xs text-muted-foreground">
                    {formatLastTelemetryUpdate(selectedShopping?.lastUpdate)}
                  </div>
                </div>
              </SheetContent>
            </Sheet>

            <div className="hidden items-center gap-2 border-r border-border/55 pr-4 lg:flex" title={systemStatus.label}>
              <span className="relative flex h-2 w-2">
                {systemStatus.kind === "operational" && (
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-45" style={{ backgroundColor: systemTone }} />
                )}
                <span className="relative inline-flex h-2 w-2 rounded-full" style={{ backgroundColor: systemTone }} />
              </span>
              <span className="text-xs text-muted-foreground">{systemStatus.label}</span>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 rounded-xl px-1.5 py-1 outline-none transition-colors hover:bg-muted/45 focus-visible:ring-1 focus-visible:ring-ring">
                  <Avatar className="h-9 w-9 border border-border/70 shadow-sm">
                    <AvatarFallback className="bg-gradient-to-br from-[color-mix(in_oklab,var(--accent-blue)_45%,var(--card))] to-[color-mix(in_oklab,var(--accent-purple)_35%,var(--card))] text-xs font-semibold text-foreground">
                      {(session?.user?.displayName || session?.user?.username || "AN").split(/\s+/).slice(0,2).map(v=>v[0]).join("").toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden min-w-[82px] text-left leading-tight 2xl:block">
                    <div className="max-w-[120px] truncate text-xs font-medium text-foreground">{session?.user?.displayName || session?.user?.username || "ANCAR"}</div>
                    <div className="mt-0.5 text-[10px] text-muted-foreground">{session?.user?.role === "ADMIN" ? "Administrador" : "Visualização"}</div>
                  </div>
                  <ChevronDown className="hidden h-3.5 w-3.5 text-muted-foreground 2xl:block" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel><div className="text-xs">{session?.user?.displayName || session?.user?.username}</div><div className="mt-0.5 text-[10px] font-normal text-muted-foreground">{session?.user?.username}</div></DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={() => navigate({ to: "/alterar-senha" })}>Alterar senha</DropdownMenuItem>
                <DropdownMenuItem onSelect={async () => { await logout(); await navigate({ to: "/login", replace: true }); }}>Sair</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <Dialog open={compareOpen} onOpenChange={setCompareOpen}>
        <DialogContent className="max-h-[88svh] w-[calc(100vw-2rem)] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Comparar shoppings</DialogTitle>
            <DialogDescription>
              Selecione pelo menos duas unidades. A comparação abrirá em Análises usando o período atual.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-5 py-2 md:grid-cols-[220px_1fr]">
            <label className="block text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
              Métrica
              <select
                value={draftMetric}
                onChange={(event) => setDraftMetric(event.target.value as AnalysisMetric)}
                className="mt-1.5 h-10 w-full rounded-lg border border-border/60 bg-background/55 px-3 text-sm font-normal normal-case tracking-normal text-foreground"
              >
                {Object.entries(comparisonMetrics).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </label>

            <div>
              <div className="mb-1.5 flex items-center justify-between gap-3 text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
                <span>Unidades</span>
                <span>{draftComparison.length} selecionadas</span>
              </div>
              <div className="grid max-h-64 gap-2 overflow-y-auto rounded-xl border border-border/55 bg-muted/10 p-2 sm:grid-cols-2">
                {shoppings.map((shopping) => (
                  <label
                    key={shopping.id}
                    className="flex cursor-pointer items-center gap-2 rounded-lg border border-border/45 bg-background/35 px-3 py-2.5 text-xs transition hover:border-primary/35"
                  >
                    <input
                      type="checkbox"
                      checked={draftComparison.includes(shopping.code)}
                      onChange={() => toggleComparison(shopping.code)}
                    />
                    <span className="min-w-0">
                      <span className="font-semibold">{shopping.code}</span>
                      <span className="ml-1 text-muted-foreground">· {shopping.name}</span>
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-border/55 bg-muted/15 px-3 py-2 text-xs text-muted-foreground">
            Período: {periodLabels[historyPeriod]}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCompareOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={confirmComparison} disabled={draftComparison.length < 2}>
              <GitCompareArrows className="mr-2 h-4 w-4" />
              Comparar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function formatLastTelemetryUpdate(value?: string | null) {
  if (!value) return "🟢 Última atualização —";
  const date = new Date(value);
  if (Number.isNaN(date.getTime()) || date.getTime() <= 0) return "🟢 Última atualização —";
  const now = new Date();
  const sameDay = date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth() && date.getDate() === now.getDate();
  const formatted = new Intl.DateTimeFormat("pt-BR", sameDay
    ? { hour: "2-digit", minute: "2-digit" }
    : { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }
  ).format(date);
  return `🟢 Última atualização ${formatted}`;
}

function ShoppingDropdown({
  shoppings,
  selectedShopping,
  selectedShoppingCode,
  onSelect,
}: {
  shoppings: Shopping[];
  selectedShopping: Shopping | null;
  selectedShoppingCode: string;
  onSelect: (code: string) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={`${controlClass} min-w-[156px] max-w-[220px] justify-between xl:min-w-[176px]`}
        >
          <span className="truncate">
            {selectedShopping
              ? `${selectedShopping.code} · ${selectedShopping.name}`
              : selectedShoppingCode || "Carregando..."}
          </span>
          <ChevronDown className="h-3.5 w-3.5 opacity-60" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="max-h-80 w-72 overflow-y-auto" align="start">
        <DropdownMenuLabel>Selecionar shopping</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {shoppings.map((shopping) => (
          <DropdownMenuItem key={shopping.id} onSelect={() => onSelect(shopping.code)}>
            <span className="mr-2 rounded bg-muted px-1.5 py-0.5 text-[10px] font-semibold">
              {shopping.code}
            </span>
            {shopping.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function PeriodDropdown({ value, onSelect }: { value: HistoryPeriod; onSelect: (value: HistoryPeriod) => void }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className={controlClass}>
          <Calendar className="h-3.5 w-3.5 opacity-70" />
          {periodLabels[value]}
          <ChevronDown className="h-3.5 w-3.5 opacity-60" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        {(Object.entries(periodLabels) as [HistoryPeriod, string][]).map(([period, label]) => (
          <DropdownMenuItem key={period} onSelect={() => onSelect(period)}>
            {label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

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
import { liveDashboardService } from "@/services/liveDashboardService";
import type { Shopping } from "@/types";
import type { AnalysisMetric, HistoryPeriod } from "@/types/live";
import { useDashboardRuntime } from "@/contexts/dashboard-runtime-context";
import { formatRelative } from "@/utils/format";

const controlClass =
  "h-9 shrink-0 gap-2 rounded-lg border-border/55 bg-[color-mix(in_oklab,var(--card)_76%,transparent)] px-3 text-[12px] font-medium text-foreground/90 shadow-none hover:bg-accent/55 hover:text-foreground";

const periodLabels: Record<HistoryPeriod, string> = {
  "24h": "Últimas 24 horas",
  "7d": "Últimos 7 dias",
  "30d": "Últimos 30 dias",
};

const comparisonMetrics: Record<AnalysisMetric, string> = {
  kwCag: "Potência CAG",
  energyKwh: "Energia elétrica",
  trTotal: "Produção térmica",
  kwTr: "Intensidade elétrica (kW/TR)",
  kwAux: "Periféricos",
  temperatureC: "Temperatura externa",
  dataQualityPct: "Qualidade dos dados",
};

export function TopBar() {
  const navigate = useNavigate();
  const {
    tick,
    lastUpdate,
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
  const [mobileOpen, setMobileOpen] = useState(false);
  const [compareOpen, setCompareOpen] = useState(false);
  const [draftComparison, setDraftComparison] = useState<string[]>([]);
  const [draftMetric, setDraftMetric] = useState<AnalysisMetric>(comparisonMetric);

  useEffect(() => {
    let alive = true;
    liveDashboardService
      .getShoppings()
      .then((items) => {
        if (!alive) return;
        setShoppings(items);
        if (items.length && !items.some((shopping) => shopping.code === selectedShoppingCode)) {
          setSelectedShoppingCode(items[0].code);
        }
      })
      .catch(() => {
        if (alive) setShoppings([]);
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

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-border/55 bg-[color-mix(in_oklab,var(--background)_92%,transparent)] backdrop-blur-xl">
        <div className="flex h-16 min-w-0 items-center gap-2 px-3 sm:gap-3 sm:px-4 lg:px-5">
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

          <div className="relative hidden min-w-0 flex-1 sm:block md:max-w-[520px] 2xl:max-w-[620px]">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              aria-label="Buscar shopping ou métrica"
              placeholder="Buscar shopping ou métrica..."
              className="h-10 rounded-xl border-border/55 bg-[color-mix(in_oklab,var(--card)_72%,transparent)] pl-10 pr-4 text-sm shadow-none placeholder:text-muted-foreground/75 focus-visible:border-primary/45 focus-visible:ring-primary/20"
            />
          </div>

          <div className="hidden min-w-0 items-center gap-2 xl:flex">
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
            <div className="flex items-center gap-2 whitespace-nowrap px-1 text-[11px] text-muted-foreground">
              <span className="inline-flex h-2 w-2 rounded-full bg-[var(--accent-cyan)]" />
              Atualizado {formatRelative(lastUpdate.toISOString())}
            </div>
          </div>

          <div className="ml-auto flex shrink-0 items-center gap-2 lg:gap-4">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9 border-border/55 bg-card/55 xl:hidden"
                  aria-label="Controles do dashboard"
                >
                  <SlidersHorizontal className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[min(92vw,380px)] overflow-y-auto">
                <SheetHeader>
                  <SheetTitle>Controles do dashboard</SheetTitle>
                </SheetHeader>
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
                    Atualizado {formatRelative(lastUpdate.toISOString())}
                  </div>
                </div>
              </SheetContent>
            </Sheet>

            <div className="hidden items-center gap-2 border-r border-border/55 pr-4 lg:flex">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--accent-green)] opacity-55" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--accent-green)]" />
              </span>
              <span className="text-xs text-muted-foreground">
                {shoppings.length ? "Sistema Operacional" : "API indisponível"}
              </span>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 rounded-xl px-1.5 py-1 outline-none transition-colors hover:bg-muted/45 focus-visible:ring-1 focus-visible:ring-ring">
                  <Avatar className="h-9 w-9 border border-border/70 shadow-sm">
                    <AvatarFallback className="bg-gradient-to-br from-[color-mix(in_oklab,var(--accent-blue)_45%,var(--card))] to-[color-mix(in_oklab,var(--accent-purple)_35%,var(--card))] text-xs font-semibold text-foreground">
                      AN
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden min-w-[82px] text-left leading-tight 2xl:block">
                    <div className="text-xs font-medium text-foreground">ANCAR</div>
                    <div className="mt-0.5 text-[10px] text-muted-foreground">Monitoramento</div>
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
          className={`${controlClass} min-w-[166px] max-w-[230px] justify-between`}
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

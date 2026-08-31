import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Search, Store } from "lucide-react";
import { dashboardService } from "@/services/dashboardService";
import type { Shopping } from "@/types";
import { ShoppingCard } from "@/components/ShoppingCard";
import { LoadingBlock, PageHeader } from "@/components/ui-helpers";
import { InternalPage } from "@/components/InternalPage";
import { Input } from "@/components/ui/input";
import { useDashboardRuntime } from "@/contexts/dashboard-runtime-context";

export const Route = createFileRoute("/shoppings")({
  head: () => ({ meta: [{ title: "Shoppings | ANCAR CAG" }] }),
  component: ShoppingsPage,
});

function ShoppingsPage() {
  const { tick } = useDashboardRuntime();
  const [items, setItems] = useState<Shopping[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    let alive = true;
    setLoading(true);
    dashboardService
      .getShoppings()
      .then((result) => {
        if (!alive) return;
        setItems(result);
        setError(null);
      })
      .catch((err: unknown) => {
        if (alive) setError(err instanceof Error ? err.message : "Falha ao consultar os shoppings.");
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [tick]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (shopping) =>
        shopping.code.toLowerCase().includes(q) ||
        shopping.name.toLowerCase().includes(q) ||
        shopping.city.toLowerCase().includes(q),
    );
  }, [items, query]);

  return (
    <InternalPage>
      <PageHeader
        eyebrow="Portfólio monitorado"
        title="Shoppings"
        subtitle="Cadastro ativo das CAGs integradas ao WebCTRL e ao PostgreSQL ANCAR."
        icon={Store}
      />

      <div className="panel p-3">
        <div className="relative max-w-lg">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar por nome, sigla ou cidade"
            className="h-10 bg-background/55 pl-9"
          />
        </div>
      </div>

      {loading ? (
        <LoadingBlock h={500} />
      ) : error ? (
        <div className="panel p-6 text-sm text-[var(--accent-red)]">{error}</div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {filtered.map((shopping) => (
            <ShoppingCard key={shopping.id} shopping={shopping} />
          ))}
        </div>
      )}
    </InternalPage>
  );
}

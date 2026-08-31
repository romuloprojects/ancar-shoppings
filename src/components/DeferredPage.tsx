import { Construction, Database } from "lucide-react";
import { InternalPage } from "@/components/InternalPage";
import { PageHeader } from "@/components/ui-helpers";

export function DeferredPage({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <InternalPage>
      <PageHeader
        eyebrow="Próxima etapa"
        title={title}
        subtitle={description}
        icon={Construction}
      />
      <section className="panel grid min-h-[360px] place-items-center p-8 text-center">
        <div className="max-w-xl">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl border border-[var(--accent-cyan)]/25 bg-[var(--accent-cyan)]/8 text-[var(--accent-cyan)]">
            <Database className="h-6 w-6" />
          </div>
          <h2 className="mt-5 text-lg font-semibold">Sem dados fictícios nesta versão</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Esta tela será moldada quando a fonte de dados correspondente estiver definida. A Visão Geral e a listagem de Shoppings já utilizam a integração real ANCAR.
          </p>
        </div>
      </section>
    </InternalPage>
  );
}

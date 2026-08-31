import { createFileRoute } from "@tanstack/react-router";
import { DeferredPage } from "@/components/DeferredPage";
export const Route = createFileRoute("/configuracoes")({ component: () => <DeferredPage title="Configurações" description="DBIDs, credenciais WebCTRL e parâmetros técnicos permanecem no backend e no PostgreSQL, não no navegador. Esta tela será criada apenas para configurações de aplicação apropriadas ao frontend." /> });

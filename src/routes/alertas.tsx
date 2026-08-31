import { createFileRoute } from "@tanstack/react-router";
import { DeferredPage } from "@/components/DeferredPage";
export const Route = createFileRoute("/alertas")({ component: () => <DeferredPage title="Alertas" description="Os insights básicos já são derivados na Visão Geral. A central de alertas será implementada quando fecharmos regras, persistência e ciclo de tratamento." /> });

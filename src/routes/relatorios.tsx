import { createFileRoute } from "@tanstack/react-router";
import { DeferredPage } from "@/components/DeferredPage";
export const Route = createFileRoute("/relatorios")({ component: () => <DeferredPage title="Relatórios" description="Os relatórios serão definidos após estabilizarmos o contrato histórico e os indicadores efetivamente utilizados pela operação ANCAR." /> });

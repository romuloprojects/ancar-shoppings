import { createFileRoute } from "@tanstack/react-router";
import { DeferredPage } from "@/components/DeferredPage";
export const Route = createFileRoute("/analises")({ component: () => <DeferredPage title="Análises" description="Será construída a partir do histórico real de telemetry_realtime e das métricas efetivamente disponíveis em cada shopping." /> });

import { createFileRoute } from "@tanstack/react-router";
import { DeferredPage } from "@/components/DeferredPage";
export const Route = createFileRoute("/esg")({ component: () => <DeferredPage title="ESG" description="Não há fonte ESG confiável na ingestão atual. A tela permanece reservada até existirem dados reais de energia, emissões, água ou outras métricas ESG." /> });

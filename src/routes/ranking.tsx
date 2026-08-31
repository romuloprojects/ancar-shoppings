import { createFileRoute } from "@tanstack/react-router";
import { DeferredPage } from "@/components/DeferredPage";
export const Route = createFileRoute("/ranking")({ component: () => <DeferredPage title="Ranking" description="O ranking operacional real já está disponível na Visão Geral. Esta rota será evoluída quando definirmos comparações históricas e critérios por tecnologia de CAG." /> });

import { createFileRoute } from "@tanstack/react-router";
import { DeferredPage } from "@/components/DeferredPage";
export const Route = createFileRoute("/shoppings/$shoppingId")({ component: () => <DeferredPage title="Detalhe do Shopping" description="O comportamento do shopping selecionado já pode ser acompanhado na Visão Geral. A página dedicada será desenhada na próxima etapa com base nos dados reais disponíveis." /> });

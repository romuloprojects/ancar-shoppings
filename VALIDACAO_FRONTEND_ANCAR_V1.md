# Validação ANCAR Frontend V1

**Resultado: 37 PASS / 0 FAIL**

- PASS — arquivo src/routes/index.tsx
- PASS — arquivo src/services/dashboardService.ts
- PASS — arquivo src/types/live.ts
- PASS — arquivo src/config.ts
- PASS — arquivo src/components/ShoppingCard.tsx
- PASS — arquivo src/components/TopBar.tsx
- PASS — arquivo vite.config.ts
- PASS — refresh frontend 5 minutos
- PASS — API portfolio configurada
- PASS — API shopping/history configurada
- PASS — API base n8n default
- PASS — sem Todos os Shoppings
- PASS — topo dinâmico possui seletor shopping
- PASS — topo possui 5 KPI cards — achado=5
- PASS — gráfico Comportamento da CAG
- PASS — bloco fixo Ranking dos Shoppings
- PASS — bloco fixo Visão do Portfólio
- PASS — bloco fixo Mapa / Distribuição
- PASS — bloco fixo Oportunidades / Insights
- PASS — ESG removido da Visão Geral
- PASS — tratamento CAG mista
- PASS — COP global não inventado
- PASS — menu reduzido a visão geral e shoppings
- PASS — sem mocks na camada ativa
- PASS — hosts produção no vite
- PASS — nenhuma chave WebCTRL no frontend
- PASS — workflow API frontend disponível
- PASS — contrato histórico kw_cag
- PASS — contrato histórico tr_total
- PASS — contrato histórico kw_tr
- PASS — contrato histórico temperature_c
- PASS — contrato histórico kw_aux
- PASS — contrato histórico balance_deviation_pct
- PASS — contrato histórico data_quality_pct
- PASS — CORS API
- PASS — imports locais resolvidos
- PASS — quantidade TS/TSX analisável — 90

## Observação de build

A validação de sintaxe TypeScript/TSX foi executada com o compilador TypeScript global via `transpileModule` em toda a árvore. O `npm install` não concluiu neste ambiente, portanto o build Vite completo deve ser confirmado no Easypanel, onde as dependências são instaladas normalmente.
# Validação Frontend ANCAR V3.2

**Resultado estático:** 25 PASS / 0 FAIL

## Escopo

Versão baseada na V3.1, com foco em compactação por viewport: evitar scroll de página em desktop/notebook e deslocar excesso de conteúdo para scroll interno, paginação, tabs ou expansão local.

## Verificações

- PASS — Arquivos TS/TSX presentes — 88
- PASS — Imports locais resolvidos — 192 imports; 0 ausentes
- PASS — Sem MW/MWh no frontend — 0 referências
- PASS — Sem hardcode dos shoppings atuais — listas dinâmicas pela API
- PASS — kW/TR com 2 casas mínimas — formatKwTr
- PASS — kW/TR com 2 casas máximas — formatKwTr
- PASS — Sem formatação kW/TR em 3 casas
- PASS — Compactação aplicada: index.tsx — overview-dashboard, overview-primary-grid, overview-portfolio-grid, overview-ranking-list, overview-insights-list
- PASS — Compactação aplicada: shoppings.tsx — compact-shoppings-page, compact-scroll-region
- PASS — Compactação aplicada: shoppings.$shoppingId.tsx — compact-detail-page, compact-tabs, compact-tab-content
- PASS — Compactação aplicada: ranking.tsx — compact-ranking-page, compact-fill-panel, ranking-metric-strip
- PASS — Compactação aplicada: analises.tsx — compact-analysis-page, compact-fill-panel, analysis-unit-selector
- PASS — Compactação aplicada: alertas.tsx — compact-alerts-page, compact-fill-panel
- PASS — Compactação aplicada: esg.tsx — compact-esg-page, compact-fill-panel
- PASS — Compactação aplicada: relatorios.tsx — compact-reports-page, reports-workspace, compact-scroll-region
- PASS — Compactação aplicada: configuracoes.tsx — compact-settings-page, compact-tabs, compact-tab-content
- PASS — CSS compacto: @media (min-width: 1280px) and (min-height: 720px)
- PASS — CSS compacto: height: calc(100svh - 4rem)
- PASS — CSS compacto: overflow: hidden
- PASS — CSS compacto: .compact-scroll-region
- PASS — CSS compacto: .overview-dashboard
- PASS — CSS compacto: .overview-portfolio-grid
- PASS — TopBar preserva controles em notebook — busca cede espaço; controles permanecem a partir de xl
- PASS — Portfólio usa paginação compacta — 3 cards por página na Visão Geral
- PASS — Host Vite correto

## Validação sintática

Os arquivos TS/TSX foram analisados com o parser do TypeScript 5.8.3 instalado no ambiente. O resultado separado desta etapa foi **88 arquivos / 0 erros de parsing**.

## Responsividade / composição

- Desktop/notebook (>=1280 px e >=720 px de altura): o `main` usa a altura útil da viewport e evita scroll da página.
- Visão Geral usa três faixas: KPIs, gráfico+ranking e portfólio+mapa+insights+qualidade.
- Ranking, insights, listas de shoppings, tabelas, alertas e áreas extensas usam overflow interno.
- Análises mantém o seletor de unidades em área própria rolável para não crescer indefinidamente quando novos shoppings forem cadastrados.
- Configurações e Detalhe usam tabs com conteúdo rolável internamente.
- Tablet/mobile continuam com scroll natural da página quando necessário para preservar legibilidade.

## Limitação desta validação

O build Vite completo e testes visuais automatizados em navegador não foram executados porque as dependências npm não estão disponíveis no ambiente e `npm install --offline` falha por ausência de pacotes no cache. A validação realizada cobre parsing TS/TSX, imports locais, regras de unidade, marcadores de responsividade/compactação e integridade estrutural. O build no Easypanel continua sendo a confirmação final de renderização.

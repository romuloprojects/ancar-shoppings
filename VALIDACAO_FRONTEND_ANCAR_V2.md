# Validação — ANCAR Frontend V2

## Objetivo

Esta versão foi reconstruída **sobre o ZIP original `ancar-energia-hub-main(1).zip`**, preservando a estética e as páginas existentes. Foram aplicadas somente as mudanças necessárias para a Visão Geral consumir os dados reais do backend ANCAR.

## Arquivos visuais preservados do original

Os seguintes arquivos foram comparados por SHA-256 e permanecem idênticos ao frontend original:

- `src/components/AppSidebar.tsx`
- `src/components/KpiCard.tsx`
- `src/components/InsightCard.tsx`
- `src/components/BrazilMap.tsx`
- `src/layouts/AppLayout.tsx`
- `src/styles.css`
- `src/routes/shoppings.tsx`
- `src/routes/shoppings.$shoppingId.tsx`
- `src/routes/ranking.tsx`
- `src/routes/analises.tsx`
- `src/routes/esg.tsx`
- `src/routes/alertas.tsx`
- `src/routes/relatorios.tsx`
- `src/routes/configuracoes.tsx`
- `src/services/dashboardService.ts`

Portanto, as páginas que haviam sido substituídas por placeholders na V1/V1.1 voltaram ao código original.

## Alterações intencionais

- `src/routes/index.tsx`
  - cards superiores agora exibem o shopping selecionado;
  - gráfico principal usa histórico real da CAG;
  - ranking, portfólio, mapa e insights continuam em contexto de portfólio;
  - composição e grids do frontend original foram preservados.
- `src/components/TopBar.tsx`
  - seletor real de shopping, sem opção “Todos os Shoppings”;
  - período 24h / 7d / 30d conectado ao gráfico.
- `src/components/ShoppingCard.tsx`
  - mantém o mesmo desenho;
  - substitui ESG fictício por qualidade real dos dados;
  - distingue “Eficiência” de “Intensidade” para CAG mista.
- `src/components/PortfolioHealthCard.tsx`
  - novo card de qualidade/disponibilidade, ocupando o espaço antes reservado ao ESG sem fonte.
- `src/services/liveDashboardService.ts`
  - integração com os dois webhooks do workflow ANCAR 10.
- `src/types/live.ts`
  - contrato de dados do backend.
- contexto/runtime
  - shopping selecionado e período compartilhados entre TopBar e Visão Geral.
- `src/config.ts`
  - atualização automática a cada 5 minutos.
- `vite.config.ts`
  - único host permitido: `ancar-shoppings.facilities-ai.com.br`.

## API utilizada

- `GET /webhook/ancar-dashboard-portfolio-v1`
- `GET /webhook/ancar-dashboard-shopping-v1?shoppingId=BLD&period=24h`

Base padrão:

`https://n8n.facilities-ai.com.br/webhook`

Pode ser sobrescrita por `VITE_ANCAR_API_BASE_URL`.

## Validações executadas

- 32 verificações estruturais: **32 PASS / 0 FAIL**.
- 92 arquivos `.ts` / `.tsx` analisados pelo parser do TypeScript: **0 erros de sintaxe**.
- 187 imports locais verificados: **0 imports ausentes**.
- ausência de `2see.io`: **PASS**.
- `allowedHosts` contém somente `ancar-shoppings.facilities-ai.com.br`: **PASS**.
- refresh de 5 minutos: **PASS**.
- opção “Todos os Shoppings” removida: **PASS**.
- `DeferredPage` da versão anterior não existe nesta versão: **PASS**.
- serviços/páginas originais fora da Visão Geral foram preservados: **PASS**.

O detalhamento máquina-legível das verificações está em `VALIDACAO_FRONTEND_ANCAR_V2.json`.

## Limitação da validação no ambiente

O `vite build` completo não pôde ser executado porque este ambiente não resolve `registry.npmjs.org`, portanto as dependências do projeto não puderam ser instaladas. A validação realizada cobre sintaxe TypeScript/TSX, imports locais, integridade estrutural, comparação com o original e contrato estático da integração. O build do Easypanel será a validação final do bundler/runtime.

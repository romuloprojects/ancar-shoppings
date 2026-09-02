# ANCAR Frontend V3.6 — atualização silenciosa, gráficos e ajuste da Visão Geral

## Atualização automática

- Polling global alterado de **5 minutos para 3 minutos**.
- O polling continua sem recarregar a página: apenas o estado React é atualizado quando uma resposta nova chega.
- Ao voltar para uma aba que ficou em segundo plano, o frontend verifica o tempo desde o último polling e atualiza silenciosamente se já passaram 3 minutos.
- Falhas transitórias de polling preservam o último conjunto de dados válido nas telas principais, evitando skeleton/piscada ou limpeza do dashboard.
- A tela de Configurações continua sem recarregar automaticamente o formulário editável; o polling do portfólio não sobrescreve campos em edição.
- O TopBar não usa mais o horário do polling para representar a idade dos dados.
- Novo padrão: `🟢 Última atualização HH:mm`, calculado a partir da última telemetria real (`latest.collectedAt`, mapeada para `lastUpdate`).
- Quando a última coleta não existe, o texto usa `🟢 Última atualização —`.

## Gráficos 24h / 7d / 30d

O workflow ANCAR 10 já entrega histórico ordenado e agregado em:

- 24h: buckets de 5 minutos;
- 7d: buckets de 30 minutos;
- 30d: buckets de 120 minutos.

A V3.6 mantém esses cálculos do backend e corrige a apresentação no frontend:

- normalização defensiva do histórico recebido: timestamps inválidos são descartados, duplicatas são consolidadas e a série é ordenada;
- eixo X passou a usar escala temporal real em vez de espaçamento puramente categórico;
- domínio do eixo representa o período solicitado completo (24h / 7d / 30d);
- lacunas relevantes entre buckets recebem um separador nulo para não desenhar linhas artificiais atravessando períodos sem telemetria;
- interpolação `monotone` foi substituída por `linear` para não suavizar/curvar artificialmente telemetria discreta;
- linhas não conectam lacunas (`connectNulls={false}`);
- rótulos do eixo são coerentes com o período: 24h usa hora/minuto; 7d e 30d usam data;
- tooltip continua mostrando data e hora completas;
- período foi sincronizado com o estado global nas telas de Detalhe, Análises e Relatórios, além de Visão Geral e Energia/Emissões.

Rotas revisadas:

- Visão Geral;
- Detalhe do Shopping;
- Análises;
- Energia e Emissões;
- Relatórios.

## Visão Geral — faixa inferior

- A faixa inferior recebeu um pequeno aumento de altura em desktops/notebooks com até 860 px de altura.
- A divisão de altura dessa faixa passou de `.82fr` para `.94fr`, compensada na faixa principal para manter a página dentro da viewport.
- O mapa ganhou mais altura útil nessa faixa (`min(27svh, 235px)`).
- O gauge de Qualidade dos Dados foi reduzido de 82 px para 76 px no padrão.
- O valor central do gauge foi reduzido de 23 px para 19 px; em telas baixas, usa 15 px.
- O objetivo é manter mapa, gauge, textos e linhas de qualidade totalmente legíveis sem sobreposição.

## Arquivos principais alterados

- `src/config.ts`
- `src/hooks/useAutoRefresh.ts`
- `src/components/TopBar.tsx`
- `src/components/PortfolioHealthCard.tsx`
- `src/services/liveDashboardService.ts`
- `src/utils/history.ts` (novo)
- `src/routes/index.tsx`
- `src/routes/shoppings.$shoppingId.tsx`
- `src/routes/analises.tsx`
- `src/routes/esg.tsx`
- `src/routes/relatorios.tsx`
- `src/routes/shoppings.tsx`
- `src/routes/ranking.tsx`
- `src/routes/alertas.tsx`
- `src/routes/configuracoes.tsx`
- `src/styles.css`
- scripts de validação e contrato visual.

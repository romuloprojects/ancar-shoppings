# ANCAR Frontend V4.8 — Resiliência de Histórico

## Objetivo
Eliminar o estado intermitente de "Sem dados disponíveis" quando um gráfico já possuía histórico válido.

## Alterações

1. Cache de último histórico válido em memória da sessão, isolado por `shopping + período`.
2. Uma resposta de polling com `history: []` não substitui mais uma série válida já exibida.
3. Quando há fallback, também é preservado o `summary` correspondente ao último histórico válido.
4. `latest`, health, KPIs e demais dados atuais continuam vindo da resposta nova; somente a parte histórica é preservada.
5. Se não houver cache e existir `latestCollectedAt` dentro da janela solicitada com histórico vazio, a resposta é considerada inconsistente e gera erro em vez de "Sem dados".
6. Corrigida a race condition da Visão Geral na troca de shopping/período: o primeiro render antes do `useEffect` agora é tratado como transição/loading, nunca como ausência de histórico.
7. Novo contrato opcional `historyDiagnostics` para diagnóstico da API.
8. Versão do frontend atualizada para 4.8.0.

## Não alterado
- polling: 3 minutos;
- atualização silenciosa;
- gráficos 24h/7d/30d;
- comparativos;
- layout de 6 KPIs;
- Portfólio 3x2;
- ranking e metas;
- cálculos do Workflow 01.

# ANCAR — Frontend V4.5

## Objetivo
Evoluir a faixa superior da Visão Geral para seis KPIs compactos, retirar os sparklines laterais, incluir Temperatura Externa e exibir comparativos reais do período. Acrescentar também desvio percentual contra a meta kW/TR no Ranking dos Shoppings.

## KPIs da Visão Geral
A V4.5 possui 6 cards em desktop:
1. Potência CAG
2. Produção Térmica
3. Eficiência da CAG / Intensidade Elétrica
4. Chillers Ativos
5. Periféricos
6. Temperatura Externa

Os cards passaram de 100 px (override da V4.4) para 92 px e os sparklines laterais foram removidos. O valor atual continua sendo a telemetria mais recente.

## Comparativos
A linha inferior de cada KPI usa a média da janela selecionada contra a média da janela imediatamente anterior equivalente:
- 24h: `vs ontem` — últimas 24h contra as 24h anteriores;
- 7d: `vs semana passada` — últimos 7 dias contra os 7 dias anteriores;
- 30d: `vs mês anterior` — últimos 30 dias contra os 30 dias anteriores.

Potência, Produção, kW/TR, Chillers e Periféricos usam variação percentual. Temperatura Externa usa diferença absoluta em °C, pois variação percentual em Celsius não é uma comparação fisicamente adequada.

Se não houver dados suficientes da janela anterior, o card exibe `Sem comparativo` e não inventa percentual.

## Ranking vs meta
Cada shopping que possui `targetKwTr` configurado e leitura atual válida de kW/TR exibe uma segunda linha:
- verde: percentual abaixo da meta kW/TR;
- vermelho: percentual acima da meta kW/TR;
- verde: `0,0% na meta kW/TR` quando equivalente.

O indicador é exibido independentemente da métrica usada para ordenar o Ranking; o texto identifica explicitamente que a referência é a meta kW/TR.

## Backend requerido
Os comparativos dependem do workflow:
`ANCAR_10_API_FRONTEND_V3_COMPARATIVOS.json`

Ele preserva os endpoints existentes e acrescenta ao payload de `/ancar-dashboard-shopping-v1`:
- `comparison.current`
- `comparison.previous`

Campos de cada janela:
- `avgKw`
- `avgTr`
- `avgKwTr`
- `avgAuxKw`
- `avgTemperatureC`
- `avgActiveChillers`

Não há chamadas adicionais por KPI. O endpoint faz uma única consulta para até duas janelas equivalentes (máximo de 60 dias quando `period=30d`).

## Compatibilidade
- Workflow 00: sem alteração.
- Workflow 00A: sem alteração.
- Workflow 01: sem alteração.
- Workflow 11: sem alteração.
- Banco: sem alteração de schema.
- Frontend funciona com Workflow 10 V2, mas mostrará `Sem comparativo` até a V3 estar ativa.
- ITA/MAD, sem sensor externo, exibem `—` no KPI Temperatura Externa.

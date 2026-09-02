# Validação ANCAR Frontend V4.5

## Resultado
PASS nas validações executáveis deste ambiente.

### `npm run validate:source`
- 90 arquivos TS/TSX analisados
- 0 erros de transpile/sintaxe
- 6 KPIs compactos presentes
- Temperatura Externa presente
- sparklines removidos do KpiCard
- contrato de comparação presente
- ranking vs meta presente

### `npm run validate:history`
PASS para 24h, 7d e 30d.

### `npm run validate:comparison`
PASS para:
- rótulos `vs ontem`, `vs semana passada`, `vs mês anterior`;
- variação percentual positiva/negativa;
- proteção contra base anterior zero;
- diferença absoluta de temperatura em °C;
- desvio abaixo/acima da meta kW/TR.

### `npm run validate:kpi-layout`
PASS em 8 viewports:
- 1024×650
- 1152×700
- 1280×720
- 1366×768
- 1524×722
- 1792×862
- 1905×902
- 1920×1080

Resultado: 6 cards, altura 92 px, sem overflow interno.

### `npm run validate:portfolio-layout`
PASS em 9 viewports. A regra V4.4 da faixa inferior foi preservada: 6 ShoppingCards em 3×2, sem scroll interno e quatro painéis inferiores com 408 px.

### `npm run validate:visual`
- 36 página/resolução
- 0 falhas visuais

## Workflow 10 V3
Validação estática do JSON:
- 9 nodes preservados;
- conexões preservadas em relação à V2;
- webhooks preservados;
- parâmetros `$1`, `$2`, `$3`, `$4` preservados;
- CTE `comparison` presente;
- janela de comparação 2× o período presente;
- campos current/previous presentes;
- `refreshIntervalMs=180000` no portfólio.

## Limitação do ambiente
`npm run build` não pôde ser concluído porque o ZIP não contém `node_modules` e o ambiente atual não consegue instalar dependências externas. O comando retorna `vite: not found`. O build final deve ser confirmado no Easypanel, onde a instalação npm ocorre normalmente.

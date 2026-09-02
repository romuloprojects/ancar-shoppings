# Validação Frontend ANCAR V3.9

## Objetivo
Corrigir de forma estrutural o corte do mapa e a compressão dos quatro cards inferiores da Visão Geral, com foco na viewport 1791×857 observada em produção.

## Diagnóstico confirmado
O problema não era apenas falta de `max-height`. O componente `BrazilMap` usava SVG com largura total e proporção intrínseca 420×360. O SVG e a legenda compartilhavam um wrapper dentro de um painel com `overflow: hidden`. Aumentar apenas o `max-height` não garantia espaço para a legenda e podia continuar cortando a parte inferior do mapa.

## Correção V3.9
- 1280+ / 820–860 px de altura: faixa inferior = **320 px**.
- 1280+ / 720–819 px: faixa inferior = **260 px**.
- 1280+ / acima de 860 px: faixa inferior = **330 px**.
- O mapa passou a usar `portfolio-map-root` como flex-column.
- O SVG passou a usar `flex: 1 1 0`, `height: 100%`, `min-height: 0` e sem `max-height` arbitrário.
- A legenda passou a ser `portfolio-map-legend`, com espaço próprio não flexível.
- Gauge de Qualidade dos Dados = **56 px**.
- Número central = **11 px** (10 px em viewports mais baixas).

## Simulação em Chromium
Foi criada uma validação geométrica dedicada em `scripts/validate-overview-layout.py`, usando Chromium headless e a geometria real do mapa do Brasil (viewBox 420×360).

### 1791×857
- área útil da Visão Geral: 753 px
- gráfico/ranking: 301 px
- quatro cards inferiores: **320 px**
- card do mapa: 320 px
- área interna do mapa: 274 px
- SVG: 240 px
- legenda: 34 px
- SVG termina antes da legenda: **PASS**
- legenda termina dentro do card: **PASS**
- gauge: 56×56 px

### 1366×768
- faixa inferior: **260 px**
- mapa e legenda integralmente dentro do painel: **PASS**

### 1920×1080
- faixa inferior: **330 px**
- mapa e legenda integralmente dentro do painel: **PASS**

## Validações executadas
`npm run validate`:
- 89 TS/TSX analisados
- 0 erros sintáticos
- histórico 24h / 7d / 30d: PASS
- validação geométrica da Visão Geral: PASS
- 36 cenários de validação visual: 0 falhas

## Build completo
`npm run build` não pôde ser concluído neste ambiente porque as dependências npm do projeto não estão instaladas (`vite: not found`). Uma tentativa de instalar as dependências neste ambiente não concluiu dentro do tempo disponível. Portanto, o build final TanStack/Vite ainda deve ser confirmado no Easypanel.

A validação geométrica desta revisão não depende do antigo contrato visual: ela executa Chromium e mede explicitamente a faixa inferior, mapa, SVG, legenda e gauge.

# ANCAR Frontend V3.9 — correção estrutural da faixa inferior

## Motivo
As versões anteriores aumentavam principalmente `max-height` do SVG do mapa. Isso não resolvia o corte porque o SVG mantinha a proporção intrínseca 420×360 pela largura e dividia o mesmo wrapper com a legenda; o painel tinha `overflow: hidden`.

## Correção
- Faixa inferior em viewport 1280+ / 820–860 px: altura explícita de 320 px.
- Faixa inferior em 720–819 px: 260 px.
- Em alturas superiores a 860 px: faixa inferior de 330 px.
- O conteúdo do mapa agora é um flex-column real.
- O SVG usa o espaço restante do card (`flex: 1 1 0`) depois do título/legenda e não depende mais de `max-height` arbitrário.
- Gauge de Qualidade dos Dados reduzido para 56 px.
- Valor central reduzido para 11 px; em notebooks mais baixos chega a 10 px.

## Objetivo visual
Garantir que mapa, legenda e conteúdo do card de qualidade permaneçam integralmente dentro dos quatro cards inferiores, especialmente em 1791×857.

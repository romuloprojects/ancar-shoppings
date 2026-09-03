# ANCAR Frontend V4.2 — Portfólio governa a faixa inferior

## Objetivo
Restaurar o comportamento visual esperado da faixa inferior da Visão Geral: a **Visão do Portfólio** define a altura da linha com 6 shoppings por página em duas linhas de 3 cards, sem scroll interno e sem reduzir tipografia/métricas. Mapa / Distribuição, Oportunidades / Insights e Qualidade dos Dados acompanham exatamente essa altura.

## Alterações
- Mantido `portfolioPageSize = 6`.
- Portfólio desktop: grade 3 × 2.
- Cada ShoppingCard mantém altura mínima de 146 px e o tamanho atual das informações.
- Removido o comportamento que comprimía a faixa inferior para caber obrigatoriamente na viewport.
- `dashboard-main` pode usar rolagem vertical da página em viewports mais baixas; o Portfólio não recebe scroll interno.
- A faixa inferior usa altura `auto`, determinada naturalmente pelo Portfólio.
- Mapa, Insights e Qualidade usam `align-self: stretch` e ficam com a mesma altura da track.
- Mapa passa a aproveitar a nova altura; SVG usa flex e mínimo de 280 px.
- Qualidade dos Dados acompanha a altura integral da linha; gauge 76 px com valor central mantido pequeno (11 px).
- Polling silencioso de 3 minutos e demais lógicas V3.6+ preservadas.

## Validação adicional
Adicionado `npm run validate:portfolio-layout`, que abre Chromium e valida o CSS V4.2 real em 7 viewports.

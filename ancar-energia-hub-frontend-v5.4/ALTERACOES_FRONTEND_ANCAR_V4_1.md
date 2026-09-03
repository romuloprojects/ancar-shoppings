# ANCAR Frontend V4.1 — faixa inferior governada pelo Portfólio

## Causa corrigida

A compactação anterior introduziu `height: 100%` nos `ShoppingCard` dentro de `overview-portfolio-cards`. Em uma grade com duas linhas, isso fazia cada card tentar ocupar toda a altura disponível do container. A segunda linha ficava abaixo da primeira e o Portfólio passava a usar scroll interno, reduzindo visualmente a faixa inferior.

No frontend original, o comportamento era diferente: os 6 cards da página formavam duas linhas naturais e a altura desse conteúdo participava do cálculo da altura da linha do grid.

## Regra V4.1

- `Visão do Portfólio` é o elemento mestre da altura da faixa inferior.
- 6 shoppings por página são mostrados em 3 colunas × 2 linhas.
- Não há scroll interno no Portfólio para esses 6 cards.
- A terceira linha de `overview-dashboard` volta a ser `auto`: sua altura é determinada pelo conteúdo do Portfólio.
- `Mapa / Distribuição`, `Oportunidades / Insights` e `Qualidade dos Dados` apenas usam `height: 100%` para acompanhar exatamente a altura calculada pelo Portfólio.
- O mapa continua flexível dentro do card, reservando espaço próprio para a legenda e sem corte.

## Altura dos ShoppingCards por viewport

- 650–719 px de altura CSS: 116 px por card.
- 720–819 px: 126 px.
- 820–899 px: 136 px.
- >= 900 px: 146 px (proporção original).

Essa progressão permite manter as duas linhas visíveis sem reintroduzir rolagem de página na faixa principal.

## Preservado

- dados reais e APIs;
- polling silencioso a cada 3 minutos;
- `🟢 Última atualização HH:mm` baseado em `collectedAt`;
- gráficos 24h / 7d / 30d normalizados;
- 6 cards por página;
- mapa geográfico e localizações mestre;
- regras de unidades e configurações.

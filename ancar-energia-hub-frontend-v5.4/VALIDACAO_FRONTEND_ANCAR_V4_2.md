# Validação ANCAR Frontend V4.2

## Resultado
**PASS**

Comando executado:

`npm run validate`

Resultados:
- Fonte TypeScript/TSX: **89 arquivos / 0 erros**.
- Histórico 24h / 7d / 30d: **PASS**.
- Portfólio/faixa inferior em Chromium: **7 viewports / PASS**.
- Validação visual geral: **36 cenários / 0 falhas**.

## Critérios específicos do Portfólio
Em todas as 7 viewports testadas:
- 6 shoppings renderizados por página.
- 2 linhas de 3 cards.
- sem scroll interno no card Visão do Portfólio.
- ShoppingCard com altura mínima de 146 px, sem redução de tipografia/métricas.
- Portfólio, Mapa, Insights e Qualidade com a mesma altura.
- mapa e legenda inteiros dentro do card.
- gauge da Qualidade proporcional e valor central <= 11,5 px.

## Medições principais
| Viewport | Altura Portfólio | Mapa desenhado | Alturas laterais |
|---|---:|---:|---|
| 1280×680 | 408 px | 236×204 px | iguais |
| 1366×768 | 408 px | 256×222 px | iguais |
| 1434×690 | 408 px | 273×236 px | iguais |
| 1536×760 | 408 px | 297×257 px | iguais |
| 1792×862 | 408 px | 349×302 px | iguais |
| 1902×892 | 408 px | 349×302 px | iguais |
| 1920×1080 | 514 px | 388×336 px | iguais |

Em viewports mais baixos a página pode ganhar uma pequena rolagem vertical. Isso é intencional: a prioridade da V4.2 é não reduzir os ShoppingCards e não criar scroll interno no Portfólio.

## npm build
Também foi executado `npm run build`. Ele não pôde iniciar porque este ambiente não possui as dependências locais do Vite (`vite: not found`). Uma tentativa de `npm install` foi feita, mas o ambiente não resolve o registry npm por DNS. Portanto, o build Vite completo deve ser confirmado no ambiente de implantação, onde as dependências são instaladas.

A validação `npm run validate` é autocontida e foi concluída integralmente neste ambiente.

# ANCAR Frontend V3.3 — Validação final

## Objetivo

Aplicar ao frontend real o conceito visual homologado: dashboard compacto por viewport, componentes agrupados, alturas controladas e excesso de conteúdo tratado preferencialmente por scroll/paginação interna.

## Páginas revisadas

- Visão Geral
- Shoppings
- Detalhe do Shopping
- Ranking
- Análises
- Alertas
- Energia e Emissões
- Relatórios
- Configurações

## Contrato visual aplicado

- Desktop/notebook prioriza o conteúdo principal dentro da altura útil da viewport.
- Visão Geral em três faixas: KPIs; gráfico + ranking; portfólio + mapa + insights + qualidade.
- Ranking, listas, cards de grande volume e filas usam overflow interno quando necessário.
- Tablet/mobile mantém responsividade progressiva e pode usar scroll natural quando a leitura exigir.
- Não existem MW/MWh na interface.
- kW/TR usa exatamente duas casas decimais na apresentação.
- Shopping selector não possui “Todos os Shoppings”.
- Shoppings continuam dinâmicos pela API.

## Validação executada via npm

Comando executado:

```bash
npm run validate
```

Resultado:

```text
TS/TSX analisados: 88
Erros: 0
VALIDAÇÃO DE FONTE: PASS

Páginas/resoluções: 27
Falhas visuais: 0
VALIDAÇÃO VISUAL: PASS
```

A validação visual foi executada em Chromium para as 9 páginas em:

- 1366 × 768
- 1440 × 900
- 1920 × 1080

As verificações incluem overflow de viewport e geração de screenshots/contact sheets para conferência visual.

## Build Vite

`npm run build` também foi tentado neste ambiente, mas não pôde ser executado porque o ambiente não possui `node_modules` e não tem resolução de rede para o registry npm. O erro local foi `vite: not found`.

Portanto:

- validação npm de fonte: PASS;
- validação npm visual em Chromium: PASS;
- build Vite/Nitro final: deve ser confirmado no Easypanel, onde as dependências do projeto são instaladas.

## Host

O `vite.config.ts` mantém somente:

```ts
allowedHosts: ["ancar-shoppings.facilities-ai.com.br"]
```

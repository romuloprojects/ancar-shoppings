# Validação ANCAR Frontend V4.3

## Resultado

PASS.

### `npm run validate`

- TypeScript/TSX: 89 arquivos, 0 erros.
- Histórico 24h / 7d / 30d: PASS.
- Validação de Portfólio via npm + Chromium: 12 viewports, PASS.
- Validação visual geral: 36 cenários, 0 falhas.
- CSS parseado com `tinycss2`: 0 erros de sintaxe.

## Viewports validadas para a faixa inferior

- 1024x700
- 1100x700
- 1152x700
- 1200x720
- 1270x720
- 1279x720
- 1280x720
- 1366x768
- 1524x722
- 1792x862
- 1902x892
- 1920x1080

Em todas:

- 6 ShoppingCards presentes;
- exatamente 2 linhas;
- Portfólio = 408 px;
- zero scroll interno no Portfólio;
- nenhum ShoppingCard cortado;
- Mapa, Insights e Qualidade com a mesma altura do Portfólio;
- mapa e legenda dentro do painel;
- scroll vertical disponível no `app-inset` quando a viewport não comporta toda a home.

## Medidas de referência

### 1270x720
- Portfólio: 408 px
- linhas: 2
- scroll Portfólio: 406 / 406 (sem overflow)
- mapa desenhado: ~234 x 202 px
- altura total do conteúdo no app-inset: 883 px, com scroll disponível

### 1524x722
- Portfólio: 408 px
- mapa desenhado: ~294 x 254 px
- quatro painéis inferiores: 408 px

### 1792x862
- Portfólio: 408 px
- mapa desenhado: ~349 x 302 px
- quatro painéis inferiores: 408 px

## Observação sobre build Vite

O ambiente atual não possui `node_modules` e não consegue acessar o registry npm externo. Portanto `npm run build` completo não pode ser executado aqui. O comando `npm run validate`, que não depende da instalação local das dependências da aplicação, foi executado integralmente.

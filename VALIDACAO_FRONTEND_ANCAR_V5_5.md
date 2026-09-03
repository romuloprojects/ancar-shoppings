# Validação Frontend ANCAR V5.5

## Tela de login
Validação específica executada em 7 cenários:
- 1920×1080 — PASS
- 1792×862 — PASS
- 1524×722 — PASS
- 1366×768 — PASS
- 1024×650 — PASS
- 900×700 — PASS
- 390×844 — PASS

Resultado: **0 falhas**, sem overflow/clipping do card de acesso ou do painel institucional.

## Fonte
- 98 arquivos TS/TSX analisados.
- 0 erros de sintaxe/transpilação.

## Regressão funcional
PASS:
- histórico 24h / 7d / 30d;
- comparativos;
- layout dos 6 KPIs;
- portfólio;
- polling silencioso em 3 minutos;
- resiliência do histórico;
- ranking por meta/fallback;
- saúde de aquisição;
- cálculos econômicos.

## Regressão visual das telas internas
- 36 cenários avaliados.
- 0 falhas visuais.

## Tela de relatórios
- 5 viewports avaliados.
- 0 sobreposições.

## Build
O ambiente de validação não possui as dependências locais instaladas (`node_modules`), portanto o `npm run build` completo continua dependente da instalação das dependências no ambiente de implantação. A validação de fonte e contratos do frontend passou integralmente.

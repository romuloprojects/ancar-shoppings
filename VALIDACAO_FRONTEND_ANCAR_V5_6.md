# Validação Frontend ANCAR V5.6

## Tela de login
Validação geométrica e visual executada em 7 cenários:
- 1920×1080 — PASS
- 1792×862 — PASS
- 1524×722 — PASS
- 1366×768 — PASS
- 1024×650 — PASS
- 900×700 — PASS
- 390×844 — PASS

Resultado: **7/7 PASS**, sem overflow/clipping do formulário ou do painel institucional.

## TypeScript
- `src/routes/login.tsx` transpilado isoladamente com TypeScript — PASS.

## Regressão das telas internas
Validações já existentes executadas após a alteração:
- Relatórios V5.4 — PASS em 5 viewports.
- Visão Geral — PASS em 6 viewports.
- Faixa inferior — PASS em 6 viewports.
- KPIs — PASS em 8 viewports.
- Portfólio — PASS em 9 viewports, incluindo alturas abaixo de 650 px.

## Regressão funcional
- Histórico 24h / 7d / 30d — PASS.
- Comparativos — PASS.
- Polling silencioso de 3 minutos — PASS.
- Resiliência de histórico — 12 PASS / 0 FAIL.
- Ranking por meta/fallback — PASS.
- Saúde de aquisição — 10 PASS / 0 FAIL.
- Conceito econômico — PASS.

## Autenticação
A alteração foi somente visual. O fluxo de autenticação, sessão de 12 horas, troca obrigatória de senha e rotas protegidas permanecem inalterados.

## Build
O pacote não contém `node_modules`; portanto o build final continua destinado ao pipeline/Easypanel, como nas versões anteriores.

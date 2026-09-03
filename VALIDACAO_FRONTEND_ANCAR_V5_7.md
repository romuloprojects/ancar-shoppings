# Validação Frontend ANCAR V5.7

## Resultado geral
**PASS — 0 falhas nas validações executadas.**

## Fonte
- 99 arquivos TS/TSX analisados.
- 0 erros de transpile/sintaxe.
- Imports locais preservados.
- Login sem os dois cards flutuantes removidos por homologação.
- TopBar global contém logo 2SEE e botão de tema.

## Login
7/7 viewports PASS:
- 1920×1080
- 1792×862
- 1524×722
- 1366×768
- 1024×650
- 900×700
- 390×844

## Temas claro e escuro
40/40 cenários PASS:
- 10 telas: Visão Geral, Shoppings, Detalhe do Shopping, Ranking, Análises, Energia e Emissões, Alertas, Relatórios, Configurações e Alterar senha;
- 2 temas: dark e light;
- 2 viewports por tela: 1920×1080 e 1366×768.

Checagens específicas PASS:
- ThemeToggle global;
- persistência `ancar-theme`;
- aplicação do tema antes da pintura da página;
- marca 2SEE global e fallback responsivo;
- logo ANCAR adaptativo dark/light;
- mapa com tokens próprios por tema;
- tooltip dos gráficos com tokens de popover;
- gráfico da Visão Geral sem superfície dark hardcoded.

## Regressões preservadas
- Histórico 24h / 7d / 30d — PASS.
- Comparativos — PASS.
- 6 KPIs sem overflow em 8 viewports — PASS.
- Portfólio compacto em 9 viewports — PASS.
- Polling silencioso de 3 minutos — PASS.
- Resiliência do histórico — 12/12 PASS.
- Ranking por meta/fallback — PASS.
- Saúde de aquisição — 10/10 PASS.
- Conceito econômico — PASS.
- Relatórios — 5/5 viewports PASS, sem sobreposição.

## Build
O pacote-base não inclui `node_modules`; por isso o build Vite completo continua reservado ao ambiente de implantação/Easypanel. A validação de fonte, contratos e regressão visual offline passou integralmente.

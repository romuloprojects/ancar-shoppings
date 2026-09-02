# ANCAR Frontend V3.2 — Dashboard compacto por viewport

## Objetivo

Preservar a identidade visual e os dados da V3.1, mas reorganizar a aplicação para priorizar a visualização do máximo de conteúdo útil dentro da viewport em desktop/notebook.

## Regra visual adotada

- Evitar scroll vertical da página em desktop/notebook quando a resolução permitir.
- Excesso de conteúdo usa scroll interno, paginação, tabs ou overflow localizado.
- Redução moderada de alturas, paddings e gaps sem transformar a interface em uma grade apertada.
- Tablet e mobile continuam com comportamento progressivo e scroll natural quando necessário.

## Visão Geral

- Cinco KPIs em uma única faixa a partir de desktop.
- Comportamento da CAG e Ranking dividem a segunda faixa.
- Portfólio, Mapa, Insights e Qualidade dividem a faixa inferior.
- Portfólio mostra 3 cards por página para controlar altura.
- Ranking e Insights têm scroll vertical interno.
- Mapa e Qualidade foram compactados para a mesma faixa visual.
- Avisos de API deixam de aumentar a altura da página em desktop.

## Demais telas

- Shoppings: resumo e filtros fixos; grade/tabela em região rolável.
- Detalhe: KPIs compactos e conteúdo organizado em tabs com scroll interno.
- Ranking: métricas em faixa horizontal e ranking em área rolável.
- Análises: gráfico compacto; lista de unidades com scroll interno; resultados no mesmo workspace.
- Alertas: resumos/filtros fixos e lista de condições em scroll interno.
- Energia e Emissões: resumos fixos e tabela rolável.
- Relatórios: filtros fixos e workspace de relatório rolável internamente.
- Configurações: seletor e ações visíveis; tabs com conteúdo rolável internamente.

## Regras preservadas

- kW/TR sempre com 2 casas decimais na apresentação.
- Potência em kW e energia em kWh.
- Sem MW/MWh.
- Sem hardcode dos shoppings BLD/BAN/BPS/CVS/GOL no frontend.
- Novos shoppings continuam vindo dinamicamente da API.
- Host Vite: ancar-shoppings.facilities-ai.com.br.
